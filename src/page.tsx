"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function HomePage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        router.push("/login");
        return;
      }

      setUserEmail(user.email ?? null);
      
      const adminEmail = "a38yuan@uwaterloo.ca"; 
      if (user.email === adminEmail) {
        setIsAdmin(true);
      }
    }

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 space-y-6">
      <h1 className="text-4xl font-bold text-center">🎯 UW Prediction Market</h1>

      {userEmail && (
        <p className="text-center text-gray-600">Welcome back, {userEmail}!</p>
      )}

      <div className="flex flex-col items-center space-y-4 mt-8 w-full max-w-sm">
        <button
          onClick={() => router.push("/markets")}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
        >
          🎯 View Markets
        </button>

        <button
          onClick={() => router.push("/leaderboard")}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg"
        >
          🏆 View Leaderboard
        </button>

        {isAdmin && (
          <button
            onClick={() => router.push("/admin")}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg"
          >
            🛠️ Admin Panel
          </button>
        )}

        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg"
        >
          🚪 Logout
        </button>
      </div>
    </main>
  );
}
