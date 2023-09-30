import XSvg from "svg/x.svg";
import MediumSvg from "svg/medium.svg";
import DiscordSvg from "svg/discord.svg";
import TelegramSvg from "svg/telegram.svg";
import YoutubeSvg from "svg/Youtube.svg";
import "./index.scss";

interface Props {
  type?: "white" | "yellow";
  gutter?: "default" | "lg";
  size?: "default" | "lg";
  className?: string;
}

export default function MediaIconBar(props: Props) {
  const gutterClass = `gutter-${props.gutter || "default"}`;
  const sizeClass = props.size === 'default' ? 'w-8 h-8' : 'w-[3.25rem] h-[3.25rem]';
  const svgClass = [gutterClass, sizeClass].join(' ');

  return (
    <div
      className={[
        "media-icon-bar flex",
        props.className || "",
        "color-" + (props.type || "white"),
      ].join(" ")}
    >
      <XSvg className={sizeClass} />
      <MediumSvg className={svgClass} />
      <DiscordSvg className={svgClass} />
      <TelegramSvg className={svgClass} />
      <YoutubeSvg className={svgClass} />
    </div>
  );
}
