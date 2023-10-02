import { useState, createRef, useEffect } from "react";
import initCanvas from "./initCanvas";
import planetImg from "img/home/planet.png";
import Image from "next/image";
import './index.scss';

export default function StarScreen() {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const canvasRef = createRef<HTMLCanvasElement>();

  function setSize() {
    setWidth(window.innerWidth / 2);
    setHeight(window.innerHeight / 2);
  }

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    initCanvas(ctx);
  }, [canvasRef]);

  useEffect(() => {
    setSize();

    window.addEventListener("resize", setSize);
    return () => window.removeEventListener('resize', setSize);
  }, []);

  return (
    <div className="star-screen z-0 absolute left-0 top-0 w-full h-screen pointer-events-none">
      <Image className="bg-img w-[80vw] h-[70vw] origin-center -translate-y-40" src={planetImg} alt="" />

      <canvas
        ref={canvasRef}
        className="bg-star absolute left-0 top-0 w-full h-full z-10"
        width={width}
        height={height}
      ></canvas>
    </div>
  );
}
