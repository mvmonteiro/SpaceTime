import { FastifyInstance } from 'fastify'
import axios from 'axios'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', async (request) => {
    const bodySchema = z.object({
      code: z.string(),
    })

    // confere se o código é realmente um código
    const { code } = bodySchema.parse(request.body)

    // chamada para a API do github -> objetivo é enviar o código e receber o acessToken
    const acessTokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      null,
      {
        params: {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        },
        headers: {
          Accept: 'application/json',
        },
      },
    )

    // acess_token para acessar o usuário pela api do github
    const { access_token } = acessTokenResponse.data

    // requisição para a api do github
    const userResponse = await axios.get('https://api.github.com/user', {
      // o userResponse é quem carrega os dados do usuário vindo do github
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })

    // zod para a comparação para verificação dos dados
    const userSchema = z.object({
      id: z.number(),
      login: z.string(),
      name: z.string(),
      avatar_url: z.string().url(),
    })

    // parse no userResponse para verificar se os dados são realmente o que a gente deseja
    const userInfo = userSchema.parse(userResponse.data)

    // verifica se já existe um usuário com aquele mesmo id do github
    let user = await prisma.user.findUnique({
      where: {
        githubId: userInfo.id,
      },
    })

    // caso o id do usuário ainda não existir -> salvamos seus dados dentro do banco de dados
    if (!user) {
      user = await prisma.user.create({
        data: {
          githubId: userInfo.id,
          login: userInfo.login,
          name: userInfo.name,
          avatarUrl: userInfo.avatar_url,
        },
      })
    }

    const token = app.jwt.sign(
      {
        // primeiro objeto = quais infos do usuário eu quero que estejam contidas no token (somente públicas)
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      {
        sub: user.id,
        expiresIn: '30 days',
      },
    )

    // retorna os dados do usuário que foram salvos
    return {
      token,
    }
  })
}
