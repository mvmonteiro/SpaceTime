import { NextRequest, NextResponse } from 'next/server'

// link para a tela de login
const sigInURL = `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}`

export function middleware(request: NextRequest) {
  // verifica se o usuário está logado acessando o valor da variável token dentro de cookie para ver se tem algo
  const token = request.cookies.get('token')?.value

  // caso não esteja logado, o usuário será redirecionado para uma página de login
  if (!token) {
    return NextResponse.redirect(sigInURL, {
      headers: {
        // cria um cookie (salvando no storage) que pega a url requisitada pelo usuário para que ele faça o login e caia naquela página
        'Set-Cookie': `redirectTo=${request.url}; Path=/; httpOnly; max-age=20`,
        // httpOnly faz com que o usuário não consiga ver o cookie -> somente o backend consegue ver
      },
    })
  }

  // caso ele estiver logado a página não fará nada
  return NextResponse.next()
}

// em quais caminhos da aplicação o middleware será disparado
// obriga que o usuário esteja logado na conta para acessar
export const config = {
  matcher: '/memories/:path*',
}
