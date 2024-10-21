import React, { FC } from "react";

interface CardProps {
  children: React.ReactNode;
}

const Card: FC<CardProps> = (props) => {
  const { children } = props;

  return (
    <div className="inline-block rounded-[1.25rem] bg-[#E5C9B1] hover:bg-[#EFD4A4]">
      {children}
    </div>
  )
}

export default Card;