"use client";

import { useRouter } from "next/navigation";

interface Props {
  label: string;
  link?: string;
  className?: string;
  onClick?: () => void;
}

export default function BasicButton(props: Props) {
  const router = useRouter();
  const onLinkClick = () => {
    if (!props.link) return;

    if (/^http/.test(props.link)) {
      window.open(props.link);
    } else {
      router.push(props.link);
    }
  };

  return (
    <button
      className={"basic-button uppercase text-sm px-6 py-1 border border-solid rounded-3xl text-white hover:border-basic-yellow hover:text-basic-yellow hover:shadow-basic-yellow hover:shadow-[0_0_0.375rem_#F6C799] transition-all duration-500 delay-75 font-poppins-medium " + props.className}
      onClick={props.onClick || (props.link && onLinkClick) || undefined}
    >
      {props.label}
    </button>
  );
}
