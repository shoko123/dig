// stores/module.ts
import { defineStore, storeToRefs } from 'pinia'
import { ref, computed } from 'vue'
import type { TModule, TObjIdTagAnddSlugFuncsByModule } from '../../types/moduleTypes'
import { useMediaStore } from './media'
import { useRoutesMainStore } from './routes/routesMain'

export const useModuleStore = defineStore('module', () => {
  const { bucketUrl } = storeToRefs(useMediaStore())
  const { current } = storeToRefs(useRoutesMainStore())
  const module = ref<TModule>('Locus')
  const counts = ref({ items: 0, media: 0 })
  const welcomeText = ref<string>('')
  const firstSlug = ref<string>('')

  const moduleSpecific = ref<{
    mainTableHeaders: { title: string; align: string; key: string }[]
  }>({
    mainTableHeaders: [],
  })

  // This object is defined here (rather than having specific functions implemented in each module)
  // for better code splitting.
  const tagAndSlugObj: TObjIdTagAnddSlugFuncsByModule = {
    Locus: {
      idToSlugTag: (id: string) => {
        return { slug: id, tag: id }
      },
      slugToId: (slug: string) => {
        const sections = slug.split('.')

        if (sections.length !== 3) {
          return {
            success: false,
            message: `Unsupported slug format detected: ${slug}`,
          }
        }

        return {
          success: true,
          id: slug,
        }
      },
    },
    Stone: {
      idToSlugTag: (id: string) => {
        return { slug: id, tag: id }
      },
      slugToId: (slug: string) => {
        const sections = slug.split('.')

        if (sections.length !== 3) {
          return {
            success: false,
            message: `Unsupported slug format detected: ${slug}`,
          }
        }

        return {
          success: true,
          id: slug,
        }
      },
    },
    Ceramic: {
      idToSlugTag: (id: string) => {
        return { slug: id, tag: id }
      },
      slugToId: (slug: string) => {
        const regex = /^\d{2}.\d{1}$/
        if (!regex.test(slug)) {
          return {
            success: false,
            message: `Unsupported slug format detected: ${slug}`,
          }
        }

        return {
          success: true,
          id: slug,
        }
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

    //set module specific data
    const store = await getStore(module.value)
    moduleSpecific.value.mainTableHeaders = store.mainTableHeaders

    console.log(
      `setModuleInfo(${module.value}) done. moduleSpecific: ${JSON.stringify(moduleSpecific.value, null, 2)}`,
    )
  }

  /*
   * if module is not included, use current (we include it e.g. when we want tags of related item)
   */
  function tagAndSlugFromId(id: string, m?: TModule) {
    const mod = typeof m === 'undefined' ? module.value : m
    const func = tagAndSlugObj[mod].idToSlugTag
    return func(id)
  }

  function slugToId(module: TModule, slug: string) {
    const func = tagAndSlugObj[module].slugToId
    const res = func(slug)
    console.log(` slugToId(${module}, ${slug} =>\n${JSON.stringify(res, null, 2)}`)
    return res
  }

  const mainTableHeaders = computed(() => {
    return moduleSpecific.value.mainTableHeaders
  })

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

  async function getStore(module: TModule) {
    switch (module) {
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

  async function getCurrentStore() {
    return await getStore(module.value)
  }

  return {
    setModuleInfo,
    getStore,
    getCurrentStore,
    module,
    moduleSpecific,
    counts,
    welcomeText,
    firstSlug,
    backgroundImage,
    slugToId,
    mainTableHeaders,
    tagAndSlugFromId,
    beforeStore,
    moduleNewFields,
  }
})
