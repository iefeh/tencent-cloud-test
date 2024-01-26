import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';

interface Props {
  className?: string;
  options?: any;
  onReady?: (player: Player) => void;
}

export default function Video(props: Props) {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  let { className, options, onReady } = props;
  const baseOptions = {
    muted: true,
    autoplay: true,
    loop: true,
    // responsive: true,
    preload: true,
    fluid: true,
  };
  options = Object.assign(baseOptions, options);

  useEffect(() => {
    if (!videoRef.current) return;

    if (!playerRef.current) {
      const videoElement = document.createElement('video-js');
      videoElement.style.width = '100%';
      videoElement.style.height = '100%';

      videoElement.classList.add('vjs-big-play-centered');
      videoElement.classList.add('vjs-fluid');
      videoRef.current.appendChild(videoElement);

      const player = (playerRef.current = videojs(videoElement, options, () => {
        videojs.log('player is ready');
        onReady && onReady(player);
      }));
    } else {
      const player = playerRef.current;

      player.autoplay(options.autoplay);
      player.src(options.sources);
    }
  }, [options, videoRef]);

  useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return (
    <div data-vjs-player className={className}>
      <div className="w-full h-full" ref={videoRef} />
    </div>
  );
}
