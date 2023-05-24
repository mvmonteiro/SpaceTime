'use client'

import { ChangeEvent, useState } from 'react'

export function MediaPicker() {
  const [preview, setPreview] = useState<string | null>(null)

  function onFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const { files } = event.target

    // garantindo que existe um arquivo
    if (!files) {
      return
    }

    // cria uma URL com o arquivo selecionado
    const previewURL = URL.createObjectURL(files[0]) // como só pode selecionar um arquivo por vez ele sempre vai estar em files[0]
    setPreview(previewURL)
  }

  return (
    <>
      <input
        type="file"
        id="media"
        className="hidden"
        onChange={onFileSelected}
        accept="image/*"
        name="coverUrl"
      />

      {preview && (
        // o eslint pede para utilizar o img do Next, mas não é necessário por ser só um preview -> não carrega dado no meu servidor, é local do usuário
        // eslint-disable-next-line
        <img
          // o src vem da URL que a função onFileSelected cria
          src={preview}
          alt=""
          className="aspect-video w-full rounded-lg object-cover "
        ></img>
      )}
    </>
  )
}
