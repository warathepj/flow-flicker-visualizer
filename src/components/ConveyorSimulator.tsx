
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProductBox from './ProductBox';
import ConveyorBelt from './ConveyorBelt';
import StatsPanel from './StatsPanel';
import { useConveyorLogic } from '@/hooks/useConveyorLogic';

interface Product {
  id: number;
  position: number;
  speed: number;
  timestamp: number;
}

const ConveyorSimulator: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentRate, setCurrentRate] = useState(60);
  const [totalProduced, setTotalProduced] = useState(0);
  const [lastRateChange, setLastRateChange] = useState(Date.now());
  
  const nextProductId = useRef(1);
  const animationFrameRef = useRef<number>();
  const lastProductTime = useRef(0);
  const rateChangeInterval = useRef<NodeJS.Timeout>();

  const {
    getRandomRate,
    calculateProductInterval,
    shouldCreateProduct
  } = useConveyorLogic();

  // Rate change mechanism - every 8 seconds
  const changeRate = useCallback(() => {
    const newRate = getRandomRate();
    setCurrentRate(newRate);
    setLastRateChange(Date.now());
    console.log(`Rate changed to: ${newRate} pieces per minute`);
  }, [getRandomRate]);

  // Start rate change timer
  useEffect(() => {
    if (isRunning) {
      rateChangeInterval.current = setInterval(changeRate, 8000);
    } else {
      if (rateChangeInterval.current) {
        clearInterval(rateChangeInterval.current);
      }
    }

    return () => {
      if (rateChangeInterval.current) {
        clearInterval(rateChangeInterval.current);
      }
    };
  }, [isRunning, changeRate]);

  // Animation loop
  const animate = useCallback((timestamp: number) => {
    if (!isRunning) return;

    const deltaTime = timestamp - lastProductTime.current;
    const productInterval = calculateProductInterval(currentRate);

    // Create new product if needed
    if (currentRate > 0 && shouldCreateProduct(deltaTime, productInterval)) {
      const newProduct: Product = {
        id: nextProductId.current++,
        position: 0,
        speed: 100, // pixels per second
        timestamp: timestamp
      };
      
      setProducts(prev => [...prev, newProduct]);
      setTotalProduced(prev => prev + 1);
      lastProductTime.current = timestamp;
    }

    // Update product positions and remove completed ones
    setProducts(prev => 
      prev.map(product => ({
        ...product,
        position: product.position + (product.speed * deltaTime) / 1000
      })).filter(product => product.position < 800) // Remove products that reached the end
    );

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [isRunning, currentRate, calculateProductInterval, shouldCreateProduct]);

  // Start/stop animation
  useEffect(() => {
    if (isRunning) {
      lastProductTime.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, animate]);

  const toggleSimulation = () => {
    setIsRunning(!isRunning);
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setProducts([]);
    setTotalProduced(0);
    setCurrentRate(60);
    setLastRateChange(Date.now());
    nextProductId.current = 1;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-2 border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </div>
              Conveyor System Hardware Simulator
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Button
                onClick={toggleSimulation}
                className={`flex items-center gap-2 px-6 py-3 text-lg font-semibold ${
                  isRunning 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                {isRunning ? 'Stop' : 'Start'} Conveyor
              </Button>
              
              <Button
                onClick={resetSimulation}
                variant="outline"
                className="flex items-center gap-2 px-6 py-3 text-lg font-semibold border-2"
              >
                <RotateCcw className="w-5 h-5" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Panel */}
        <StatsPanel
          currentRate={currentRate}
          totalProduced={totalProduced}
          isRunning={isRunning}
          activeProducts={products.length}
          lastRateChange={lastRateChange}
        />

        {/* Main Conveyor Visualization */}
        <Card className="border-2 border-gray-300 shadow-xl bg-white overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-800 text-white py-4">
            <CardTitle className="text-xl font-bold text-center">
              Conveyor Belt System - Rate: {currentRate} pieces/min
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 relative">
            <div className="relative h-64 bg-gradient-to-b from-gray-50 to-gray-100 overflow-hidden">
              {/* Conveyor Belt */}
              <ConveyorBelt isRunning={isRunning} />
              
              {/* Products */}
              {products.map(product => (
                <ProductBox
                  key={product.id}
                  position={product.position}
                  id={product.id}
                />
              ))}
              
              {/* Conveyor Structure */}
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-r from-gray-600 via-gray-700 to-gray-600 border-t-2 border-gray-800">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              </div>
              
              {/* Side Rails */}
              <div className="absolute top-16 left-0 right-0 h-1 bg-gray-800 shadow-sm"></div>
              <div className="absolute bottom-8 left-0 right-0 h-1 bg-gray-800 shadow-sm"></div>
            </div>
          </CardContent>
        </Card>

        {/* Rate Distribution Info */}
        <Card className="border-2 border-amber-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
            <CardTitle className="text-lg font-bold">Rate Distribution System</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="font-bold text-green-700">50%</div>
                <div className="text-green-600">60 pieces/min</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="font-bold text-blue-700">30%</div>
                <div className="text-blue-600">10-50 pieces/min</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="font-bold text-purple-700">10%</div>
                <div className="text-purple-600">70-80 pieces/min</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="font-bold text-red-700">10%</div>
                <div className="text-red-600">0 pieces/min</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConveyorSimulator;
