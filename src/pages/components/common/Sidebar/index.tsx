import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/router";

interface Props {
  visible?: boolean;
  onClose?: () => void;
}

const routeText = [
  { name: "Home", route: "/" },
  { name: "AstrArk", route: "/AstrArk" },
  { name: "NFT", route: "/NFT" },
  { name: "Loyalty Program", route: "/LoyaltyProgram" },
  { name: "About", route: "/About" },
];

export default function Sidebar({ visible, onClose }: Props) {
  const router = useRouter();
  if (!visible) return null;

  function LoginSegments() {
    let temp = router.route;
    return temp || '/';
}

  return createPortal(
    <div onClick={onClose} className="sidebar max-lg:block fixed left-0 top-0 w-full h-screen bg-black z-10">

      <div className="content flex flex-col font-semakin text-center items-center justify-center h-full">
        {routeText.map((value, index) => (
          <Link
            className={`m-2 transition-all duration-300 hover:text-[#F6C799] text-5xl leading-normal ${LoginSegments() === value.route && 'text-[#F6C799]'}`}
            key={index}
            href={value.route}
          >
            {value.name}
          </Link>
        ))}
      </div>

    </div>,
    document.body
  );
}
