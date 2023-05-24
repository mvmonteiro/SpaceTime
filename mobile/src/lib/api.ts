import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://172.18.216.237:3333',
})
