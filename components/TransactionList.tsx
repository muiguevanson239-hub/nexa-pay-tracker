type Transaction = {
  id: string;
  type: "income" | "expense";
  amount: number;
  note: string;
  created_at: string;
};

type TransactionListProps = {
  transactions: Transaction[];
};

export default function TransactionList({ transactions }: TransactionListProps) {
  return (
    <div className="space-y-2">
      {transactions.map((t: Transaction) => (
        <div
          key={t.id}
          className="bg-zinc-900 p-3 rounded-xl flex justify-between"
        >
          <div>
            <p>{t.note}</p>
          </div>

          <p className={t.type === "income" ? "text-green-400" : "text-red-400"}>
            {t.type === "income" ? "+" : "-"}
            {t.amount}
          </p>
        </div>
      ))}
    </div>
  );
}