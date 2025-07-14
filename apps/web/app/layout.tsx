import "./globals.css"
import { ReactNode } from "react";
import { AuthProvider } from "../context/AuthContext";

export const metadata = {
  title: "Threads",
  description: "A real-time blogging app",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}