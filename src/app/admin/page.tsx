"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Market = {
  id: string;
  question: string;
  options: string[];
  closes_at: string;
  resolved: boolean;
};

export default function AdminPage() {
  const router = useRouter(); 
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedWinners, setSelectedWinners] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function checkAdmin() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user || !user.email) {
        router.push("/login");
        return;
      }

      const adminEmail = "a38yuan@uwaterloo.ca";

      if (user.email !== adminEmail) {
        router.push("/");
      }
    }

    checkAdmin();
  }, [router]);

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
    }

    fetchMarkets();
  }, []);

  const resolveMarket = async (marketId: string) => {
    const winningOption = selectedWinners[marketId];
    if (!winningOption) {
      setMessage("Please select a winning option.");
      return;
    }

    const { error: updateError } = await supabase
      .from("markets")
      .update({
        resolved: true,
        winning_option: winningOption,
      })
      .eq("id", marketId);

    if (updateError) {
      setMessage("Failed to update market: " + updateError.message);
      return;
    }

    const { error: payoutError } = await supabase.rpc("payout_market", { p_market_id: marketId });

    if (payoutError) {
      setMessage("Failed to payout: " + payoutError.message);
    } else {
      setMessage("Market resolved and payouts completed!");
      setMarkets(markets.filter((m) => m.id !== marketId));
    }
  };

  if (markets.length === 0) {
    return <p className="p-8 text-center">No open markets to resolve.</p>;
  }

  return (
    <main className="p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin - Resolve Markets</h1>

      {markets.map((market) => (
        <div key={market.id} className="border rounded-lg p-4 shadow">
          <h2 className="text-xl font-semibold mb-2">{market.question}</h2>
          <select
            className="w-full p-2 border rounded mb-4"
            value={selectedWinners[market.id] || ""}
            onChange={(e) =>
              setSelectedWinners((prev) => ({ ...prev, [market.id]: e.target.value }))
            }
          >
            <option value="">Select winning option</option>
            {market.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            onClick={() => resolveMarket(market.id)}
          >
            Resolve Market
          </button>
        </div>
      ))}

      {message && (
        <p className="text-center mt-6 text-lg text-blue-600 font-semibold">{message}</p>
      )}
    </main>
  );
}
