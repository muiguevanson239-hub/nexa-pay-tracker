"use client";

import { useState } from "react";
import LoginCard from "@/components/LoginCard";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const [user, setUser] = useState<any>(null);

  return (
    <main className="min-h-screen bg-black text-white p-4">
      {!user ? (
        <LoginCard setUser={setUser} />
      ) : (
        <Dashboard user={user} setUser={setUser} />
      )}
    </main>
  );
}