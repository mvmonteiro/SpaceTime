import 'dotenv/config'
import fastify from 'fastify'
import { memoriesRoutes } from './routes/memories'
import { authRoutes } from './routes/auth'
import { uploadRoutes } from './routes/upload'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import { resolve } from 'node:path'

const app = fastify()

// extensão para conseguir receber qualquer tipo de dado do front
app.register(multipart)

// possibilita o acesso de todos arquivos estáticos do projeto pela url no browser
app.register(require('@fastify/static'), {
  // qual pasta estarão os arquivos estáticos
  root: resolve(__dirname, '../uploads'),
  prefix: '/uploads',
})

app.register(cors, {
  origin: true, // todas urls de front end poderam acessar o back-end
})

app.register(jwt, {
  secret: 'spacetime',
})

app.register(authRoutes)
app.register(uploadRoutes)
app.register(memoriesRoutes)

app
  .listen({
    port: 3333,
    host: '0.0.0.0',
  })
  .then(() => {
    console.log('Servidor online on http://localhost:3333 💕')
  })
