'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { CREATOR } from '@/content/profile';

// Gallery card media for JD's World. Plays a muted looping clip while on screen,
// or shows the video thumbnail until a clip is added. Tapping opens the channel.
export default function CreatorClip() {
  const { featured } = CREATOR;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [clipFailed, setClipFailed] = useState(false);
  const showVideo = !!featured.clip && !clipFailed;

  // Only play while visible so it doesn't burn battery off-screen
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    }, { threshold: 0.4 });
    io.observe(v);
    return () => io.disconnect();
  }, [showVideo]);

  return (
    <a
      href={CREATOR.youtube}
      target="_blank"
      rel="noopener noreferrer"
      className="creator-clip"
      aria-label={`Visit ${CREATOR.name} on YouTube`}
    >
      {showVideo ? (
        <video
          ref={videoRef}
          src={featured.clip!}
          poster={featured.poster}
          muted
          loop
          playsInline
          preload="metadata"
          onError={() => setClipFailed(true)}
        />
      ) : (
        <Image src={featured.poster} alt={featured.title} width={640} height={360} />
      )}
      {!showVideo && <span className="creator-clip-play" aria-hidden="true">▶</span>}
    </a>
  );
}
