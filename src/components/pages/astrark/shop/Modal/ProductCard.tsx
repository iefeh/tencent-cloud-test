import React, { FC } from "react";
import { cn } from "@nextui-org/react"
import { AstrArk } from "@/types/astrark";

interface ProductCardProps {
  children: React.ReactNode;
}

const ProductCard: FC<ProductCardProps & ItemProps<AstrArk.Product>> = ({ item, children }) => {
  return (
    <div>
      <div className={cn([
        "bg-[url('https://d3dhz6pjw7pz9d.cloudfront.net/astrark/shop/bg_item_title.png')] bg-contain bg-no-repeat",
        "px-3 text-lg",
        "mt-3 mb-4 w-60 whitespace-nowrap overflow-hidden text-ellipsis"
      ])}>{item?.name || '--'}</div>
      <div className="w-60 text-sm text-[#6C8090]">
        {children}
      </div>
    </div>
  )
}

export default ProductCard;