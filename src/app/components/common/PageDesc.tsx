import BasicButton from "./BasicButton";
import Belt from "./Belt";

interface Props {
  hasBelt?: boolean;
  title?: string;
  subtitle?: string;
  buttonLabel?: string;
  buttonLink?: string;
}

export default function PageDesc(props: Props) {
  return (
    <div className="page-desc text-center z-10">
      {props.hasBelt && <Belt /> }

      {props.title && (
        <div
          className="title text-4xl uppercase font-semakin mb-4"
          dangerouslySetInnerHTML={{ __html: props.title }}
        ></div>
      )}

      {props.subtitle && (
        <div
          className="title text-xs font-decima mb-10"
          dangerouslySetInnerHTML={{ __html: props.subtitle }}
        ></div>
      )}

      {props.buttonLabel && <BasicButton label={props.buttonLabel} link={props.buttonLink} />}
    </div>
  );
}
