import type { Metadata } from "next";
import { Hind_Siliguri, Outfit } from "next/font/google";
import "./globals.css";

const hindSiliguri = Hind_Siliguri({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["bengali"],
  variable: "--font-hind-siliguri",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "গ্রিন হেভেন - প্রিমিয়াম অনলাইন নার্সারি ও গাছ ঘর",
  description: "ইনডোর, আউটডোর গাছ এবং গার্ডেনিং এক্সেসরিজ কিনুন গ্রিন হেভেন থেকে। আমাদের কাছে পাবেন সুস্থ-সবল গাছ সরাসরি নার্সারি থেকে হোম ডেলিভারি সহ।",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="bn"
      className={`${hindSiliguri.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900 font-sans">
        {children}
      </body>
    </html>
  );
}
