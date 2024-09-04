// stores/module.ts
import { defineStore, storeToRefs } from 'pinia'
import { ref, computed } from 'vue'
import type { TModule, TObjIdTagAndSlugFuncsByModule } from '../../types/moduleTypes'
import { useMediaStore } from './media'
import { useRoutesMainStore } from './routes/routesMain'

export const useModuleStore = defineStore('module', () => {
  const { bucketUrl } = storeToRefs(useMediaStore())
  const { current } = storeToRefs(useRoutesMainStore())
  const module = ref<TModule>('Locus')
  const counts = ref({ items: 0, media: 0 })
  const welcomeText = ref<string>('')
  const firstSlug = ref<string>('')

  // This object is defined here (rather than having specific functions implemented in each module)
  // for better code splitting.
  const IdTagSlugObj: TObjIdTagAndSlugFuncsByModule = {
    Locus: {
      regexp: new RegExp(/^[a-zA-Z -]{2,10}.\d{1,3}.\d{1,3}$/),
      idToSlugTag: (id: string) => {
        return { slug: id, tag: id }
      },
    },
    Stone: {
      regexp: new RegExp(/^B20\d{2}.\d{1}.\d{1,3}$/),
      idToSlugTag: (id: string) => {
        return { slug: id, tag: id }
      },
    },
    Ceramic: {
      regexp: new RegExp(/^\d{2}.\d{1}$/),
      idToSlugTag: (id: string) => {
        return { slug: id, tag: id }
      },
    },
  }

  async function setModuleInfo(initData: {
    module: TModule
    counts: { items: number; media: number }
    welcomeText: string
    firstId: string
  }) {
    module.value = initData.module
    counts.value = initData.counts
    welcomeText.value = initData.welcomeText
    const ts = tagAndSlugFromId(initData.firstId, initData.module)
    firstSlug.value = ts.slug
  }

  /*
   * if module is not included, use current (we include it e.g. when we want tags of related item)
   */
  function tagAndSlugFromId(id: string, m?: TModule) {
    const mod = m === undefined ? module.value : m
    const func = IdTagSlugObj[mod].idToSlugTag
    return func(id)
  }

  function slugToId(m: TModule, slug: string) {
    if (!IdTagSlugObj[m].regexp.test(slug)) {
      return {
        success: false,
        message: `Unsupported ${module.value} slug: ${slug}`,
      }
    }
    return {
      success: true,
      id: slug,
    }
  }

  function beforeStore(isCreate: boolean) {
    return isCreate
    // const store = getStore(module.value)
    // return store.beforeStore(isCreate)
  }

  const moduleNewFields = computed(() => {
    return 'res'
    // const store = getStore(module.value)
    // return store.newFields
  })

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

  async function getStore(m?: TModule) {
    const mod = m === undefined ? module.value : m

    switch (mod) {
      case 'Locus':
        {
          const { useLocusStore } = await import('./modules/Locus')
          return useLocusStore()
        }
        break
      case 'Stone':
        {
          const { useStoneStore } = await import('./modules/Stone')
          return useStoneStore()
        }
        break
      case 'Ceramic': {
        const { useCeramicStore } = await import('./modules/Ceramic')
        return useCeramicStore()
      }
    }
  }

  return {
    setModuleInfo,
    getStore,
    module,
    counts,
    welcomeText,
    firstSlug,
    backgroundImage,
    slugToId,
    tagAndSlugFromId,
    beforeStore,
    moduleNewFields,
  }
})
