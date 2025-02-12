import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface CloudBackgroundProps {
  animationState: string;
}

interface Cloud {
  id: number;
  type: number;
  x: number;
  delay: number;
  size: number;
  wiggleDuration: number;
}

const CloudBackground = ({ animationState }: CloudBackgroundProps) => {
  const [clouds, setClouds] = useState<Cloud[]>([]);
  const totalClouds = 16;
  
  // Function to get a random X position in the allowed zones
  const getRandomXPosition = () => {
    const rand = Math.random();
    
    if (rand < 0.5) {
      // Left side (0-45%)
      return Math.random() * 45;
    } else {
      // Right side (65%-100%)
      return Math.random() * 20 + 65;
    }
  };

  useEffect(() => {
    if (animationState !== 'showBackground') return;

    const initialClouds: Cloud[] = [];
    
    for (let i = 0; i < totalClouds; i++) {
      initialClouds.push({
        id: i,
        type: Math.floor(Math.random() * 7) + 1,
        x: getRandomXPosition(),
        delay: -(Math.random() * 90),
        size: Math.random() * 0.4 + 2.3,
        wiggleDuration: Math.random() * 6 + 8,
      });
    }

    setClouds(initialClouds);

    const spawnInterval = setInterval(() => {
      setClouds(prevClouds => {
        const activeClouds = prevClouds.filter(cloud => 
          cloud.delay + 60 > -(Date.now() / 1000 % 60)
        );
        
        const newCloud = {
          id: Date.now(),
          type: Math.floor(Math.random() * 7) + 1,
          x: getRandomXPosition(),
          delay: 0,
          size: Math.random() * 0.4 + 2.3,
          wiggleDuration: Math.random() * 6 + 8,
        };
        
        return [...activeClouds, newCloud];
      });
    }, 3000); // change this for spawn rate

    return () => clearInterval(spawnInterval);
  }, [animationState]);

  if (animationState !== 'showBackground') return null;

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none">
      <div className="absolute inset-0">
        {clouds.map((cloud) => (
            <div
                key={cloud.id}
                className="absolute w-full"
                style={{
                    left: `${cloud.x - 15}%`, // Offset to center clouds spawn region
                    animation: `cloudFloat 60s linear infinite`,
                    animationDelay: `${cloud.delay}s`,
                }}
            >
            <div
              style={{
                animation: `wiggle ${cloud.wiggleDuration}s ease-in-out infinite`,
                transform: `scale(${cloud.size})`,
              }}
            >
              <Image
                src={`/images/clouds/cloud${cloud.type}.png`}
                alt="cloud"
                width={256}
                height={128}
                className="cloud-sprite"
                style={{
                  opacity: 0.85,
                }}
                priority
              />
            </div>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes cloudFloat {
          0% {
            transform: translateY(120vh);
          }
          100% {
            transform: translateY(-120vh);
          }
        }

        @keyframes wiggle {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-20px);
          }
          75% {
            transform: translateX(20px);
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