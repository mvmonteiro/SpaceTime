import { api } from '@/lib/api'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // variáveis com a url que o usuário requisitou
  const redirectTo = request.cookies.get('redirectTo')?.value

  // acesso aos parâmetros existentes na url
  const { searchParams } = new URL(request.url)

  // pegamos somente o código do usuário
  const code = searchParams.get('code')

  // no back-end a rota está definida como post
  const registerResponse = await api.post('/register', {
    code,
  })

  // com o servidor ligado conseguimos acesso ao token vindo do back-end
  const { token } = registerResponse.data

  // redireciona o usuário a rota root da url da aplicação -> request.url da aplicação
  const redirectURL = redirectTo ?? new URL('/', request.url) // se existir um redirectTo ele manda pra lá, se não manda para home

  const cookiesExperiesInSeconds = 60 * 60 * 24 * 30

  // salvamos o token através do cookie que está disponível pra toda aplicação através do path = /
  // o tempo de experies do cookie foi alterado para 1 mes
  return NextResponse.redirect(redirectURL, {
    headers: {
      'Set-Cookie': `token=${token}; Path=/; max-age=${cookiesExperiesInSeconds}`,
    },
  })
}
