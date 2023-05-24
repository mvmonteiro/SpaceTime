import { Image, ScrollView, Switch, Text, TextInput, View } from 'react-native'
import Icon from '@expo/vector-icons/Feather'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { TouchableOpacity } from 'react-native-gesture-handler'
import * as ImagePicker from 'expo-image-picker'
import * as SecureStore from 'expo-secure-store'
import { Link, useRouter } from 'expo-router'
import { useState } from 'react'
import { api } from '../src/lib/api'

import Logo from '../src/assets/nlw-spacetime-logo.svg'

export default function NewMemory() {
  // redirecionamento do usuário para alguma rota
  const router = useRouter()
  // retorna as diferentes distâncias da parte de cima e de baixo do celular nas diferentes telas de diferentes celulares (na área segura)
  const { bottom, top } = useSafeAreaInsets()

  // variável para anotar o estado atual do switch
  const [isPublic, setPublic] = useState(false)
  // variável para anotar o valor de cada campo do formulário dentro de um estado
  const [content, setContent] = useState('')
  // variável que carrega a uri da imagem que o usuário deseja utilizar
  const [preview, setPreview] = useState<string | null>(null)

  // função que pega a imagem que o usuário adicionou -> pegamos da documentação a função
  async function openImagePicker() {
    // função que faz com que abra a galeria para escolher uma foto
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      })

      if (result.assets[0]) {
        // aloca na variável preview a uri da imagem
        setPreview(result.assets[0].uri)
      }
    } catch (err) {
      // está com um erro sem tratamento
    }

    //   if (!result.canceled) {
    //     setImage(result.assets[0].uri);
    //   }
    // };
  }

  // função que pega o click do usuário em salvar e cria uma nova memória
  async function handleCreateMemory() {
    // verificação do token para ver se o usuário está logado
    const token = await SecureStore.getItemAsync('token')

    let coverUrl = ''

    // caso haja o upload de uma imagem
    if (preview) {
      // o mesmo que acontece no front -> não da para enviar com json
      const uploadFormData = new FormData()

      // setta o arquivo e cria um objetivo que vai simular um file
      uploadFormData.append('file', {
        uri: preview,
        name: 'image.jpg',
        type: 'image/jpeg',
      } as any)

      const uploadResponse = await api.post('/upload', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      // aqui temos a url da imagem que o usuário deseja utilizar
      coverUrl = uploadResponse.data.fileUrl
    }

    // inserção da imagem na api
    await api.post(
      '/memories',
      {
        content,
        isPublic,
        coverUrl,
      },
      {
        headers: {
          Authorization: `Bearer${token}`,
        },
      },
    )

    // redirecionamento do usuário para a rota memories
    router.push('/memories')
  }

  return (
    <ScrollView
      className="flex-1 px-8"
      contentContainerStyle={{ paddingBottom: bottom, paddingTop: top }}
    >
      <View className="mt-4 flex-row items-center justify-between">
        <Logo />

        <Link href="/memories" asChild>
          <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-gray-500">
            <Icon name="arrow-left" size={16} color="#FFF" />
          </TouchableOpacity>
        </Link>
      </View>

      <View className="mt-6 space-y-6">
        <View className="flex-row items-center gap-2">
          <Switch
            value={isPublic}
            onValueChange={setPublic}
            thumbColor={isPublic ? '#9b79ea' : '#9e9ea0'}
            trackColor={{ false: '#767577', true: '#372568' }}
          />
          <Text className="font-body text-base text-gray-200">
            Tornar memória pública
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={openImagePicker}
          className="h-32 items-center justify-center rounded-lg border-dashed border-gray-500 bg-black/20"
        >
          {preview ? (
            <Image
              source={{ uri: preview }}
              className="h-full w-full rounded-lg object-cover"
              alt="imagem do usuário"
            />
          ) : (
            <View className="flex-row items-center gap-2">
              <Icon name="image" color={'#FFF'} />
              <Text className="font-body text-sm text-gray-200">
                Adicionar foto ou vídeo de capa
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TextInput
          multiline
          className="p-0 font-body text-lg text-gray-50"
          placeholder="Fique livre para adicionar fotos, vídeos e relatos sobre essa experiência que você quer lembrar para sempre."
          placeholderTextColor="#56565a"
          value={content}
          onChangeText={setContent} // setta o valor quando o usuário escrever
        ></TextInput>

        <TouchableOpacity
          activeOpacity={0.7}
          className="items-center self-end rounded-full bg-green-500 px-5 py-2"
          onPress={handleCreateMemory} // função para pegar o submit do usuário ao clicar
        >
          <Text className="font-alt text-sm uppercase text-black">Salvar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}
