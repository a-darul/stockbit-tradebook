import React, { useState } from "react";
import { Input } from "~/components/ui/input";
import { Search, TrendingUp, TrendingDown } from "lucide-react";

interface StockApiResponse {
  data: {
    symbol: string;
    lastprice: number;
    change: number;
    percentage_change: number;
    open: number;
    high: number;
    low: number;
    previous: number;
    volume: number;
    value: number;
    average: number;
    frequency: number;
  };
  message: string;
}

interface StockSearchInputProps {
  onStockChange: (stockSymbol: string) => void;
  stockData: StockApiResponse | null;
  loading: boolean;
  error: string | null;
  selectedStock: string;
}

const StockSearchInput: React.FC<StockSearchInputProps> = ({
  onStockChange,
  stockData,
  loading,
  error,
  selectedStock,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleStockSearch = (stockSymbol: string) => {
    if (stockSymbol.trim().length === 4) {
      const upperSymbol = stockSymbol.toUpperCase();
      onStockChange(upperSymbol);
    }
  };

  const formatVolume = (volume: number): string => {
    if (volume >= 1000000000) {
      return (volume / 1000000000).toFixed(1) + "B";
    } else if (volume >= 1000000) {
      return (volume / 1000000).toFixed(1) + "M";
    } else if (volume >= 1000) {
      return (volume / 1000).toFixed(1) + "K";
    }
    return volume.toString();
  };

  const formatValue = (value: number): string => {
    if (value >= 1000000000000) {
      return (value / 1000000000000).toFixed(1) + "T";
    } else if (value >= 1000000000) {
      return (value / 1000000000).toFixed(1) + "B";
    } else if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + "M";
    }
    return value.toString();
  };

  return (
    <div className="space-y-6">
      {/* Search Input and Stock Info Header */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Masukkan emiten..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleStockSearch(searchTerm);
                }
              }}
              className="pl-10 w-40"
            />
          </div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold">{selectedStock}</h1>
            {loading && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            )}
          </div>
          {stockData?.data && (
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-bold">
                {stockData.data.lastprice.toLocaleString()}
              </span>
              <div
                className={`flex items-center ${
                  stockData.data.change >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {stockData.data.change >= 0 ? (
                  <TrendingUp className="h-5 w-5" />
                ) : (
                  <TrendingDown className="h-5 w-5" />
                )}
                <span className="ml-1 font-medium">
                  {stockData.data.change >= 0 ? "+" : ""}
                  {stockData.data.change} ({stockData.data.percentage_change}%)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="text-sm text-orange-600 mt-2 bg-orange-50 p-2 rounded">
          {error}
        </div>
      )}

      {/* Stock Details Grid */}
      {stockData?.data && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Open</span>
            <br />
            <span className="font-medium">
              {stockData.data.open.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-gray-500">High</span>
            <br />
            <span className="font-medium">
              {stockData.data.high.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Low</span>
            <br />
            <span className="font-medium">
              {stockData.data.low.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Prev</span>
            <br />
            <span className="font-medium">
              {stockData.data.previous.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Vol</span>
            <br />
            <span className="font-medium">
              {formatVolume(stockData.data.volume)}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Value</span>
            <br />
            <span className="font-medium">
              {formatValue(stockData.data.value)}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Avg</span>
            <br />
            <span className="font-medium">
              {stockData.data.average.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Freq</span>
            <br />
            <span className="font-medium">
              {stockData.data.frequency.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockSearchInput;
