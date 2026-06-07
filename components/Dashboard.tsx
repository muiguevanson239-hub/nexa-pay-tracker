"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

import BalanceCard from "./BalanceCard";
import AddTransaction from "./AddTransaction";
import TransactionList from "./TransactionList";
import BottomNav from "./BottomNav";

type Transaction = {
  id: string;
  type: "income" | "expense";
  amount: number;
  note: string;
  created_at: string;
};

export default function Dashboard({ user }: { user: any }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tab, setTab] = useState<"home" | "add" | "stats">("home");

  // ✅ FIX: stable function (removes eslint warning)
  const loadTransactions = useCallback(async () => {
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setTransactions(data || []);
  }, [user.id]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((a, b) => a + Number(b.amount), 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((a, b) => a + Number(b.amount), 0);

  const balance = income - expense;

  return (
    <div className="space-y-4 pb-20">

      {tab === "home" && (
        <>
          <BalanceCard
            balance={balance}
            income={income}
            expense={expense}
          />

          <TransactionList transactions={transactions} />
        </>
      )}

      {tab === "add" && (
        <AddTransaction
          user={user}
          onAdd={loadTransactions}
        />
      )}

      {tab === "stats" && (
        <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
          <p>Income: {income}</p>
          <p>Expense: {expense}</p>
          <p>Balance: {balance}</p>
        </div>
      )}

      <BottomNav tab={tab} setTab={setTab} />
    </div>
  );
}