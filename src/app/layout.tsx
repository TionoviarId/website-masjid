import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/sidebar";
// import Header from "@/components/header";
// import { AuthProvider } from "../context/AuthContext"; // ⬅️ ini

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pantau Rammadhan",
  description: "Pantau Rammadhan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
      >
        {/* <AuthProvider> {/* ⬅️ Tambahkan di sini */}
          {/* <Header />  */}
          <div className="flex">
            <Sidebar />
            {children}
          </div>
        {/* </AuthProvider> */}
      </body>
    </html>
  );
}
