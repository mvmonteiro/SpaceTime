/** @type {import('next').NextConfig} */
const nextConfig = {
  // dizemos qual domínio eu quero permitir que o next carregue uma imagem
  images: {
    domains: ['avatars.githubusercontent.com', 'localhost'],
  },
}

module.exports = nextConfig
