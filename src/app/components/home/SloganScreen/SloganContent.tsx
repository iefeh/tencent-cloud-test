import { useState, useEffect, createRef } from "react";
import Image from "next/image";
import planetImg from "img/home/planet.png";
import BasicButton from "../../common/BasicButton";
import "./index.scss";
import initCanvas from "./initCanvas";

interface Props {
  fixed?: boolean;
  onCanvasInited?: () => void;
}

export default function SloganContent(props: Props) {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const canvasRef = createRef<HTMLCanvasElement>();

  function setSize() {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
  }

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    initCanvas(ctx).then(() => {
      props.onCanvasInited?.();
    });
  }, [canvasRef]);

  useEffect(() => {
    setSize();

    window.addEventListener("resize", setSize);
  }, []);

  return (
    <div
      className={
        "main-content w-full h-screen left-0 overflow-hidden z-10 " +
        (props.fixed ? "fixed" : "absolute")
      }
    >
      <canvas
        ref={canvasRef}
        className="bg-star"
        width={width}
        height={height}
      ></canvas>

      <Image
        className="absolute left-0 top-0 w-[56rem] h-[49rem] translate-x-40 -translate-y-40 z-10"
        src={planetImg}
        alt=""
      />

      <div className="title uppercase font-semakin text-basic-yellow text-5xl">
        own your destiny
      </div>

      <div className="subtitle uppercase font-poppins text-xs">
        With the power of cutting-edge technologies, our mission is to craft
        <br />
        top-notch gaming experiences that seamlessly
        <br />
        <span className="text-basic-yellow">combine casual flexibility</span>
        with
        <span className="text-basic-yellow">authentic fun depth.</span>
      </div>

      <BasicButton label="about" link="/About" />
    </div>
  );
}
