interface Props {
  className?: string;
}

export default function Belt(props: Props) {
  return (
    <div className={"belt inline-flex items-center " + (props.className || '')}>
      <div className="belt-cube"></div>

      <div className="dotted-wrapper">
        <div className="dotted-line"></div>
      </div>

      <div className="belt-cube"></div>
    </div>
  );
}
