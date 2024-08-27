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
  const { current } = storeToRefs(useRoutesMainStore())
  const module = ref<TModule>('Locus')
  const counts = ref({ items: 0, media: 0 })
  const welcomeText = ref<string>('')
  const firstSlug = ref<string>('')

  const backgroundImage = computed(() => {
    switch (current.value.name) {
      case 'welcome':
        return {
          fullUrl: `${bucketUrl.value}app/background/${module.value}.jpg`,
          tnUrl: `${bucketUrl.value}app/background/${module.value}-tn.jpg`,
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

  /*
   * if module is not included, use current (we include it when we want tags of related item)
   */
  function tagAndSlugFromId(id: string, m?: TModule) {
    const store = getStore(typeof m === 'undefined' ? module.value : m)
    return store.tagAndSlugFromId(id)
  }

  function categorizerByFieldName(field: string) {
    const store = getStore(module.value)
    return store.categorizerByFieldName(field as keyof TCategorizedFields)
  }

  function modulePrepareForNew(isCreate: boolean, ids?: string[]) {
    const store = getStore(module.value)
    return store.prepareForNew(isCreate, ids)
  }

  function beforeStore(isCreate: boolean) {
    const store = getStore(module.value)
    return store.beforeStore(isCreate)
  }
  const moduleNewFields = computed(() => {
    const store = getStore(module.value)
    return store.newFields
  })

  const mainTableHeaders = computed(() => {
    const store = getStore(module.value)
    return store.mainTableHeaders
  })

  function setModuleInfo(initData: {
    module: TModule
    counts: { items: number; media: number }
    welcomeText: string
    firstId: string
  }): void {
    module.value = initData.module
    counts.value = initData.counts
    welcomeText.value = initData.welcomeText
    firstSlug.value = tagAndSlugFromId(initData.firstId, initData.module).slug
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

  return {
    setModuleInfo,
    categorizerByFieldName,
    module,
    counts,
    welcomeText,
    firstSlug,
    backgroundImage,
    tagAndSlugFromId,
    modulePrepareForNew,
    beforeStore,
    moduleNewFields,
    mainTableHeaders,
  }
})
