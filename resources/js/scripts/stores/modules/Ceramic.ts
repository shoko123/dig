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

  const mainTableHeaders = computed(() => {
    return [
      { title: 'Name', align: 'start', key: 'tag' },
      { title: 'Year', align: 'start', key: 'id_year' },
      { title: 'Field Description', align: 'start', key: 'field_description' },
      { title: 'Specialist Description', align: 'start', key: 'specialist_description' },
    ]
  })

  return {
    newFields,
    mainTableHeaders,
    prepareForNew,
    beforeStore,
    tagAndSlugFromId,
    slugToId,
    categorizerByFieldName,
  }
})
