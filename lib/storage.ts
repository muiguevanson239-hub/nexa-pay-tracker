export type Transaction = {
  id: string;
  type: "income" | "expense";
  amount: number;
  note: string;
  date: string;
};

const KEY = "nexapay_data";

export function getTransactions(): Transaction[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(KEY) || "[]");
}

export function saveTransactions(data: Transaction[]) {
  localStorage.setItem(KEY, JSON.stringify(data));
}