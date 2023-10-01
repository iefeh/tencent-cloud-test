import "./index.scss";

interface Props {
  activeIndex?: number;
  showLabel?: boolean;
  className?: string;
  onClick?: (index: number) => void;
}

export default function SchoolIcon(props: Props) {
  const icons = ["genetic", "mechanoid", "spiritual", "natural"];

  return (
    <div className={"school-icons flex items-center gap-24 z-10 " + props.className}>
      {icons.map((label, index) => (
        <div
          key={index}
          className="school-icon flex flex-col items-center text-white"
          onClick={() => props.onClick?.(index)}
        >
          <div
            className={`img img-${label} ${
              props.activeIndex === index ? "active" : ""
            }`}
          ></div>
          {props.showLabel && (
            <div className="label uppercase font-semakin text-lg">{label}</div>
          )}
        </div>
      ))}
    </div>
  );
}
