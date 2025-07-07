import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { X } from "lucide-react";
import StockSearchInput from "./StockSearchInput";
import OrderBookTable from "./OrderBookTable";
import StockChart from "./StockChart";
import axios from "axios";

interface TradingCardProps {
  id: number;
  authToken: string;
  onRemove: (id: number) => void;
  canRemove: boolean;
}

interface BidOfferRow {
  price: string;
  que_num: string;
  volume: string;
  change_percentage: string;
}

interface TotalBidOffer {
  bid: {
    freq: string;
    lot: string;
  };
  offer: {
    freq: string;
    lot: string;
  };
}

interface StockApiResponse {
  data: {
    bid: BidOfferRow[];
    offer: BidOfferRow[];
    average: number;
    lastprice: number;
    change: number;
    percentage_change: number;
    open: number;
    high: number;
    low: number;
    previous: number;
    volume: number;
    value: number;
    frequency: number;
    symbol: string;
    total_bid_offer: TotalBidOffer;
  };
  message: string;
}

const TradingCard: React.FC<TradingCardProps> = ({
  id,
  authToken,
  onRemove,
  canRemove,
}) => {
  const [selectedStock, setSelectedStock] = useState("");
  const [stockData, setStockData] = useState<StockApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use ref to store interval ID for this specific card
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStockData = async (stockSymbol: string) => {
    if (!authToken) return;

    setLoading(true);
    setError(null);

    try {
      const apiUrl = `https://exodus.stockbit.com/company-price-feed/v2/orderbook/companies/${stockSymbol}`;
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

      const fetchedData = response.data;
      setStockData(fetchedData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching stock data:", error);
      setError(`Failed to fetch data for ${stockSymbol}.`);
      setLoading(false);
    }
  };

  const handleStockChange = (stockSymbol: string) => {
    setSelectedStock(stockSymbol);

    // Clear existing interval when stock changes
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (stockSymbol && authToken) {
      // Initial fetch
      fetchStockData(stockSymbol);

      // Set up new interval for every minute (60000ms)
      intervalRef.current = setInterval(() => {
        fetchStockData(stockSymbol);
      }, 60000);
    }
  };

  // Clean up interval when component unmounts or authToken changes
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Restart interval when authToken changes
  useEffect(() => {
    if (selectedStock && authToken) {
      handleStockChange(selectedStock);
    }
  }, [authToken]);

  return (
    <Card className="relative">
      {canRemove && (
        <button
          onClick={() => {
            // Clear interval before removing card
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            onRemove(id);
          }}
          className="absolute top-2 right-2 z-10 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <CardHeader>
        <CardTitle>
          <StockSearchInput
            onStockChange={handleStockChange}
            stockData={stockData}
            loading={loading}
            error={error}
            selectedStock={selectedStock}
          />
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Book Table */}
          <OrderBookTable
            stockSymbol={selectedStock}
            stockData={stockData}
            loading={loading}
            error={error}
          />

          {/* Chart */}
          <StockChart stockSymbol={selectedStock} authToken={authToken} />
        </div>
      </CardContent>
    </Card>
  );
};

export default TradingCard;
