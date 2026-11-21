import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ToastProvider from "@/components/ToastProvider";
import "./globals.css";

import MSWProvider from "@/components/MSWProvider";
import OfflineBanner from "@/components/OfflineBanner";
import ThemeToggle from "@/components/ThemeToggle";
import StoreProvider from "@/store/StoreProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Workforce Dashboard",
  description: "Workforce and project management dashboard",
};

const themeScript = `
(function () {
  try {
    var storedTheme = localStorage.getItem("workforce-theme");
    var systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var theme =
      storedTheme === "dark" ||
      (storedTheme !== "light" && systemDark)
        ? "dark"
        : "light";

    document.documentElement.classList.toggle(
      "dark",
      theme === "dark"
    );

    document.documentElement.style.colorScheme = theme;
  } catch (error) {
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: themeScript,
          }}
        />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-white text-gray-900 antialiased dark:bg-gray-950 dark:text-white`}
      >
        <MSWProvider>
          <StoreProvider>
            <ToastProvider>
              <OfflineBanner />
              <ThemeToggle />
              {children}
            </ToastProvider>
          </StoreProvider>
        </MSWProvider>
      </body>
    </html>
  );
}