import MaxWidthWrapper from "@/components/MaxWidthWrapper"
import ProductReel from "@/components/ProductReel"
import { PRODUCT_CATEGORIES } from "@/config"

type Param = string | string[] | undefined
interface ProductPageProps {
  searchParams: { [key: string]: Param }
}

const _parse = (param: Param) => {
  return typeof param === "string" ? param : undefined
}

const Page = ({ searchParams }: ProductPageProps) => {
  const sort = _parse(searchParams.sort)

  const category = _parse(searchParams.category)

  const label = PRODUCT_CATEGORIES.find(
    ({ value }) => value === category
  )?.label

  return (
    <MaxWidthWrapper>
      <ProductReel
        title={label ?? "Browse high-quality assets"}
        query={{
          category,
          limit: 40,
          sort: sort === "desc" || sort === "asc" ? sort : undefined,
        }}
      />
    </MaxWidthWrapper>
  )
}

export default Page
