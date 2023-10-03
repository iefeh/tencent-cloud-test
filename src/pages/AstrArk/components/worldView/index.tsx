import React from "react"
import PageDesc from "../../../components/common/PageDesc";

const WorldView :React.FC = () => {
  return (
    <div className="worldView h-screen relative flex justify-center items-center">
      <PageDesc
        hasBelt
        title="What happened..."
        subtitle='A mysterious object offering infinite energy has reshaped<br/> our world. As humanity studies its enigmatic nature,<br/> humanity finds itself enslaved by the object while<br/> averting energy shortages.
        <br/><br/>But when it vanished, chaos ensued. Nations crumbled, and<br/> it was called the "End Times."'
      />
    </div>
  )
}

export default WorldView