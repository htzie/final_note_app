"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    const res = await fetch("http://localhost:3001/auth/register", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ username, password })
    });
    if (res.ok) {
      alert("Registered. Please login.");
      router.push("/login");
    } else {
      const err = await res.json();
      alert("Register failed: " + (err.error || res.status));
    }
  }

  return (
    <div className="container">
      <h2>Register</h2>
      <form onSubmit={submit}>
        <input className="input" placeholder="username" value={username} onChange={e=>setUsername(e.target.value)} />
        <input className="input" type="password" placeholder="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="button" type="submit">Register</button>
      </form>
    </div>
  );
}