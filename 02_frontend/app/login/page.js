"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    const res = await fetch("http://localhost:3001/auth/login", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ username, password })
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("notes_token", data.token);
      alert("Logged in");
      router.push("/notes");
    } else {
      const err = await res.json();
      alert("Login failed: " + (err.error || res.status));
    }
  }

  return (
    <div className="container">
      <h2>Login</h2>
      <form onSubmit={submit}>
        <input className="input" placeholder="username" value={username} onChange={e=>setUsername(e.target.value)} />
        <input className="input" type="password" placeholder="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="button" type="submit">Login</button>
      </form>
    </div>
  );
}