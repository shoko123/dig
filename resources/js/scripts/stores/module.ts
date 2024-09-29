// stores/module.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  TApiModuleInit,
  TModule,
  TItemsPerPageByView,
  TViewsForCollection,
  TModuleToUrlName,
  TUrlModuleNameToModule,
  TModuleBtnsInfo,
  TObjModuleDetails,
} from '../../types/moduleTypes'

import { TCName } from '@/types/collectionTypes'

export const useModuleStore = defineStore('module', () => {
  const module = ref<TModule>('Locus')
  const counts = ref({ items: 0, media: 0 })
  const welcomeText = ref<string>('')
  const firstSlug = ref<string>('')
  const itemsPerPage = ref<TItemsPerPageByView>({ Gallery: 0, Tabular: 0, Chips: 0 })
  const collectionViews = ref<TViewsForCollection>({ main: [], media: [], related: [] })

  const moduleToUrlModuleName = ref<TModuleToUrlName>({
    Ceramic: 'ceramics',
    Locus: 'loci',
    Stone: 'stones',
  })

  const urlModuleNameToModule = ref<TUrlModuleNameToModule>(inverse(moduleToUrlModuleName.value))

  function inverse<T extends TModuleToUrlName>(obj: T): TUrlModuleNameToModule {
    const tmpMap = new Map()
    let res: Partial<TUrlModuleNameToModule> = {}
    Object.entries(obj).forEach(([key, value]) => {
      tmpMap.set(value, key)
    })
    res = Object.fromEntries(tmpMap.entries())
    return res as TUrlModuleNameToModule
  }

  const details: TObjModuleDetails = {
    Ceramic: {
      regexp: new RegExp(/^\d{2}.\d{1}$/),
      idToSlugTag: (id: string) => {
        return { slug: id, tag: id }
      },
      categorizerObj: {},
    },
    Locus: {
      regexp: new RegExp(/^[a-zA-Z -]{2,10}.\d{1,3}.\d{1,3}$/),
      idToSlugTag: (id: string) => {
        return { slug: id, tag: id }
      },
      categorizerObj: {},
    },
    Stone: {
      regexp: new RegExp(/^B20\d{2}.\d{1}.\d{1,3}$/),
      idToSlugTag: (id: string) => {
        return { slug: id, tag: id }
      },
      categorizerObj: {
        old_museum_id: (val: string) => {
          // console.log(`old_museum_idCategorizer(${val})`)
          return val === null || (typeof val === 'string' && val.length === 0) ? 1 : 0
        },
      },
    },
  }

  function setModuleInfo(initData: TApiModuleInit) {
    module.value = initData.module
    counts.value = initData.counts
    welcomeText.value = initData.welcome_text
    const ts = tagAndSlugFromId(initData.first_id, initData.module)
    firstSlug.value = ts.slug
    itemsPerPage.value = initData.display_options.items_per_page
    collectionViews.value = initData.display_options.collection_views
  }

  function getItemsPerPage(collectionName: TCName, collectionViewIndex: number): number {
    return itemsPerPage.value[collectionViews.value[collectionName]![collectionViewIndex]!]!
  }

  function getViewName(collectionName: TCName, collectionViewIndex: number) {
    return collectionViews.value[collectionName]![collectionViewIndex]!
  }

  function getCollectionViews(collectionName: TCName) {
    return collectionViews.value[collectionName]!
  }
  /*
   * if module is not included, use current (we include it e.g. when we want tags of related item)
   */
  function tagAndSlugFromId(id: string, m?: TModule) {
    const mod = m === undefined ? module.value : m

    const func = details[mod].idToSlugTag
    return func(id)
  }

  function getCategorizer() {
    return details[module.value].categorizerObj
  }

  function slugToId(m: TModule, slug: string) {
    if (!details[m].regexp.test(slug)) {
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
    setModuleInfo,
    module,
    counts,
    welcomeText,
    firstSlug,
    itemsPerPage,
    collectionViews,
    urlModuleNameToModule,
    moduleToUrlModuleName,
    moduleBtnsInfo,
    slugToId,
    tagAndSlugFromId,
    getCollectionViews,
    getViewName,
    getItemsPerPage,
    getCategorizer,
  }
})
