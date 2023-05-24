import { ReactNode } from 'react'
import './globals.css'
import {
  Roboto_Flex as Roboto,
  Bai_Jamjuree as BaiJamjuree,
} from 'next/font/google'
import { CopyRight } from '@/components/Copyright'
import { Hero } from '@/components/Hero'
import { Profile } from '@/components/Profile'
import { SignIn } from '@/components/SingIn'
import { cookies } from 'next/headers'

const roboto = Roboto({ subsets: ['latin'], variable: '--font-roboto' })
const baiJamJuree = BaiJamjuree({
  subsets: ['latin'],
  weight: '700',
  variable: '--font-bai-jam-juree',
})

export const metadata = {
  title: 'SpaceTime',
  description:
    'Uma cápsula do tempo construída utiliando React, Next.js, TypeScript, Prisma (SQLite) e TailwindCSS',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  // verifica se o token está dentro do cookies
  const isAuthenticated = cookies().has('token')

  return (
    <html lang="en">
      <body
        className={`${roboto.variable} ${baiJamJuree.variable} bg-gray-900 font-sans text-gray-200`}
      >
        <main className="grid min-h-screen grid-cols-2">
          {/* Left Section */}
          <div className="relative flex flex-col items-start justify-between overflow-hidden border-r border-white/10 bg-[url(../assets/bg-stars.svg)] bg-cover px-28 py-16">
            {/* Blur */}
            <div className="absolute right-0 top-1/2 h-[288px] w-[526px] -translate-y-1/2 translate-x-1/2 rounded-full bg-purple-700 opacity-50 blur-full" />
            {/* Stripes */}
            <div className="absolute bottom-0 right-2 top-0 w-2 bg-stripes " />
            {/* Sign In */}
            {/* fizemos um ternário -> caso exista o cookie -> tem um token -> se tem um token -> o usuário está logado -> se está logado -> aparece outro componente */}
            {isAuthenticated ? <Profile /> : <SignIn />}
            {/* Hero */}
            <Hero />
            {/* CopyRight */}
            <CopyRight />
          </div>

          {/* Right Section */}
          <div className="flex max-h-screen flex-col overflow-y-scroll bg-[url(../assets/bg-stars.svg)] bg-cover">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}
