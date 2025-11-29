import Link from "next/link";

export default function Home() {
  return (
    <div className="container">
      <div className="header">
        <h1>DIT Notes</h1>
        <div>
          <Link href="/login"><button className="button" style={{marginRight:8}}>Login</button></Link>
          <Link href="/register"><button className="button">Register</button></Link>
        </div>
      </div>

      <p>Notes app demo with JWT auth. Click Notes after logging in.</p>
      <div style={{marginTop:20}}>
        <Link href="/notes"><button className="button">Go to Notes</button></Link>
      </div>
    </div>
  );
}