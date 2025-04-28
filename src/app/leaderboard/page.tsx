"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Leader = {
  id: string;
  email: string;
  tokens: number;
};

type ProfileWithUser = {
  id: string;
  tokens: number;
  users: {
    email: string;
  }[];
};

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaders() {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, tokens, users(email)")
        .order("tokens", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error loading leaderboard:", error);
      } else if (data) {
        const formatted: Leader[] = (data as ProfileWithUser[]).map((row) => ({
          id: row.id,
          email: row.users?.[0]?.email || "Unknown", // <-- use [0] safely
          tokens: row.tokens,
        }));

        setLeaders(formatted);
      }
      setLoading(false);
    }

    fetchLeaders();
  }, []);

  if (loading) {
    return <p className="p-8 text-center">Loading leaderboard...</p>;
  }

  return (
    <main className="p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold mb-6 text-center">🏆 Leaderboard</h1>

      <ol className="space-y-4">
        {leaders.map((leader, index) => (
          <li
            key={leader.id}
            className="flex justify-between items-center border-b pb-2 text-lg"
          >
            <span>
              {index + 1}. {leader.email}
            </span>
            <span className="font-mono">{leader.tokens} tokens</span>
          </li>
        ))}
      </ol>
    </main>
  );
}
