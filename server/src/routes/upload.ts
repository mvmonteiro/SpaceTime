import { randomUUID } from 'node:crypto'
import { extname, resolve } from 'node:path'
import { pipeline } from 'node:stream'
import { FastifyInstance } from 'fastify'
import { createWriteStream } from 'node:fs'
import { promisify } from 'node:util'

// o pipeline permite aguardar o processo de upload finalizar -> verificar quando o processo chegou a final
// como o stream vai ser um processo que vai indo aos poucos -> a verificação se acabou é através do pipeline
// o node não usa promises -> promisify transforma algumas funções mais antigas do node para promisses
const pump = promisify(pipeline)

export async function uploadRoutes(app: FastifyInstance) {
  app.post('/upload', async (request, reply) => {
    // promess de que vai chegar um arquivo
    const upload = await request.file({
      limits: {
        // limitando o tamanho do arquivo pra 5mb
        fileSize: 5_242_880, // 5mb
      },
    })

    // bad request caso não tenha nenhum upload
    if (!upload) {
      return reply.status(400).send()
    }

    // saber se é vídeo ou imagem
    const mimeTypeRegex = /^(image|video)\/[a-zA-Z]+/
    const isValidFileFormat = mimeTypeRegex.test(upload.mimetype)
    // caso a Regex não validar quer dizer que o mimeType não é nem vídeo nem imagem
    if (!isValidFileFormat) {
      return reply.status(400).send()
    }

    // id único para cada arquivo -> para não haver conflitos entre uploads com o mesmo nome
    const fileId = randomUUID()
    // retorno da extensão do arquivo
    const extension = extname(upload.filename)

    // nome único para o arquivo
    const fileName = fileId.concat(extension)

    // salvando o arquivos aos poucos -> não precisa ser inteiro de uma só vez
    const writeStream = createWriteStream(
      // caminho onde vamos salvar o arquivo que o usuário está fazendo upload
      resolve(__dirname, '../../uploads/', fileName), // __dirname é a pasta raíz; caminho para chegar até upload; nome do arquivo
    )

    // pipeline para verificar se o processo de upload já terminou
    await pump(upload.file, writeStream)

    // url inicial da aplicação "protocolo + domínio"
    const fullUrl = request.protocol.concat('://').concat(request.hostname)
    // pega a url do dominio e concatena com o nome do arquivo
    const fileUrl = new URL(`/uploads/${fileName}`, fullUrl).toString()

    return { fileUrl }
  })
}
