import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface CloudBackgroundProps {
  animationState: string;
}

interface Cloud {
  id: number;
  type: number;
  x: number;
  side: 'left' | 'right' | 'center';
  delay: number;
  size: number;
}

const CloudBackground = ({ animationState }: CloudBackgroundProps) => {
  const [clouds, setClouds] = useState<Cloud[]>([]);
  const totalClouds = 12; 

  useEffect(() => {
    if (animationState !== 'showBackground') return;

    const initialClouds: Cloud[] = Array.from({ length: totalClouds }, (_, i) => {
      const sideOptions: ('left' | 'center' | 'right')[] = ['left', 'center', 'right'];
      const side = sideOptions[i % 3];
      
      // Calculate base X position based on side
      let baseX = 0;
      switch(side) {
        case 'left':
          baseX = -10;
          break;
        case 'center':
          baseX = 40;
          break;
        case 'right':
          baseX = 90;
          break;
      }

      return {
        id: i,
        type: Math.floor(Math.random() * 3) + 1,
        x: baseX + (Math.random() * 20 - 10), 
        side,
        delay: -(Math.random() * 120),
        size: Math.random() * 0.5 + 2.5 
      };
    });

    setClouds(initialClouds);
  }, [animationState]);

  if (animationState !== 'showBackground') return null;

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none">
      {/* Cloud Container */}
      <div className="absolute inset-0">
        {clouds.map((cloud) => (
          <div
            key={cloud.id}
            className="absolute top-0 left-0 w-full"
            style={{
              transform: `translateX(${cloud.x}%)`,
              animation: `cloudFloat 60s linear infinite`,
              animationDelay: `${cloud.delay}s`,
            }}
          >
            <Image
              src={`/images/clouds/cloud${cloud.type}.png`}
              alt="cloud"
              width={256}
              height={128}
              className="cloud-sprite"
              style={{
                transform: `scale(${cloud.size})`,
                opacity: 0.85,
                animation: `wiggle ${12 + Math.random() * 4}s ease-in-out infinite`,
              }}
              priority
            />
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes cloudFloat {
          0% {
            transform: translate(0, 120vh);
          }
          100% {
            transform: translate(0, -120vh);
          }
        }

        @keyframes wiggle {
          0%, 100% {
            transform: translate(0) scale(var(--scale));
          }
          25% {
            transform: translate(-2rem) scale(var(--scale));
          }
          75% {
            transform: translate(2rem) scale(var(--scale));
          }
        }

        .cloud-sprite {
          width: 512px;
          height: auto;
          image-rendering: pixelated;
          -webkit-font-smoothing: none;
          -moz-osx-font-smoothing: none;
          will-change: transform;
          filter: brightness(1.1);
        }
      `}</style>
    </div>
  );
};

export default CloudBackground;