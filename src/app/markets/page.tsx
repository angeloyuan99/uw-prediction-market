"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import BetModal from "@/components/BetModal";
import { useRouter } from "next/navigation";

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
  const [tokens, setTokens] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch user's token balance
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("tokens")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error loading profile:", profileError);
      } else {
        setTokens(profile.tokens);
      }

      // Fetch active markets
      const { data: marketData, error: marketError } = await supabase
        .from("markets")
        .select("*")
        .eq("resolved", false)
        .order("closes_at", { ascending: true });

      if (marketError) {
        console.error("Error loading markets:", marketError);
      } else {
        setMarkets(marketData as Market[]);
      }

      setLoading(false);
    }

    fetchData();
  }, [router]);

  if (loading) {
    return <p className="p-8 text-center">Loading markets...</p>;
  }

  return (
    <main className="p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold mb-4">Prediction Markets</h1>

      {/* Show token balance */}
      {tokens !== null && (
        <div className="bg-gray-100 p-4 rounded-lg mb-8 text-center">
          <p className="text-lg">
            🎯 You have <span className="font-bold">{tokens}</span> tokens
          </p>
        </div>
      )}

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
                  {/* Future: show real total bets here */}
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

      {/* Bet modal */}
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
