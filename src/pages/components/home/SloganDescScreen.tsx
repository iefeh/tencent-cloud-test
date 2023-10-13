import PageDesc from "../common/PageDesc";

export default function SloganDescScreen() {
  return (
    <div className="w-full h-screen relative overflow-hidden">
      <div className="absolute left-[56.35%] top-[43.7%]">
        <PageDesc
          className="items-start text-left"
          hasBelt
          subtitle="<div style='max-width: 30rem'>With the power of cutting-edge technologies, our mission is to craft top-notch gaming experiences that seamlessly <span style='color: #f6c799'>combine casual flexibility</span> with <span style='color: #f6c799'>authentic fun depth.</span></div>"
          buttonLabel="about moonveil"
          buttonLink="/About"
        />
      </div>
    </div>
  );
}
