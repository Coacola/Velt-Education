import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { SessionWrapper } from "@/components/providers/SessionWrapper";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "greek"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Velt Education — Admin Dashboard",
  description: "Premium admin dashboard for Velt Education private tutoring institute",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="el" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <SessionWrapper>
        <div className="relative z-[1]">
          {children}
        </div>
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "rgba(13, 13, 26, 0.95)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: "12px",
              color: "rgba(255,255,255,0.95)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            },
          }}
        />
        </SessionWrapper>
      </body>
    </html>
  );
}
