"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage("Login failed: " + error.message);
    } else {
      setMessage("Login successful!");
      setTimeout(() => router.push("/markets"), 1000);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      <h1 className="text-3xl font-bold">Login</h1>

      <input
        className="border p-2 rounded w-72"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="border p-2 rounded w-72"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        className="bg-blue-600 text-white p-2 rounded w-72 hover:bg-blue-700"
        onClick={handleLogin}
      >
        Login
      </button>

      {message && <p className="text-center text-sm">{message}</p>}
    </main>
  );
}
