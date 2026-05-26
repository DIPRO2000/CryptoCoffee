import { Providers } from "@/components/providers";
import "./globals.css"; 

export default function RootLayout({children,}: {children: React.ReactNode;}) 
{
  return (
    <html lang="en">
      <body>
        <Providers>
          {/* Next.js automatically injects the current page here */}
          {children}
        </Providers>
      </body>
    </html>
  );
}