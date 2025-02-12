import React from 'react';

interface CloudBackgroundProps {
  animationState: string;
}

const CloudBackground = ({ animationState }: CloudBackgroundProps) => {
  if (animationState !== 'showBackground') return null;

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none">
      {/* Cloud Layer */}
      <div className="absolute inset-0">
        <div className="cloud-scroll">
          {/* Pixel-perfect cloud shapes */}
          <svg className="cloud-sprite w-32 h-8" viewBox="0 0 32 8" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M4 0h24v2h2v2h2v2h-2v2h-2v-2h-24v-2h-2v-2h2v-2z"
              fill="#9CD3E7"
              className="cloud-pixel"
            />
            <path
              d="M6 2h20v2h-20v-2z"
              fill="#B8E6F5"
              className="cloud-highlight"
            />
          </svg>
          
          {/* Repeat cloud patterns */}
          <div className="cloud-row">
            {[...Array(6)].map((_, i) => (
              <div key={`cloud-${i}`} className="cloud-group" style={{ 
                transform: `translateX(${i * 120}px) translateY(${(i % 2) * 40}px)`
              }}>
                <div className="relative">
                  <svg className="cloud-sprite w-32 h-8" viewBox="0 0 32 8">
                    <use href="#cloud-shape" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes cloudScroll {
          0% {
            transform: translateY(100%);
          }
          100% {
            transform: translateY(-100%);
          }
        }

        .cloud-scroll {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 200%;
          animation: cloudScroll 20s linear infinite;
          image-rendering: pixelated;
        }

        .cloud-row {
          position: relative;
          height: 100%;
          padding: 2rem;
        }

        .cloud-group {
          position: absolute;
          transition: transform 0.5s ease-out;
        }

        .cloud-sprite {
          image-rendering: pixelated;
          -webkit-font-smoothing: none;
          -moz-osx-font-smoothing: none;
        }
      `}</style>
    </div>
  );
};

export default CloudBackground;