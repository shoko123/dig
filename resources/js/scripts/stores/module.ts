// stores/module.ts
import { defineStore, storeToRefs } from 'pinia'
import { ref, computed } from 'vue'
import type { TModule, TCategorizedFields } from '../../types/moduleTypes'
import { useMediaStore } from './media'
import { useRoutesMainStore } from './routes/routesMain'
import { useLocusStore } from './modules/Locus'
import { useCeramicStore } from './modules/Ceramic'
import { useStoneStore } from './modules/Stone'

export const useModuleStore = defineStore('module', () => {
  const { bucketUrl } = storeToRefs(useMediaStore())
  const { current, to } = storeToRefs(useRoutesMainStore())
  const counts = ref({ items: 0, media: 0 })
  const welcomeText = ref<string>('')
  const firstSlug = ref<string>('')

  const backgroundImage = computed(() => {
    switch (current.value.name) {
      case 'welcome':
        return {
          fullUrl: `${bucketUrl.value}app/background/${current.value.module}.jpg`,
          tnUrl: `${bucketUrl.value}app/background/${current.value.module}-tn.jpg`,
        }
      case 'login':
      case 'register':
      case 'forgot-password':
      case 'reset-password':
        return {
          fullUrl: `${bucketUrl.value}app/background/Auth.jpg`,
          tnUrl: `${bucketUrl.value}app/background/Auth-tn.jpg`,
        }
      default:
        return undefined
    }
  })

  function tagAndSlugFromId(module: TModule, id: string): { tag: string; slug: string } {
    //console.log(`module.tagAndSlugFromId()`)
    const store = getStore(module)
    return store.tagAndSlugFromId(id)
  }

  function categorizerByFieldName(module: TModule, field: string) {
    const store = getStore(module)
    return store.categorizerByFieldName(field as keyof TCategorizedFields)
  }

  function setModuleInfo(initData: {
    counts: { items: number; media: number }
    welcomeText: string
    firstId: string
  }): void {
    counts.value = initData.counts
    welcomeText.value = initData.welcomeText
    firstSlug.value = tagAndSlugFromId(<TModule>to.value.module, initData.firstId).slug
  }

  function getStore(module: TModule) {
    switch (module) {
      case 'Locus':
        return useLocusStore()
      case 'Ceramic':
        return useCeramicStore()
      case 'Stone':
        return useStoneStore()
      default:
        return useCeramicStore()
    }
  }

  const getCurrentModuleStore = computed(() => {
    return getStore(<TModule>current.value.module)
  })

  return {
    counts,
    welcomeText,
    firstSlug,
    backgroundImage,
    getCurrentModuleStore,
    getStore,
    tagAndSlugFromId,
    setModuleInfo,
    categorizerByFieldName,
  }
})
