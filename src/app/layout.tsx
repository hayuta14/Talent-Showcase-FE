import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientThemeProvider from "./components/ClientThemeProvider";
<<<<<<< HEAD
import Navigation from "./components/Navigation";
=======
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
>>>>>>> 7c9537f (auth done)

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Talent Showcase",
  description: "A platform to showcase talent",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientThemeProvider>
          <Navigation />
          <main>
            {children}
          </main>
        </ClientThemeProvider>
      </body>
    </html>
  );
}