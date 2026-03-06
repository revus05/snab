import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { getSessionFromCookies } from "@/src/shared/lib/auth";
import { prisma } from "@/src/shared/lib/prisma";
import {
  normalizeTheme,
  THEME_COOKIE_NAME,
  type Theme,
} from "@/src/shared/lib/theme";
import { ThemeProvider } from "@/src/shared/ui/theme-provider";

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

async function getInitialTheme(): Promise<Theme> {
  const cookieStore = await cookies();
  const cookieTheme = normalizeTheme(cookieStore.get(THEME_COOKIE_NAME)?.value);

  const session = await getSessionFromCookies();
  if (!session) {
    return cookieTheme;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { theme: true },
  });

  if (!user) {
    return cookieTheme;
  }

  return user.theme === "DARK" ? "dark" : "light";
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialTheme = await getInitialTheme();

  return (
    <html
      lang="ru"
      suppressHydrationWarning
      className={`${roboto.variable} ${initialTheme === "dark" ? "dark" : ""}`}
      style={{ colorScheme: initialTheme }}
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider initialTheme={initialTheme}>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
