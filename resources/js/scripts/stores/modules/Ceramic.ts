import { ref, computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import {
  TFieldsByModule,
  TFieldsUnion,
  FuncSlugToId,
  TCategorizerByFieldName,
  TCategorizedFields,
} from '@/js/types/moduleTypes'
import { useItemStore } from '../item'
import { useItemNewStore } from '../itemNew'

export const useCeramicStore = defineStore('ceramic', () => {
  const { fields } = storeToRefs(useItemStore())
  const { openIdSelectorModal } = storeToRefs(useItemNewStore())
  const newFields = ref<Partial<TFieldsByModule<'Ceramic'>>>({})

  const categorizer: TCategorizerByFieldName<'Ceramic'> = {}

  function categorizerByFieldName<key extends keyof TCategorizedFields>(field: key) {
    return categorizer[field]
  }

  const slugToId: FuncSlugToId = function (slug: string) {
    const arr = slug.split('.')

    if (arr.length === 2) {
      return {
        success: true,
        id: slug,
      }
    }
    return { success: false, message: 'No . [dot] detected in slug.' }
  }

  function tagAndSlugFromId(id: string) {
    return { tag: id, slug: id }
  }

  // function bespokeFiltersByModule() {
  //   const bespoke: TCategorizerByFieldName<'Ceramic'> = {}
  //   return bespoke
  // }

  const currentIds = ref<string[]>([])

  function prepareForNew(isCreate: boolean, ids?: string[]): void {
    //console.log(`stone.beforStore() isCreate: ${isCreate}  fields: ${JSON.stringify(fields, null, 2)}`)
    Object.assign(newFields.value, fields.value as TFieldsByModule<'Stone'>)

    if (isCreate) {
      currentIds.value = ids!
      openIdSelectorModal.value = true
    }
  }

  function beforeStore(isCreate: boolean): TFieldsUnion | false {
    //console.log(`stone.beforStore() isCreate: ${isCreate}  fields: ${JSON.stringify(fields, null, 2)}`)
    if (isCreate) {
      //
    }
    return newFields.value as TFieldsByModule<'Ceramic'>
  }

  const headers = computed(() => {
    return [
      { title: 'Name', align: 'start', key: 'tag' },
      { title: 'Year', align: 'end', key: 'year' },
      { title: 'Type', align: 'start', key: 'type' },
      { title: 'Cross Reference', align: 'start', key: 'cross_ref' },
      { title: 'Description', align: 'start', key: 'description' },
      { title: 'Stratum', align: 'start', key: 'stratum' },
      { title: 'Square', align: 'start', key: 'square' },
      { title: 'Elevation', align: 'start', key: 'elevation' },
    ]
  })

  return {
    newFields,
    prepareForNew,
    beforeStore,
    tagAndSlugFromId,
    slugToId,
    // bespokeFiltersByModule,
    headers,
    categorizerByFieldName,
  }
})
