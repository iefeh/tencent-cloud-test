import React from "react";
import PageDesc from "../../../components/common/PageDesc";

const WorldView: React.FC = () => {
  return (
    <div className="worldView h-screen relative flex justify-center items-center">
      <video
        className="object-cover absolute left-0 top-0 w-full h-full z-0"
        autoPlay
        playsInline
        muted
        loop
        preload="auto"
      >
        <source src="/video/meteorite.mp4" />
      </video>

      <PageDesc
        hasBelt
        title="What happened..."
        subtitle='A mysterious object offering infinite energy has reshaped<br/> our world. As humanity studies its enigmatic nature,<br/> humanity finds itself enslaved by the object while<br/> averting energy shortages.
        <br/><br/>But when it vanished, chaos ensued. Nations crumbled, and<br/> it was called the "End Times."'
      />
    </div>
  );
};

export default WorldView;
