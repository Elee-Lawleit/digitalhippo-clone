import { User } from "../payload-types";
import { BeforeChangeHook } from "payload/dist/collections/config/types";
import { Access, CollectionConfig } from "payload/types";

//basically to get the types we can destructure from the args, optional tho
//i mean, kinda, if you don't tell it, ts is gonna throw a fit, or you will have to use "any", so...
const addUser : BeforeChangeHook = ({req, data}) =>{
  const user = req.user as User | null
  return {
    ...data, user: user?.id
  }
}

const ownedAndPurchased: Access = async ({req}) => {
  const user = req.user as User | null

  if(!user) return false
  if(user?.role === "admin") return true

  const {docs: products} = await req.payload.find({
    collection: "products",
    depth: 0, //basically whether to populate sub-docs or not
    where: {
      user: {
        equals: user.id,
      },
    },
  });

  const onwedProductFileIds = products.map((product)=>product.product_files).flat()

    const {docs: orders} = await req.payload.find({
    collection: "orders",
    depth: 2, //basically whether to populate sub-docs or not
    where: {
      user: {
        equals: user.id,
      },
    },
  });

  const purchasedProductFileIds = orders.map((order)=>{
    return order.products.map((product)=>{
      if(typeof product === "string") return req.payload.logger.error("Search depth not sufficient to find purchased file IDs")

      return typeof product.product_files === "string" ? product.product_files : product.product_files.id
    })
  }).filter(Boolean).flat()

  //checking if it's already owned or in an order
  return {
    id: {
      in: [...onwedProductFileIds, ...purchasedProductFileIds],
    },
  };
}

export const ProductFile: CollectionConfig = {
  slug: "product_files",
  admin: {
    hidden: ({user})=> user.role !== "admin",
  },
  hooks: {
    beforeChange: [addUser]
  },
  access: {
    read: ownedAndPurchased,
    update: ({req}) => req.user.role === "admin",
    delete: ({req}) => req.user.role === "admin",
  },
  upload: {
    staticURL: "/product_files",
    staticDir: "product_files",
    mimeTypes: ["image/*", "font/*", "application/postscript"]
  },
  fields: [
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      admin: {
        condition: () => false
      },
      hasMany: false,
      required: true
    }
  ]
}