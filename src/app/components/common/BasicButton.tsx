import { useRouter } from "next/navigation";

interface Props {
  label: string;
  link?: string;
}

export default function BasicButton(props: Props) {
  const router = useRouter();

  const onLinkClick = () => {
    if (!props.link) return;

    router.push(props.link);
  };

  return (
    <button
      className="uppercase text-sm px-8 py-2 border border-solid rounded-3xl"
      style={{
        borderColor: "#f7f7f7",
      }}
      {...(props.link ? { onClick: onLinkClick } : {})}
    >
      {props.label}
    </button>
  );
}
