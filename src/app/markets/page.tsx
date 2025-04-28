"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import BetModal from "@/components/BetModal";

type Market = {
  id: string;
  question: string;
  options: string[];
  closes_at: string;
  resolved: boolean;
  winning_option: string | null;
};

export default function MarketsPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);

  useEffect(() => {
    async function fetchMarkets() {
      const { data, error } = await supabase
        .from("markets")
        .select("*")
        .eq("resolved", false)
        .order("closes_at", { ascending: true });

      if (error) {
        console.error("Error loading markets:", error);
      } else {
        setMarkets(data as Market[]);
      }
      setLoading(false);
    }

    fetchMarkets();
  }, []);

  if (loading) {
    return <p className="p-8 text-center">Loading markets...</p>;
  }

  return (
    <main className="p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold mb-4">Prediction Markets</h1>

      {markets.length === 0 ? (
        <p>No active markets available. Check back later!</p>
      ) : (
        markets.map((market) => (
          <div key={market.id} className="border rounded-lg p-4 shadow">
            <h2 className="text-xl font-semibold mb-2">{market.question}</h2>
            <ul className="space-y-2">
              {market.options.map((option) => (
                <li
                  key={option}
                  className="flex justify-between items-center px-4 py-2 bg-gray-100 rounded"
                >
                  <span>{option}</span>
                  {/* We'll show real bet totals later */}
                  <span className="font-mono">0 tokens</span>
                </li>
              ))}
            </ul>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => setSelectedMarket(market)}
            >
              Bet
            </button>
          </div>
        ))
      )}

      {selectedMarket && (
        <BetModal
          isOpen={!!selectedMarket}
          onClose={() => setSelectedMarket(null)}
          marketId={selectedMarket.id}
          options={selectedMarket.options}
        />
      )}
    </main>
  );
}
