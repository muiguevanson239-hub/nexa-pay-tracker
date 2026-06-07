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
  // ---------------- AUTH ----------------
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");

  // ---------------- DATA ----------------
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");

  // ---------------- PAYMENT ----------------
  const [paymentCode, setPaymentCode] = useState("");
  const [isPremium, setIsPremium] = useState(false);

  // ---------------- INIT AUTH ----------------
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // ---------------- LOGIN ----------------
  async function login() {
    const { error } = await supabase.auth.signInWithOtp({
      email,
    });

    if (error) return alert(error.message);

    alert("Check your email for login link");
  }

  // ---------------- LOGOUT ----------------
  async function logout() {
    await supabase.auth.signOut();
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

  // ---------------- EFFECTS ----------------
  useEffect(() => {
    if (user) {
      loadTransactions(user.id);
      checkPremium(user.id);
    }
  }, [user]);

  // ---------------- ADD TRANSACTION ----------------
  async function addTransaction() {
    if (!user) return;

    // FREE LIMIT
    if (!isPremium && transactions.length >= 5) {
      alert("Upgrade to Premium to continue");
      return;
    }

    await supabase.from("transactions").insert([
      {
        user_id: user.id,
        type,
        amount: Number(amount),
        note,
      },
    ]);

    setAmount("");
    setNote("");
    loadTransactions(user.id);
  }

  // ---------------- SUBMIT PAYMENT CODE ----------------
  async function submitPaymentCode() {
    if (!user || !paymentCode) return;

    const { error } = await supabase.from("payments").insert([
      {
        user_id: user.id,
        code: paymentCode,
        status: "pending",
      },
    ]);

    if (error) return alert("Failed to submit");

    alert("Payment submitted. Waiting approval.");
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

        <h1 className="text-2xl font-bold">NexaPay Tracker</h1>

        {/* AUTH */}
        {!user ? (
          <div className="bg-zinc-900 p-3 space-y-2">
            <input
              className="w-full p-2 text-black"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={login} className="w-full bg-green-600 py-2">
              Login / Register
            </button>
          </div>
        ) : (
          <div className="flex justify-between text-sm text-gray-400">
            <p>{user.email}</p>
            <button onClick={logout} className="text-red-400">
              Logout
            </button>
          </div>
        )}

        {/* APP */}
        {user && (
          <>
            {/* BALANCE */}
            <div className="bg-zinc-900 p-4">
              <p className="text-sm text-gray-400">Balance</p>
              <h2 className="text-3xl font-bold">KES {balance}</h2>
            </div>

            {/* SUMMARY */}
            <div className="flex gap-2">
              <div className="flex-1 bg-green-600 p-2">
                + {income}
              </div>
              <div className="flex-1 bg-red-600 p-2">
                - {expense}
              </div>
            </div>

            {/* INPUTS */}
            <select
              className="w-full p-2 text-black"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
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
              className="w-full bg-blue-600 py-2"
            >
              Add Transaction
            </button>

            {/* PREMIUM BLOCK */}
            <div className="bg-zinc-900 p-3 mt-4 space-y-2">
              <p className="text-sm text-gray-300">
                💰 Upgrade to Premium (KES 100 via M-Pesa)
              </p>

              <p className="text-xs text-gray-400">
                Send to: <b>07XXXXXXXX</b>
              </p>

              <input
                className="w-full p-2 text-black"
                placeholder="Enter M-Pesa transaction code"
                value={paymentCode}
                onChange={(e) => setPaymentCode(e.target.value)}
              />

              <button
                onClick={submitPaymentCode}
                className="w-full bg-yellow-500 text-black py-2"
              >
                Submit Payment
              </button>

              {isPremium && (
                <p className="text-green-400 text-sm">
                  ✅ Premium Active
                </p>
              )}
            </div>

            {/* LIST */}
            <div className="space-y-2 mt-4">
              {transactions.map((t) => (
                <div key={t.id} className="bg-zinc-800 p-2 flex justify-between">
                  <div>
                    <p className="font-bold">{t.note}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(t.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <p className={t.type === "income" ? "text-green-400" : "text-red-400"}>
                    {t.type === "income" ? "+" : "-"}
                    {t.amount}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}