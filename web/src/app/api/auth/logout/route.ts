import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // redireciona o usuário a rota root da url da aplicação -> request.url da aplicação
  const redirectURL = new URL('/', request.url)

  // salvamos o token através do cookie que está disponível pra toda aplicação através do path = /
  // o tempo de experies do cookie foi alterado para 1 mes
  return NextResponse.redirect(redirectURL, {
    headers: {
      // para deletar um cookie setamos o max-age para 0 -> assim o cookie expira | tiramos o valor do cookie
      'Set-Cookie': `token=; Path=/; max-age=${0}`,
    },
  })
}
