import { ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import type { TModuleToUrlName } from '@/types/moduleTypes'
import { useXhrStore } from './xhr'
import { useAuthStore } from './auth'

type sendApiAppInit = {
  appUrl: string
  bucketUrl: string
  googleMapsApiKey: string
  accessibility: {
    readOnly: boolean
    authenticatedUsersOnly: boolean
  }
  media_collections: string[]
  app_name: string
  modules: TModuleToUrlName
}

export const useMainStore = defineStore('main', () => {
  const { accessibility } = storeToRefs(useAuthStore())
  const { send } = useXhrStore()

  const initialized = ref(false)
  const appName = ref('')
  const googleMapsApiKey = ref('')
  const bucketUrl = ref('')
  const mediaCollectionNames = ref<string[]>([])

  async function appInit() {
    const res = await send<sendApiAppInit>('app/init', 'get')
    if (res.success) {
      bucketUrl.value = res.data.bucketUrl
      mediaCollectionNames.value = res.data.media_collections
      accessibility.value = res.data.accessibility
      initialized.value = true
      googleMapsApiKey.value = res.data.googleMapsApiKey
      appName.value = res.data.app_name
    } else {
      console.log(`app/init failed status: ${res.status} message: ${res.message}`)
      throw 'app.init() failed'
    }
  }

  return {
    initialized,
    appInit,
    appName,
    googleMapsApiKey,
    bucketUrl,
    mediaCollectionNames,
  }
})
