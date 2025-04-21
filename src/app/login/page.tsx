"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    if (!email.endsWith("@uwaterloo.ca")) {
      setMessage("Please use a @uwaterloo.ca email.");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      setMessage("Login failed: " + error.message);
    } else {
      setMessage("Check your email for a login link!");
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">Login</h1>
      <input
        type="email"
        placeholder="yourname@uwaterloo.ca"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="px-4 py-2 border rounded mb-4 w-80"
      />
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Send Magic Link
      </button>
      {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}
    </main>
  );
}
