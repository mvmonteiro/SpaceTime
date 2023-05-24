import { EmptyMemories } from '@/components/EmptyMemories'
import { api } from '@/lib/api'
import dayjs from 'dayjs'
import ptBr from 'dayjs/locale/pt-br'
import { ArrowRight } from 'lucide-react'
import { cookies } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'

// transforma a data para BR
dayjs.locale(ptBr)

interface Memory {
  id: string
  coverUrl: string
  excerpt: string
  createdAt: string
}

export default async function Home() {
  // autentificação do log do usuário
  const isAuthenticated = cookies().has('token')

  // Right Section
  // caso o usuário não esteja logado, sempre vai mostrar as memórias vazias
  if (!isAuthenticated) {
    return <EmptyMemories />
  }

  // caso o usuário esteja logado
  const token = cookies().get('token')?.value // pega o valor do token do usuário
  // pega todos os dados relacionados às memórias do usuário dentro do banco de dados
  const response = await api.get('/memories', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  // coloca os dados dentro de uma variável
  const memories: Memory[] = response.data

  // caso o usuário esteja logado, mas ainda não tenha nenhuma memória
  if (memories.length === 0) {
    return <EmptyMemories />
  }

  return (
    <div className="flex flex-col gap-10 p-8">
      {memories.map((memory) => {
        return (
          <div key={memory.id} className="space-y-4">
            <time className="-ml-8 flex items-center gap-2 text-sm text-gray-100 before:h-px before:w-5 before:bg-gray-50">
              {dayjs(memory.createdAt).format('D[ de ]MMMM[, ]YYYY')}
            </time>
            <Image
              src={memory.coverUrl}
              alt="user memory"
              width={592}
              height={580}
              className="aspect-video w-full rounded-lg object-cover"
            />
            <p className="text-lg leading-relaxed text-gray-100">
              {memory.excerpt}
            </p>
            <Link
              href={`/memories/${memory.id}`}
              className="flex items-center gap-2 text-sm text-gray-200 hover:text-gray-100"
            >
              Ler mais
              <ArrowRight className="h-4 w-4"></ArrowRight>
            </Link>
          </div>
        )
      })}
    </div>
  )
}
