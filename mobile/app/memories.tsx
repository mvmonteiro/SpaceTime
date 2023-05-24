import { Link, useRouter } from 'expo-router'
import { ScrollView, TouchableOpacity, View, Text, Image } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as SecureStore from 'expo-secure-store'
import React, { useEffect, useState } from 'react'
import { api } from '../src/lib/api'
import dayjs from 'dayjs'
import ptBr from 'dayjs/locale/pt-br'

import Icon from '@expo/vector-icons/Feather'
import Logo from '../src/assets/nlw-spacetime-logo.svg'

// transforma a data para BR
dayjs.locale(ptBr)

// interface por conta do TypeScript para informar o formato dos dados que vão vir do back-end
interface Memories {
  coverUrl: string
  excerpt: string
  id: string
  createdAt: string
}

export default function Memory() {
  // retorna as diferentes distâncias da parte de cima e de baixo do celular nas diferentes telas de diferentes celulares (na área segura)
  const { bottom, top } = useSafeAreaInsets()

  // redirecionamento do usuário
  const router = useRouter()

  // objeto com as memórias
  const [memories, setMemories] = useState<Memories[]>([])
  // função para sair da conta
  async function signOut() {
    await SecureStore.deleteItemAsync('token')

    router.push('/')
  }

  // dentro do useEffect não da pra fazer função assíncrona para utilização do token
  async function loadMemories() {
    const token = await SecureStore.getItemAsync('token')

    const response = await api.get('/memories', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    setMemories(response.data)
  }

  // carregar a informação vinda da api assim que o componente for exibido na tela
  useEffect(() => {
    loadMemories()
  }, [])

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingBottom: bottom, paddingTop: top }}
    >
      <View className="mt-4 flex-row items-center justify-between px-8">
        <Logo />

        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={signOut}
            className="h-10 w-10 items-center justify-center rounded-full bg-red-500"
          >
            <Icon name="log-out" size={16} color="#000" />
          </TouchableOpacity>

          <Link href="/memories" asChild>
            <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-green-500">
              <Icon name="plus" size={16} color="#000" />
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      <View className="mt-6 space-y-10">
        {memories.map((memory) => {
          return (
            <View className="space-y-4" key={memory.id}>
              <View className="item-center flex-row gap-2">
                <View className="h-px w-5 bg-gray-50"></View>
                <Text className="font-body text-sm text-gray-100">
                  {dayjs(memory.createdAt).format('D[ de ]MMMM[, ]YYYY')}
                </Text>
              </View>
              <View className="space-y-4 px-8">
                <Image
                  source={{ uri: memory.coverUrl }}
                  alt="imagem do upload do usuário"
                  className="aspect-video w-full rounded-lg "
                />

                <Text className="font-body text-base leading-relaxed text-gray-100">
                  {memory.excerpt}
                </Text>

                <Link href="/memories/id" asChild>
                  <TouchableOpacity className="flex-row items-center gap-2">
                    <Text className="font-body text-sm text-gray-200">
                      Ler mais
                    </Text>
                    <Icon name="arrow-right" size={16} color="#9e9ea0"></Icon>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          )
        })}
      </View>
    </ScrollView>
  )
}
