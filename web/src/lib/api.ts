import axios from 'axios'

// definindo a rota padrão do back-end
export const api = axios.create({
  baseURL: 'http://localhost:3333',
})
