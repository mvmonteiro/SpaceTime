import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'

export async function memoriesRoutes(app: FastifyInstance) {
  // antes de executar a próxima função -> verifica se o usuário está autenticado (executa pra todas informações de rotas)
  app.addHook('preHandler', async (request) => {
    await request.jwtVerify()
  })

  // listagem de todas memórias
  app.get('/memories', async (request) => {
    const memories = await prisma.memory.findMany({
      where: {
        userId: request.user.sub,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return memories.map((memory) => {
      return {
        id: memory.id,
        coverUrl: memory.coverUrl,
        excerpt: memory.content.substring(0, 115).concat('...'),
        createdAt: memory.createdAt,
      }
    })
  })

  // detalhe de uma memória
  app.get('/memories/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    // compara se o request.params é um esquema que segue o paramsSchema -> se true retorna o id | se false retorna um erro
    const { id } = paramsSchema.parse(request.params)

    // encontra uma única memória específica onde o id é igual ao id do parÂmetro único| caso não encontrar ele dispara um erro
    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })

    // caso true, não podemos retornar a memória! não é daquele user
    if (!memory.isPublic && memory.id !== request.user.sub) {
      return reply.status(401).send()
    }

    return memory
  })

  // criação da memória
  app.post('/memories', async (request) => {
    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false), // as vezes a info do public é 0 (false) ou 1 (true) -> coerce transforma em boolean
    })

    const { content, coverUrl, isPublic } = bodySchema.parse(request.body)

    const memory = await prisma.memory.create({
      data: {
        content,
        coverUrl,
        isPublic,
        userId: request.user.sub,
      },
    })

    return memory
  })

  // atualização da memória
  app.put('/memories/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false), // as vezes a info do public é 0 (false) ou 1 (true) -> coerce transforma em boolean
    })

    const { content, coverUrl, isPublic } = bodySchema.parse(request.body)

    let memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })

    if (memory.userId !== request.user.sub) {
      return reply.status(401).send()
    }

    memory = await prisma.memory.update({
      where: {
        id,
      },
      data: {
        content,
        coverUrl,
        isPublic,
      },
    })

    return memory
  })

  // deletar uma memória
  app.delete('/memories/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    // compara se o request.params é um esquema que segue o paramsSchema -> se true retorna o id | se false retorna um erro
    const { id } = paramsSchema.parse(request.params)

    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })

    if (memory.userId !== request.user.sub) {
      return reply.status(401).send()
    }

    // encontra uma única memória específica onde o id é igual ao id do parÂmetro único| caso não encontrar ele dispara um erro
    await prisma.memory.delete({
      where: {
        id,
      },
    })
  })
}
