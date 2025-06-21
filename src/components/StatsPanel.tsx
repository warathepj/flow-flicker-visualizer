
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Package, Clock, TrendingUp } from 'lucide-react';

interface StatsPanelProps {
  currentRate: number;
  totalProduced: number;
  isRunning: boolean;
  activeProducts: number;
  lastRateChange: number;
}

const WS_URL = 'ws://localhost:8765';

const StatsPanel: React.FC<StatsPanelProps> = ({
  currentRate,
  totalProduced,
  isRunning,
  activeProducts,
  lastRateChange
}) => {
  const [timeSinceChange, setTimeSinceChange] = useState(0);
  const [timeUntilNext, setTimeUntilNext] = useState(8);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - lastRateChange) / 1000);
      setTimeSinceChange(elapsed);
      setTimeUntilNext(Math.max(0, 8 - elapsed));
    }, 1000);

    return () => clearInterval(interval);
  }, [lastRateChange]);

  const wsRef = React.useRef<WebSocket | null>(null);

  useEffect(() => {
    const connectWebSocket = () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        return; // Already connected
      }

      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log('WebSocket connected');
        wsRef.current = ws;
      };

      ws.onmessage = (event) => {
        console.log('Message from server:', event.data);
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        wsRef.current = null;
        // Attempt to reconnect after a delay
        setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        wsRef.current?.close();
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []); // Empty dependency array to run only once on mount

  useEffect(() => {
    // This effect sends data whenever currentRate or totalProduced changes, but only if the simulation is running
    if (isRunning && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ currentRate, totalProduced }));
    }
  }, [currentRate, totalProduced, isRunning]);

  const getRateStatusColor = () => {
    if (currentRate === 0) return 'text-red-600';
    if (currentRate === 60) return 'text-green-600';
    if (currentRate >= 70) return 'text-purple-600';
    return 'text-blue-600';
  };

  const getRateStatusBg = () => {
    if (currentRate === 0) return 'bg-red-50 border-red-200';
    if (currentRate === 60) return 'bg-green-50 border-green-200';
    if (currentRate >= 70) return 'bg-purple-50 border-purple-200';
    return 'bg-blue-50 border-blue-200';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Current Rate */}
      <Card className={`border-2 shadow-lg ${getRateStatusBg()}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className={`w-5 h-5 ${getRateStatusColor()}`} />
            <CardTitle className="text-sm font-medium text-gray-600">Current Rate</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getRateStatusColor()}`}>
            {currentRate}
          </div>
          <p className="text-xs text-gray-500 mt-1">pieces per minute</p>
        </CardContent>
      </Card>

      {/* Total Produced */}
      <Card className="border-2 border-indigo-200 shadow-lg bg-indigo-50">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600" />
            <CardTitle className="text-sm font-medium text-gray-600">Total Produced</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-indigo-600">
            {totalProduced}
          </div>
          <p className="text-xs text-gray-500 mt-1">products</p>
        </CardContent>
      </Card>

      {/* Active Products */}
      <Card className="border-2 border-orange-200 shadow-lg bg-orange-50">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-600" />
            <CardTitle className="text-sm font-medium text-gray-600">On Belt</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {activeProducts}
          </div>
          <p className="text-xs text-gray-500 mt-1">products moving</p>
        </CardContent>
      </Card>

      {/* Next Rate Change */}
      <Card className="border-2 border-gray-200 shadow-lg bg-gray-50">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            <CardTitle className="text-sm font-medium text-gray-600">Next Change</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-700">
            {timeUntilNext}s
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {isRunning ? 'until rate change' : 'paused'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsPanel;
