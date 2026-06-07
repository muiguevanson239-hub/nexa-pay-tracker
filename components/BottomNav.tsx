export default function BottomNav({ tab, setTab }: any) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-800 flex justify-around py-3 text-xs">
      <button onClick={() => setTab("home")}>Home</button>
      <button onClick={() => setTab("add")}>Add</button>
      <button onClick={() => setTab("stats")}>Stats</button>
    </div>
  );
}