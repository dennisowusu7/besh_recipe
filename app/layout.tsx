import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "./components/SessionProvider";
import { NavBar } from "./components/NavBar";
import Footer from "./components/Footer";
import { cn } from "../lib/utils";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Besh Recipes",
  description: "Discover a world of culinary delights with Besh Recipes! Our platform offers a diverse collection of mouthwatering recipes, from quick and easy meals to gourmet dishes. Whether you're a seasoned chef or a kitchen novice, Besh Recipes has something for everyone. Explore our user-friendly interface, save your favorite recipes, and share your culinary creations with friends and family. Join our community of food enthusiasts and elevate your cooking game with Besh Recipes today!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full antialiased font-sans")}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <SessionProvider>
          <Toaster />
          <NavBar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
