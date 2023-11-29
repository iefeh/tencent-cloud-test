import Head from "next/head";
import IndexScreen from "./subScreens/Index";
import WhatIsMBScreen from "./subScreens/WhatIsMB";
import BadgeScreen from "./subScreens/Badge";

export default function LoyaltyProgram() {
  return (
    <section id="luxy" className="w-full flex flex-col">
      <Head>
        <title>Loyalty Program | Moonveil</title>
      </Head>
      
      <IndexScreen />

      <WhatIsMBScreen />

      <BadgeScreen />
    </section>
  );
}
