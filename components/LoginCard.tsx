"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginCard({ setUser }: any) {
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");

  async function login() {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("phone", phone)
      .eq("pin", pin)
      .single();

    if (!data) {
      alert("Invalid login");
      return;
    }

    setUser(data);
  }

  async function signup() {
    await supabase.from("users").insert([{ phone, pin }]);
    alert("Account created");
  }

  return (
    <div className="bg-zinc-900 p-4 rounded-2xl space-y-3">
      <input
        className="w-full p-3 text-black"
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <input
        className="w-full p-3 text-black"
        placeholder="PIN"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
      />

      <div className="flex gap-2">
        <button onClick={login} className="flex-1 bg-green-600 py-2">
          Login
        </button>

        <button onClick={signup} className="flex-1 bg-blue-600 py-2">
          Sign Up
        </button>
      </div>
    </div>
  );
}