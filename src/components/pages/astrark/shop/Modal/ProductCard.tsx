import React, { FC } from "react";
import { cn } from "@nextui-org/react"

interface ProductCardProps {
  children: React.ReactNode;
}

const ProductCard: FC<ProductCardProps> = (props) => {
  return (
    <div>
      <div className={cn([
        "bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/astrark/shop/bg_item_title.png')] bg-contain bg-no-repeat",
        "w-[11.25rem] aspect-ratio-[1119/480] flex items-center px-3 text-lg",
        "mt-3 mb-4"
      ])}>Product Name</div>
      <div className="w-60 text-sm text-[#6C8090]">
        {props.children}
      </div>
    </div>
  )
}

export default ProductCard;