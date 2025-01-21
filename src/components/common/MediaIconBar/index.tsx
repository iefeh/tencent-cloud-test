'use client';

import XSvg from "svg/x.svg";
import MediumSvg from "svg/medium.svg";
import DiscordSvg from "svg/discord.svg";
import TelegramSvg from "svg/telegram.svg";
import YoutubeSvg from "svg/Youtube.svg";
import { TGLinks } from "@/components/Header";

interface Props {
  type?: "white" | "yellow";
  gutter?: "default" | "lg";
  size?: "default" | "lg";
  className?: string;
}

export default function MediaIconBar(props: Props) {
  const gutterClass = `gutter-${props.gutter || "default"}`;
  const sizeClass = props.size === 'default' ? 'w-8 h-8' : 'w-10 h-10';
  const svgClass = [gutterClass, sizeClass].join(' ');

  function openURL(url: string) {
    window.open(url);
  }

  return (
    <div
      className={[
        "media-icon-bar flex",
        props.className || "",
        "color-" + (props.type || "white"),
      ].join(" ")}
    >
      <XSvg className={sizeClass} onClick={() => openURL('https://twitter.com/Moonveil_Studio')} />
      <MediumSvg className={svgClass} onClick={() => openURL('https://medium.com/@Moonveil_Studio')} />
      <DiscordSvg className={svgClass} onClick={() => openURL('https://discord.gg/moonveil')} />
      <TGLinks isInFooter />
      <YoutubeSvg className={svgClass} onClick={() => openURL('https://www.youtube.com/channel/UCFtFhgsjtdSgXarKvSYpz3A')} />
    </div>
  );
}
