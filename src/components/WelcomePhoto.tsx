'use client';

import { useState } from 'react';
import Image from 'next/image';

// Welcome polaroid with a glowing golden halo and a waving hand.
// Falls back to the illustrated avatar if the photo is missing.
export default function WelcomePhoto({ width }: { width: number }) {
  const [src, setSrc] = useState('/avatars/welcome.jpg');
  const isPhoto = src.endsWith('.jpg');
  const photoHeight = Math.round(width * 1.1);

  return (
    <div className="welcome-photo" style={{ width }}>
      <div className="welcome-photo-halo" />
      <figure className="welcome-photo-frame">
        <div style={{ height: photoHeight, overflow: 'hidden', borderRadius: 2 }}>
          <Image
            src={src}
            alt="Jadiha smiling in front of the Golden Gate Bridge"
            width={width * 2}
            height={photoHeight * 2}
            priority
            onError={() => setSrc('/avatars/avatar.png')}
            style={{
              width: '100%',
              height: '100%',
              objectFit: isPhoto ? 'cover' : 'contain',
              objectPosition: 'center',
              background: isPhoto ? undefined : 'linear-gradient(135deg, #FFD9E4, #FFE4CC)',
            }}
          />
        </div>
      </figure>
      <span className="welcome-photo-wave" aria-hidden="true">👋🏽</span>
    </div>
  );
}
