import { ref, computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import type {
  TModuleToUrlName,
  TUrlModuleNameToModule,
  TModuleBtnsInfo,
  TModule,
} from '@/js/types/moduleTypes'
import { useXhrStore } from './xhr'
import { useAuthStore } from './auth'
import { useMediaStore } from './media'

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
  const { initMedia } = useMediaStore()
  const { accessibility } = storeToRefs(useAuthStore())
  const { send } = useXhrStore()

  const initialized = ref(false)
  const appName = ref('')
  const googleMapsApiKey = ref('')
  const moduleToUrlModuleName = ref<Partial<TModuleToUrlName>>({})
  const urlModuleNameToModule = ref<Partial<TUrlModuleNameToModule>>({})

  async function appInit() {
    const res = await send<sendApiAppInit>('app/init', 'get')
    if (res.success) {
      const data = <sendApiAppInit>res.data
      initMedia(data.bucketUrl, data.media_collections)
      accessibility.value = data.accessibility
      initialized.value = true
      googleMapsApiKey.value = data.googleMapsApiKey
      appName.value = data.app_name
      moduleToUrlModuleName.value = data.modules
      urlModuleNameToModule.value = inverse(data.modules)
    } else {
      console.log(`app/init failed status: ${res.status} message: ${res.message}`)
      throw 'app.init() failed'
    }
  }

  function inverse<T extends TModuleToUrlName>(obj: Readonly<T>): TUrlModuleNameToModule {
    const tmpMap = new Map()
    let res: Partial<TUrlModuleNameToModule> = {}
    Object.entries(obj).forEach(([key, value]) => {
      tmpMap.set(value, key)
    })
    res = Object.fromEntries(tmpMap.entries())
    return res as TUrlModuleNameToModule
  }

  const moduleBtnsInfo = computed<TModuleBtnsInfo[]>(() => {
    const arr: TModuleBtnsInfo[] = []
    Object.entries(moduleToUrlModuleName.value).forEach(([k, v]) => {
      arr.push({
        title: k,
        url_module: v,
        module: <TModule>k,
      })
    })

    return arr
  })

  return {
    initialized,
    appInit,
    appName,
    moduleToUrlModuleName,
    urlModuleNameToModule,
    moduleBtnsInfo,
    googleMapsApiKey,
  }
})
