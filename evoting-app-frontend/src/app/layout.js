import "@/styles/globals.css";
import { AuthProvider } from "@/lib/auth";

export const metadata = {
  title: "Electoral Commission - E-Voting System",
  description: "Secure Electronic Voting Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
