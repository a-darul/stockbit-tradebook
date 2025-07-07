import React from "react";

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

interface OrderBookTableProps {
  stockSymbol: string;
  stockData: StockApiResponse | null;
  loading: boolean;
  error: string | null;
}

const OrderBookTable: React.FC<OrderBookTableProps> = ({
  stockSymbol,
  stockData,
  loading,
  error,
}) => {
  if (!stockSymbol) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Please select a stock to view order book
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Order Book</h3>
        </div>
        <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!stockData?.data) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Order Book</h3>
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          )}
        </div>
        {loading ? (
          <div className="text-gray-500 text-sm">Loading order book...</div>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            No order book data available
          </div>
        )}
      </div>
    );
  }

  const { bid, offer, total_bid_offer } = stockData.data;

  // Helper function to get price color based on comparison with previous price
  const getPriceColor = (price: string): string => {
    if (!price) return "";
    const priceValue = parseInt(price);
    const previousPrice = stockData.data.previous;

    if (priceValue > previousPrice) {
      return "text-green-600";
    } else if (priceValue < previousPrice) {
      return "text-red-600";
    } else {
      return "text-gray-900";
    }
  };

  // Get the top 10 entries for each side
  const topBids = bid.slice(0, 10);
  const topOffers = offer.slice(0, 10);

  // Ensure both arrays have the same length for proper table display
  const maxLength = Math.max(topBids.length, topOffers.length);
  const paddedBids = [...topBids];
  const paddedOffers = [...topOffers];

  // Pad shorter array with empty objects
  while (paddedBids.length < maxLength) {
    paddedBids.push({
      price: "",
      que_num: "",
      volume: "",
      change_percentage: "",
    });
  }
  while (paddedOffers.length < maxLength) {
    paddedOffers.push({
      price: "",
      que_num: "",
      volume: "",
      change_percentage: "",
    });
  }

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          Order Book - {stockData.data.symbol}
        </h3>
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

      {/* Order Book Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-2 font-medium text-blue-600">
                Bid Freq
              </th>
              <th className="text-left p-2 font-medium text-blue-600">
                Bid Vol
              </th>
              <th className="text-left p-2 font-medium text-gray-700">
                Bid Price
              </th>
              <th className="text-left p-2 font-medium text-gray-700">
                Offer Price
              </th>
              <th className="text-left p-2 font-medium text-blue-600">
                Offer Vol
              </th>
              <th className="text-left p-2 font-medium text-blue-600">
                Offer Freq
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: maxLength }, (_, index) => {
              const bidRow = paddedBids[index];
              const offerRow = paddedOffers[index];

              return (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-2 text-blue-600">
                    {bidRow.que_num
                      ? parseInt(bidRow.que_num).toLocaleString()
                      : ""}
                  </td>
                  <td className="p-2">
                    {bidRow.volume
                      ? parseInt(bidRow.volume).toLocaleString()
                      : ""}
                  </td>
                  <td
                    className={`p-2 font-medium ${getPriceColor(bidRow.price)}`}
                  >
                    {bidRow.price
                      ? parseInt(bidRow.price).toLocaleString()
                      : ""}
                  </td>
                  <td
                    className={`p-2 font-medium ${getPriceColor(
                      offerRow.price
                    )}`}
                  >
                    {offerRow.price
                      ? parseInt(offerRow.price).toLocaleString()
                      : ""}
                  </td>
                  <td className="p-2">
                    {offerRow.volume
                      ? parseInt(offerRow.volume).toLocaleString()
                      : ""}
                  </td>
                  <td className="p-2 text-blue-600">
                    {offerRow.que_num
                      ? parseInt(offerRow.que_num).toLocaleString()
                      : ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium text-red-600">Total Bid</div>
            <div className="text-xs text-gray-600">
              Freq: {total_bid_offer.bid.freq}
            </div>
            <div className="text-xs text-gray-600">
              Lot: {total_bid_offer.bid.lot}
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium">TOTAL</div>
            <div className="text-xs text-gray-600">
              Avg: {stockData.data.average?.toLocaleString() || "N/A"}
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium text-green-600">Total Offer</div>
            <div className="text-xs text-gray-600">
              Freq: {total_bid_offer.offer.freq}
            </div>
            <div className="text-xs text-gray-600">
              Lot: {total_bid_offer.offer.lot}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderBookTable;
