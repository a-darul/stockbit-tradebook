import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";

interface StockChartProps {
  stockSymbol: string;
  authToken: string;
}

type RawEntry = {
  frequency: { raw: string; formatted: string };
  lot: { raw: string; formatted: string };
  time: string;
};

type InputData = {
  buy: RawEntry[];
  sell: RawEntry[];
};

type ChartEntry = {
  time: string;
  buy?: number;
  sell?: number;
};

interface ChartData {
  chartData: ChartEntry[];
}

function formatToChartData(data: InputData): ChartEntry[] {
  const chartMap = new Map<string, ChartEntry>();

  // Helper function to process entries
  function process(entries: RawEntry[], type: "buy" | "sell") {
    for (const entry of entries) {
      const time = entry.time;
      const lot = Number(entry.lot.raw);

      if (!chartMap.has(time)) {
        chartMap.set(time, { time });
      }

      chartMap.get(time)![type] = lot;
    }
  }

  process(data.buy, "buy");
  process(data.sell, "sell");

  // Convert map to sorted array (optional: sort by time)
  return Array.from(chartMap.values()).sort((a, b) =>
    a.time.localeCompare(b.time)
  );
}

const StockChart: React.FC<StockChartProps> = ({ stockSymbol, authToken }) => {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Note: You may need a different endpoint for chart data
  const apiUrl = `https://exodus.stockbit.com/order-trade/trade-book/chart?symbol=${stockSymbol}&time_interval=1m`;

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const fetchChartData = async () => {
    if (!stockSymbol || !authToken) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.status || response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const fetchedData = await response.data;
      const chartDataArray = formatToChartData(fetchedData.data);
      setChartData({ chartData: chartDataArray });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching chart data:", error);
      setError(
        `Failed to fetch chart data for ${stockSymbol}. Using sample data.`
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!stockSymbol || !authToken) return;

    // Initial fetch
    fetchChartData();

    // Set up interval for every minute (60000ms)
    const interval = setInterval(() => {
      fetchChartData();
    }, 60000);

    // Cleanup interval on unmount or when dependencies change
    return () => {
      clearInterval(interval);
    };
  }, [stockSymbol, authToken]);

  const currentData = chartData;

  if (!stockSymbol) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        Please select a stock to view chart
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Stock Chart</h3>
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
          {error}
        </div>
      )}

      {/* Chart */}
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={currentData?.chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis tickFormatter={formatNumber} />
            <Tooltip
              formatter={(value) => [formatNumber(value as number), ""]}
            />
            <Line
              type="monotone"
              dataKey="buy"
              stroke="#10B981"
              strokeWidth={2}
              name="Buy"
            />
            <Line
              type="monotone"
              dataKey="sell"
              stroke="#EF4444"
              strokeWidth={2}
              name="Sell"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm">Buy</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-sm">Sell</span>
        </div>
      </div>
    </div>
  );
};

export default StockChart;
