import React, { useState } from "react";
import { Plus } from "lucide-react";
import AuthSettings from "~/components/AuthSettings";
import TradingCard from "~/components/TradingCard";

interface TradingCardData {
  id: number;
}

const TradingBookApp = () => {
  const [authToken, setAuthToken] = useState("");
  const [cards, setCards] = useState<TradingCardData[]>([
    {
      id: 1,
    },
  ]);

  const addCard = () => {
    const newCard: TradingCardData = {
      id: Date.now(),
    };
    setCards((prev) => [...prev, newCard]);
  };

  const removeCard = (cardId: number) => {
    if (cards.length > 1) {
      setCards((prev) => prev.filter((card) => card.id !== cardId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Authentication Settings */}
        <AuthSettings authToken={authToken} onAuthTokenChange={setAuthToken} />

        {/* Add Card Button */}
        <div className="flex justify-end">
          <button
            onClick={addCard}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Card</span>
          </button>
        </div>

        {/* Trading Cards */}
        <div className="space-y-6">
          {cards.map((card) => (
            <TradingCard
              key={card.id}
              id={card.id}
              authToken={authToken}
              onRemove={removeCard}
              canRemove={cards.length > 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TradingBookApp;
