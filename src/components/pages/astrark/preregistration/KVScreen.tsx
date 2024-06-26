export default function KVScreen() {
  return (
    <div className="w-screen h-screen relative">
      <video
        className="w-full h-full object-cover"
        autoPlay
        playsInline
        muted
        loop
        preload="auto"
        poster="/img/astrark/bg-home.jpg"
      >
        <source src="/video/astrark.webm" />
      </video>
    </div>
  );
}
