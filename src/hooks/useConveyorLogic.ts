
import { useCallback } from 'react';

export const useConveyorLogic = () => {
  // Rate distribution according to specifications
  const getRandomRate = useCallback((): number => {
    const random = Math.random();
    
    if (random < 0.3) {
      // 30% chance: 60 pieces per minute
      return 60;
    } else if (random < 0.8) {
      // 15% chance: 10-50 pieces per minute
      return Math.floor(Math.random() * 41) + 10;
    } else if (random < 0.85) {
      // 10% chance: 70-80 pieces per minute
      return Math.floor(Math.random() * 11) + 70;
    } else {
      // 45% chance: 0 pieces per minute (stopped)
      return 0;
    }
  }, []);

  // Calculate time interval between products based on rate
  const calculateProductInterval = useCallback((rate: number): number => {
    if (rate === 0) return Infinity;
    // Convert pieces per minute to milliseconds between pieces
    return (60 * 1000) / rate;
  }, []);

  // Determine if a new product should be created
  const shouldCreateProduct = useCallback((deltaTime: number, interval: number): boolean => {
    return deltaTime >= interval;
  }, []);

  return {
    getRandomRate,
    calculateProductInterval,
    shouldCreateProduct
  };
};
