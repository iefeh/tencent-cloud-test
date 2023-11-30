import Head from "next/head";
import IndexScreen from "./subScreens/Index";
import WhatIsMBScreen from "./subScreens/WhatIsMB";
import BadgeScreen from "./subScreens/Badge";
import JourneyScreen from "./subScreens/Journey";

export default function LoyaltyIntro() {
  return (
    <section id="luxy" className="w-full flex flex-col">
      <Head>
        <title>Loyalty System | Moonveil</title>
      </Head>
      
      <IndexScreen />

      <WhatIsMBScreen />

      <BadgeScreen />

      <JourneyScreen />
    </section>
  );
}
