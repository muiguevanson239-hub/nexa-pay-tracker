"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type User = {
  id: string;
  phone: string;
  pin: string;
  created_at?: string;
};

type AddTransactionProps = {
  user: User;
  onAdd: () => void;
};

export default function AddTransaction({ user, onAdd }: AddTransactionProps) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");

  async function submit() {
    if (!amount || !note) return;

    await supabase.from("transactions").insert([
      {
        user_id: user.id,
        amount: Number(amount),
        note,
        type,
      },
    ]);

    setAmount("");
    setNote("");
    onAdd();
  }

  return (
    <div className="bg-zinc-900 p-4 rounded-2xl space-y-3 border border-zinc-800">
      <select
        className="w-full p-3 text-black rounded-xl"
        value={type}
        onChange={(e) => setType(e.target.value as "income" | "expense")}
      >
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>

      <input
        className="w-full p-3 text-black rounded-xl"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <input
        className="w-full p-3 text-black rounded-xl"
        placeholder="Note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <button
        onClick={submit}
        className="w-full bg-blue-600 py-3 rounded-xl font-semibold"
      >
        Add Transaction
      </button>
    </div>
  );
}