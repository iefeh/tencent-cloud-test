export default function IndexSlide() {
  return (
    <div className="bg-video w-full h-screen">
      <video
        className="w-full h-full object-cover"
        src="/video/ntfbg.webm"
        autoPlay
        muted
        loop
      ></video>
    </div>
  );
}
