interface Props {
  activeIndex?: number;
  hoverActive?: boolean;
  cursorPointer?: boolean;
  showLabel?: boolean;
  className?: string;
  onClick?: (index: number) => void;
}

export default function SchoolIcon(props: Props) {
  const icons = ["genetic", "mechanoid", "spiritual", "natural"];

  return (
    <div className={"school-icons flex items-center gap-24 z-10 max-md:gap-4 " + props.className}>
      {icons.map((label, index) => (
        <div
          key={index}
          className={`school-icon flex flex-col items-center text-white ${props.hoverActive ? 'hover-active' : ''} ${props.cursorPointer ? 'cursor-pointer' : ''}`}
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
