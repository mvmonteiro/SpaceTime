'use client'

import { Camera } from 'lucide-react'
import { MediaPicker } from './MediaPicker'
import { FormEvent } from 'react'
import { api } from '@/lib/api'
import Cookie from 'js-cookie'
import { useRouter } from 'next/navigation'

export function NewMemoryForm() {
  // redirecionamento do usuário
  const router = useRouter()

  async function handleCreateMemory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // usamos o currentTarget pois assim ele aponta pra div (form) em si e não para o botão
    const formData = new FormData(event.currentTarget)

    // pegamos somente o campo com o nome do arquivo para fazer o upload
    const fileToUpload = formData.get('coverUrl')

    // variável com a url da imagem
    let coverUrl = ''

    if (fileToUpload) {
      // a rota no back-end não suporta json -> utilizamos o multiFormData -> por isso tem que enviar dessa maneira
      const uploadFormData = new FormData()
      uploadFormData.set('file', fileToUpload)

      // método post para o back-end com a url que foi criada para imagem
      const uploadResponse = await api.post('/upload', uploadFormData)

      coverUrl = uploadResponse.data.fileUrl
    }

    // utilizamos a extensão de cookies para conseguir usar em um arquivo com 'use client'
    // assim conseguimos acesso ao atribute token de cookie para ver se o usuário está logado
    const token = Cookie.get('token')

    // salvando a imagem no banco de dados das memórias -> agora como um objeto em json
    await api.post(
      '/memories',
      {
        coverUrl,
        content: formData.get('content'),
        isPublic: formData.get('isPublic'),
      },
      {
        // salvar a memória depende do usário estar logado -> verificação através do headers
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    // redirecionamento do usuário para a home page
    router.push('/')
  }

  return (
    <form className="flex flex-1 flex-col gap-2" onSubmit={handleCreateMemory}>
      <div className="flex items-center gap-4">
        <label
          htmlFor="media"
          className="flex cursor-pointer items-center gap-1.5 text-sm text-gray-300 hover:text-gray-100"
        >
          <Camera className="h-4 w-4"></Camera>
          Anexar mídia
        </label>

        <label
          htmlFor="isPublic"
          className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-gray-100"
        >
          <input
            type="checkbox"
            name="isPublic"
            id="isPublic"
            value="true"
            className="border-gay-400 h-4 w-4 rounded bg-gray-700 text-purple-500"
          />
          Tornar memória pública
        </label>
      </div>

      <MediaPicker />

      <textarea
        name="content"
        spellCheck={false}
        className="w-full flex-1 resize-none rounded border-0 bg-transparent p-0 text-lg leading-relaxed text-gray-100 placeholder:text-gray-400 focus:ring-0"
        placeholder="Fique livre para adicionar fotos, vídeos e relatos sobre essa experiência que você quer lembrar para sempre."
      />

      <button
        type="submit"
        className="inline-block self-end rounded-full bg-green-500 px-5 py-3 font-alt text-sm font-bold uppercase leading-none text-black hover:bg-green-600"
      >
        Salvar
      </button>
    </form>
  )
}
