export default function TransactionList({ transactions }: any) {
  return (
    <div className="space-y-2">
      {transactions.map((t: any) => (
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