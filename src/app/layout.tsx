import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-sans",
  subsets: ["thai", "latin"],
});

export const metadata: Metadata = {
  title: "สร้างข้อความขอเอกสาร",
  description: "เครื่องมือภายในสำหรับสร้างข้อความขอเอกสารจากลูกค้า",
  other: { google: "notranslate" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // translate="no": Chrome auto-translate rewrites text nodes, which makes
    // React crash with "insertBefore ... not a child of this node".
    <html
      lang="th"
      translate="no"
      className={`${notoSansThai.variable} notranslate h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-muted/30">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
