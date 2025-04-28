"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage("Registration failed: " + error.message);
    } else {
      setMessage("Registration successful! Check your email for confirmation.");
      setTimeout(() => router.push("/login"), 3000);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      <h1 className="text-3xl font-bold">Register</h1>

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
        className="bg-green-600 text-white p-2 rounded w-72 hover:bg-green-700"
        onClick={handleRegister}
      >
        Register
      </button>

      {message && <p className="text-center text-sm">{message}</p>}
    </main>
  );
}
