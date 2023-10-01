import { useState, useLayoutEffect, ReactPortal } from "react";
import { createPortal } from "react-dom";
import SloganContent from "./SloganContent";

interface Props {
  fixed?: boolean;
  onCanvasInited?: () => void;
}

export default function SloganScreen(props: Props) {
  const [contentNode, setContentNode] = useState<ReactPortal>();

  const content = (
    <SloganContent fixed={props.fixed} onCanvasInited={props.onCanvasInited} />
  );

  useLayoutEffect(() => {
    const parent = document.getElementById("main-layout")!;

    setContentNode(createPortal(content, parent));
  }, [props.fixed]);

  return (
    <div className="slogan-screen w-full h-[200vh] relative">{contentNode}</div>
  );
}
