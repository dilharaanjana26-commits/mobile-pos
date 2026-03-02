import "./globals.css";

export const metadata = {
  title: "Mobile POS",
  description: "Mobile Shop POS",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, Arial" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>{children}</div>
      </body>
    </html>
  );
}
