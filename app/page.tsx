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
  // AUTH
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // APP DATA
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");

  // PAYMENT
  const [paymentCode, setPaymentCode] = useState("");
  const [isPremium, setIsPremium] = useState(false);

  // UI
  const [loading, setLoading] = useState(false);

  // AUTH INIT
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // LOGIN
  async function login() {
    if (!email || !password) {
      alert("Enter email and password");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    }
  }

  // SIGNUP
  async function signup() {
    if (!email || !password) {
      alert("Enter email and password");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Account created successfully");
  }

  // LOGOUT
  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    setTransactions([]);
  }

  // LOAD TRANSACTIONS
  async function loadTransactions(userId: string) {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error) {
      setTransactions(data || []);
    }
  }

  // CHECK PREMIUM
  async function checkPremium(userId: string) {
    const { data } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "approved");

    setIsPremium((data?.length || 0) > 0);
  }

  // USER DATA INIT
  useEffect(() => {
    if (!user) return;

    loadTransactions(user.id);
    checkPremium(user.id);
  }, [user]);

  // ADD TRANSACTION
  async function addTransaction() {
    if (!user) return;

    const amountNumber = Number(amount);

    if (Number.isNaN(amountNumber) || amountNumber <= 0) {
      alert("Enter valid amount");
      return;
    }

    if (!isPremium && transactions.length >= 5) {
      alert("Upgrade to Premium to continue");
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

  // SUBMIT PAYMENT
  async function submitPaymentCode() {
    if (!user) return;

    if (!paymentCode.trim()) {
      alert("Enter transaction code");
      return;
    }

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

    alert("Payment submitted for review");
    setPaymentCode("");
  }

  // CALCULATIONS
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = income - expense;

  return (
    <main className="min-h-screen bg-black text-white p-4">
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="text-3xl font-bold">
          NexaPay Tracker
        </h1>

        {!user ? (
          <div className="bg-zinc-900 rounded-lg p-4 space-y-3">
            <input
              className="w-full p-3 rounded text-black"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              className="w-full p-3 rounded text-black"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={login}
                disabled={loading}
                className="bg-green-600 py-3 rounded"
              >
                {loading ? "Loading..." : "Login"}
              </button>

              <button
                onClick={signup}
                disabled={loading}
                className="bg-blue-600 py-3 rounded"
              >
                Sign Up
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center text-sm text-gray-400">
              <span>{user.email}</span>

              <button
                onClick={logout}
                className="text-red-400"
              >
                Logout
              </button>
            </div>

            <div className="bg-zinc-900 p-4 rounded-lg">
              <p className="text-gray-400 text-sm">
                Current Balance
              </p>

              <h2 className="text-3xl font-bold">
                KES {balance.toLocaleString()}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-green-700 p-3 rounded">
                + KES {income.toLocaleString()}
              </div>

              <div className="bg-red-700 p-3 rounded">
                - KES {expense.toLocaleString()}
              </div>
            </div>

            <select
              className="w-full p-3 rounded text-black"
              value={type}
              onChange={(e) =>
                setType(e.target.value as "income" | "expense")
              }
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>

            <input
              className="w-full p-3 rounded text-black"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <input
              className="w-full p-3 rounded text-black"
              placeholder="Description"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            <button
              onClick={addTransaction}
              className="w-full bg-blue-600 py-3 rounded"
            >
              Add Transaction
            </button>

            <div className="bg-zinc-900 p-4 rounded-lg space-y-2">
              <p>Premium Upgrade (KES 100)</p>

              <p className="text-sm text-gray-400">
                Send payment to your M-Pesa number and submit the code below.
              </p>

              <input
                className="w-full p-3 rounded text-black"
                placeholder="M-Pesa Transaction Code"
                value={paymentCode}
                onChange={(e) => setPaymentCode(e.target.value)}
              />

              <button
                onClick={submitPaymentCode}
                className="w-full bg-yellow-500 text-black py-3 rounded"
              >
                Submit Payment
              </button>

              {isPremium && (
                <p className="text-green-400">
                  Premium Active
                </p>
              )}
            </div>

            <div className="space-y-2">
              {transactions.map((t) => (
                <div
                  key={t.id}
                  className="bg-zinc-800 p-3 rounded flex justify-between"
                >
                  <div>
                    <p>{t.note}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(
                        t.created_at
                      ).toLocaleDateString()}
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