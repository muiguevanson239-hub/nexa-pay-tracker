"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Transaction = {
  id: string;
  type: "income" | "expense";
  amount: number;
  note: string;
  created_at: string;
};

export default function Home() {
  // ---------------- AUTH (CUSTOM PHONE LOGIN) ----------------
  const [user, setUser] = useState<any>(null);
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");

  // ---------------- APP DATA ----------------
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");

  // ---------------- PAYMENT ----------------
  const [paymentCode, setPaymentCode] = useState("");
  const [isPremium, setIsPremium] = useState(false);

  // ---------------- LOGIN (PHONE + PIN) ----------------
  async function login() {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("phone", phone)
      .eq("pin", pin)
      .single();

    if (error || !data) {
      alert("Invalid phone or PIN");
      return;
    }

    setUser(data);

    loadTransactions(data.id);
    checkPremium(data.id);
  }

  // ---------------- SIGNUP ----------------
  async function signup() {
    if (!phone || !pin) {
      alert("Enter phone and PIN");
      return;
    }

    const { error } = await supabase.from("users").insert([
      {
        phone,
        pin,
      },
    ]);

    if (error) {
      alert("User already exists or error");
      return;
    }

    alert("Account created. You can now login.");
  }

  // ---------------- LOGOUT ----------------
  function logout() {
    setUser(null);
    setTransactions([]);
  }

  // ---------------- LOAD TRANSACTIONS ----------------
  async function loadTransactions(userId: string) {
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setTransactions(data || []);
  }

  // ---------------- CHECK PREMIUM ----------------
  async function checkPremium(userId: string) {
    const { data } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "approved");

    setIsPremium((data?.length || 0) > 0);
  }

  // ---------------- ADD TRANSACTION ----------------
  async function addTransaction() {
    if (!user) return;

    const amountNumber = Number(amount);

    if (Number.isNaN(amountNumber) || amountNumber <= 0) {
      alert("Invalid amount");
      return;
    }

    if (!isPremium && transactions.length >= 5) {
      alert("Upgrade to Premium");
      return;
    }

    const { error } = await supabase.from("transactions").insert([
      {
        user_id: user.id,
        type,
        amount: amountNumber,
        note,
      },
    ]);

    if (error) {
      alert(error.message);
      return;
    }

    setAmount("");
    setNote("");
    loadTransactions(user.id);
  }

  // ---------------- PAYMENT ----------------
  async function submitPaymentCode() {
    if (!user) return;

    const { error } = await supabase.from("payments").insert([
      {
        user_id: user.id,
        code: paymentCode,
        status: "pending",
      },
    ]);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Payment submitted");
    setPaymentCode("");
  }

  // ---------------- CALCULATIONS ----------------
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((a, b) => a + Number(b.amount), 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((a, b) => a + Number(b.amount), 0);

  const balance = income - expense;

  // ---------------- UI ----------------
  return (
    <main className="min-h-screen bg-black text-white p-4">
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="text-3xl font-bold">NexaPay Tracker</h1>

        {/* LOGIN */}
        {!user ? (
          <div className="bg-zinc-900 p-4 space-y-3">
            <input
              className="w-full p-3 text-black"
              placeholder="Phone number (07XXXXXXXX)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <input
              className="w-full p-3 text-black"
              placeholder="4-digit PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />

            <div className="flex gap-2">
              <button onClick={login} className="flex-1 bg-green-600 py-3">
                Login
              </button>

              <button onClick={signup} className="flex-1 bg-blue-600 py-3">
                Sign Up
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="flex justify-between text-sm text-gray-400">
              <span>{user.phone}</span>
              <button onClick={logout} className="text-red-400">
                Logout
              </button>
            </div>

            {/* BALANCE */}
            <div className="bg-zinc-900 p-4">
              <p className="text-sm text-gray-400">Balance</p>
              <h2 className="text-3xl font-bold">KES {balance}</h2>
            </div>

            {/* SUMMARY */}
            <div className="flex gap-2">
              <div className="flex-1 bg-green-600 p-2">+ {income}</div>
              <div className="flex-1 bg-red-600 p-2">- {expense}</div>
            </div>

            {/* INPUTS */}
            <select
              className="w-full p-2 text-black"
              value={type}
              onChange={(e) =>
                setType(e.target.value as any)
              }
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>

            <input
              className="w-full p-2 text-black"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <input
              className="w-full p-2 text-black"
              placeholder="Note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            <button
              onClick={addTransaction}
              className="w-full bg-blue-600 py-3"
            >
              Add Transaction
            </button>

            {/* PREMIUM */}
            <div className="bg-zinc-900 p-4 space-y-2">
              <p>Premium Upgrade (KES 100)</p>

              <input
                className="w-full p-2 text-black"
                placeholder="M-Pesa Code"
                value={paymentCode}
                onChange={(e) => setPaymentCode(e.target.value)}
              />

              <button
                onClick={submitPaymentCode}
                className="w-full bg-yellow-500 text-black py-2"
              >
                Submit
              </button>

              {isPremium && (
                <p className="text-green-400">
                  Premium Active
                </p>
              )}
            </div>

            {/* TRANSACTIONS */}
            <div className="space-y-2">
              {transactions.map((t) => (
                <div
                  key={t.id}
                  className="bg-zinc-800 p-3 flex justify-between"
                >
                  <div>
                    <p>{t.note}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(t.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div
                    className={
                      t.type === "income"
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  >
                    {t.type === "income" ? "+" : "-"}
                    {t.amount}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}