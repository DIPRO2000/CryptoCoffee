import { Metadata } from "next";
import { Providers } from "@/components/providers"; 
import "./globals.css"; 

export const metadata: Metadata =
{
  title: "Crypto Cafe ",
  description: "Buy your favorite coffee and snacks using ETH, USDC, and CCT Tokens.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}