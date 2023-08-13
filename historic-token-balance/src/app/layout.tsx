import './globals.css'
import satoshi from 'next/font/local';
import { Source_Code_Pro } from 'next/font/google';
import type { Metadata } from 'next'
import Providers from './providers'
import Navbar from '@/components/layout/Navbar';

const Satoshi = satoshi({
  src: '../../public/fonts/Satoshi-Variable.ttf',
  display: "swap",
  weight: "500 700",
  variable: "--font-satoshi",
});

const SourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  display: "swap",
  weight: ["400", "600"],
  variable: "--font-source-code-pro",
});

export const metadata: Metadata = {
  title: 'Historic Token Balance',
  description: 'Get a historic ERC-20 token balance for any Ethereum address',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${Satoshi.className} ${Satoshi.variable} ${SourceCodePro.variable}`}>
        <Providers>
          <main className="flex min-h-screen flex-col justify-start items-center gap-10">
            <Navbar />
            <div className="flex flex-col w-[43em] items-center gap-4 p-4">
              {children}
            </div>
            </main>
        </Providers>
      </body>
    </html>
  )
}
