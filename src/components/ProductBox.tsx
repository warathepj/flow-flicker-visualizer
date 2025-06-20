
import React from 'react';

interface ProductBoxProps {
  position: number;
  id: number;
}

const ProductBox: React.FC<ProductBoxProps> = ({ position, id }) => {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500'
  ];
  
  const colorClass = colors[id % colors.length];
  
  return (
    <div
      className={`absolute top-20 w-12 h-12 ${colorClass} rounded-lg shadow-lg border-2 border-white transform transition-all duration-100 hover:scale-110`}
      style={{
        left: `${Math.min(position, 800)}px`,
        zIndex: 10
      }}
    >
      {/* Box label */}
      <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
        {id}
      </div>
      
      {/* Box highlight effect */}
      <div className="absolute top-1 left-1 w-2 h-2 bg-white/40 rounded-sm" />
      
      {/* Shadow effect */}
      <div 
        className="absolute top-full left-1/2 transform -translate-x-1/2 w-10 h-2 bg-black/20 rounded-full blur-sm"
        style={{ top: '48px' }}
      />
    </div>
  );
};

export default ProductBox;
