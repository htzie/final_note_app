import "./globals.css";

export const metadata = {
  title: "Notes App (Next.js)",
  description: "Notes App with JWT login",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ background: "#e6f7f5", minHeight: "100vh", padding: 20 }}>
        {children}
      </body>
    </html>
  );
}