import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "طريقك من الإيجار إلى امتلاك مسكن",
  description: "حلول ذكية لمساعدتك في الانتقال من الإيجار إلى امتلاك منزلك الأول",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
