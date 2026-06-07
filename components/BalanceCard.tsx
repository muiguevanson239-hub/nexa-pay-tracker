export default function BalanceCard({ balance, income, expense }: any) {
  return (
    <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-5 rounded-2xl">
      <p className="text-xs opacity-80">Balance</p>
      <h2 className="text-3xl font-bold">KES {balance}</h2>

      <div className="flex justify-between mt-3 text-sm">
        <span>+ {income}</span>
        <span>- {expense}</span>
      </div>
    </div>
  );
}