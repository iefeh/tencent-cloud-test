import XSvg from "svg/x.svg";
import MediumSvg from "svg/medium.svg";
import DiscordSvg from "svg/discord.svg";
import TelegramSvg from "svg/telegram.svg";
import YoutubeSvg from "svg/Youtube.svg";
import "./index.scss";

interface Props {
  type?: "white" | "yellow";
  gutter?: "default" | "lg";
  className?: string;
}

export default function MediaIconBar(props: Props) {
  const gutterClass = `gutter-${props.gutter || "default"}`;

  return (
    <div
      className={[
        "media-icon-bar flex",
        props.className || "",
        "color-" + (props.type || "white"),
      ].join(" ")}
    >
      <XSvg className="w-8 h-8" />
      <MediumSvg className={"w-8 h-8 " + gutterClass} />
      <DiscordSvg className={"w-8 h-8 " + gutterClass} />
      <TelegramSvg className={"w-8 h-8 " + gutterClass} />
      <YoutubeSvg className={"w-8 h-8 " + gutterClass} />
    </div>
  );
}
