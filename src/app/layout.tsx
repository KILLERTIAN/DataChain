import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Outfit } from 'next/font/google';

import { ReactQueryProvider } from "@/components/ReactQueryProvider";
import { WalletProvider } from "@/components/WalletProvider";
import { Toaster } from "@/components/ui/toaster";
import { WrongNetworkAlert } from "@/components/WrongNetworkAlert";
import { ThemeProvider } from 'next-themes'
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

import "./globals.css";

const outfit = Outfit({ 
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  applicationName: "DataChain",
  title: "DataChain - Blockchain-Powered Dataset Ownership",
  description: "A GitHub for datasets, powered by blockchain trust. Register, verify, and track datasets on-chain with tamper-proof ownership and provenance tracking.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={outfit.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <WalletProvider>
            <ReactQueryProvider>
              <Header />
              <div id="root">{children}</div>
              <WrongNetworkAlert />
              <Toaster />
            </ReactQueryProvider>
            <Footer />
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

// TODO: Test responsiveness on desktop, tablet, and mobile
