import Head from "next/head";
import IndexScreen from "./subScreens/Index";

export default function LoyaltyProgram() {
  return (
    <section id="luxy" className="w-full flex flex-col">
      <Head>
        <title>Loyalty Program | Moonveil</title>
      </Head>
      
      <IndexScreen />
    </section>
  );
}
