"use client";

import { Dialog } from "@headlessui/react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

type BetModalProps = {
  isOpen: boolean;
  onClose: () => void;
  marketId: string;
  options: string[];
};

export default function BetModal({ isOpen, onClose, marketId, options }: BetModalProps) {
  const [selectedOption, setSelectedOption] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [message, setMessage] = useState("");

  const placeBet = async () => {
    if (!selectedOption || amount <= 0) {
      setMessage("Please choose an option and a valid amount.");
      return;
    }
  
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
      setMessage("You must be logged in to place a bet.");
      return;
    }
  
    // Fetch user's profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("tokens")
      .eq("id", user.id)
      .single();
  
    if (profileError || !profile) {
      setMessage("Failed to load your profile. Please try again.");
      return;
    }
  
    if (profile.tokens < amount) {
      setMessage("You don't have enough tokens to place this bet.");
      return;
    }
  
    // Start a transaction: Insert the bet and deduct tokens
    const { error: betError } = await supabase.rpc("place_bet_transaction", {
      p_user_id: user.id,
      p_market_id: marketId,
      p_option: selectedOption,
      p_amount: amount,
    });
  
    if (betError) {
      setMessage("Failed to place bet: " + betError.message);
    } else {
      setMessage("Bet placed successfully!");
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };
  

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded bg-white p-6 space-y-4">
          <Dialog.Title className="text-lg font-bold">Place a Bet</Dialog.Title>

          <select
            className="w-full border p-2 rounded"
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
          >
            <option value="">Select an option</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Amount of tokens"
            className="w-full border p-2 rounded"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />

          {message && <p className="text-sm text-center">{message}</p>}

          <button
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            onClick={placeBet}
          >
            Submit Bet
          </button>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
