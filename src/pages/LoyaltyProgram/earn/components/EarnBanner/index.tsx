import MyBadges from "@/pages/Profile/components/MyBadges";
import DailyCheckIn from "./DailyCheckIn";
import Invite from "./Invite";

export default function EarnBanner() {
  return (
    <div className="w-full mt-[4.25rem]">
      <div className="font-semakin text-basic-yellow text-4xl">Earn Moon Beams</div>

      <div className="mt-[2.625rem] flex flex-wrap justify-between items-center gap-10">
        {/* <DailyCheckIn /> */}

        <Invite />

        <MyBadges />
      </div>
    </div>
  );
}
