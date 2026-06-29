import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/settings/ThemeProvider";
import { AdminWidget } from "@/components/admin/AdminWidget";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  variable: "--font-thai",
  weight: ["400", "500", "600", "700", "800"]
});

export const metadata: Metadata = {
  title: "ผจญภัยดินแดนเศษส่วน",
  description: "แพลตฟอร์มเรียนเศษส่วน ป.4-ป.6 ด้วยบทเรียน เกม และภารกิจ"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`${notoSansThai.variable} font-sans`}>
        <ThemeProvider>
          {children}
          <AdminWidget />
        </ThemeProvider>
      </body>
    </html>
  );
}
