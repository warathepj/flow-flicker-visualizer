
import React from 'react';

interface ConveyorBeltProps {
  isRunning: boolean;
}

const ConveyorBelt: React.FC<ConveyorBeltProps> = ({ isRunning }) => {
  return (
    <div className="absolute inset-0 top-16 bottom-8">
      {/* Main belt surface */}
      <div className="relative w-full h-full bg-gradient-to-b from-gray-400 to-gray-500 overflow-hidden">
        {/* Moving belt texture */}
        <div 
          className={`absolute inset-0 opacity-30 ${
            isRunning ? 'animate-pulse' : ''
          }`}
          style={{
            backgroundImage: `repeating-linear-gradient(
              90deg,
              transparent,
              transparent 20px,
              rgba(0,0,0,0.1) 20px,
              rgba(0,0,0,0.1) 22px
            )`,
            animation: isRunning ? 'move-belt 2s linear infinite' : 'none'
          }}
        />
        
        {/* Belt direction indicators */}
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className={`absolute top-1/2 transform -translate-y-1/2 w-8 h-1 bg-yellow-400 opacity-60 ${
              isRunning ? 'animate-pulse' : ''
            }`}
            style={{
              left: `${i * 5}%`,
              animation: isRunning ? `move-indicator 3s linear infinite ${i * -0.15}s` : 'none'
            }}
          />
        ))}
        
        {/* Belt shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 w-1/4 animate-shine" />
      </div>
      
      {/* Belt support rollers visualization */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between items-center h-2">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className={`w-3 h-3 bg-gray-800 rounded-full ${
              isRunning ? 'animate-spin' : ''
            }`}
            style={{
              animationDuration: '0.5s'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ConveyorBelt;
