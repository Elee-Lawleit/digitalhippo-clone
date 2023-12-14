import { User } from "../payload-types";
import { Access, CollectionConfig } from "payload/types";


//this Access Policy is a function which can either return a Promise<With Result> or can just simply return the result
const isAdminOrHasAccessToImages = () : Access => {
  //this function is the return type for the access policy
  return async ({ req }) => {
    //so we get the types
    const user = req.user as User;

    if (!user) return false;
    if (user.role === "admin") return true;

    return {
      // if image/userId == id of the user requesting
      user: {
        equals: req.user.id,
      },
    };
  };
}

export const Media: CollectionConfig = {
  slug: "media",
  hooks: {
    //relating each image to a user directly, not that the picture belongs product and product belongs to user, but direct
    beforeChange: [
      ({ req, data }) => {
        return { ...data, user: req.user.id };
      },
    ],
  },
  access: {
    read: async ({ req }) => {
      const referer = req.headers.referer;

      // for poeple are who browsing through interface and not admin dashboard
      if (!req.user || !referer?.includes("sell")) {
        return true;
      }

      return await isAdminOrHasAccessToImages()({req});
    },

    //these two are the same
    //won't check if user is on frontend, because it doesn't make sense for these operations anyway
    delete: ({req}) => isAdminOrHasAccessToImages()({req}),
    update: isAdminOrHasAccessToImages()
  },
  admin: {
    hidden: ({ user }) => user.role !== "admin",
  },
  upload: {
    staticURL: "/media",
    staticDir: "media",
    imageSizes: [
      {
        name: "thumbnail",
        width: 400,
        height: 300,
        position: "centre", //payload cms spells it like this
      },
      {
        name: "card",
        width: 768,
        height: 1024,
        position: "centre",
      },
      {
        name: "tablet",
        width: 1024,
        height: undefined, //auto
        position: "centre",
      },
    ],
    mimeTypes: ["image/*"],
  },
  fields: [
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
      hasMany: false,
      admin: {
        condition: () => false,
      },
    },
  ],
};
