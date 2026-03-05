import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/src/shared/ui/theme-provider";
import { BottomNav } from "@/src/widgets/bottom-nav/bottom-nav";
import { Header } from "@/src/widgets/header/header";
import { Sidebar } from "@/src/widgets/sidebar/sidebar";

const roboto = Roboto({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SNAB Warehouse",
  description: "Склад тканей, технических тканей и войлока",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning className={roboto.variable}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <div className="min-h-screen bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.15),_transparent_55%)]">
            <Header />
            <div className="mx-auto grid min-h-[calc(100vh-56px)] max-w-7xl md:grid-cols-[230px_1fr]">
              <Sidebar />
              <main className="p-4 pb-20 md:pb-6">{children}</main>
            </div>
            <BottomNav />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
