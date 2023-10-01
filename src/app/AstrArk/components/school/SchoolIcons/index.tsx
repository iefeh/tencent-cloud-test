import "./index.scss";

interface Props {
  activeIndex?: number;
  showLabel?: boolean;
}

export default function SchoolIcon(props: Props) {
  const icons = ["genetic", "mechanoid", "spiritual", "natural"];

  return (
    <div className="school-icons flex items-center gap-24 z-10">
      {icons.map((label, index) => (
        <div
          key={index}
          className="school-icon flex flex-col items-center text-white"
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
