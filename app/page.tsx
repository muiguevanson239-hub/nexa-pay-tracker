"use client";

import { useState } from "react";
import LoginCard from "@/components/LoginCard";
import Dashboard from "@/components/Dashboard";

type User = {
  id: string;
  phone: string;
  pin: string;
  created_at?: string;
};

export default function Home() {
  // ---------------- AUTH STATE ----------------
  const [user, setUser] = useState<User | null>(null);

  return (
    <main className="min-h-screen bg-black text-white p-4">
      <div className="max-w-md mx-auto">

        {/* ---------------- AUTH GATE ---------------- */}
        {!user ? (
          <LoginCard setUser={setUser} />
        ) : (
          <Dashboard user={user as User} />
        )}

      </div>
    </main>
  );
}