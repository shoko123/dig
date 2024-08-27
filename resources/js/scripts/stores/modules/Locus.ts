import { ref, computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import {
  TFieldsByModule,
  TFieldsUnion,
  FuncSlugToId,
  TCategorizerByFieldName,
  TCategorizedFields,
} from '@/js/types/moduleTypes'
import { useItemStore } from '../../../scripts/stores/item'
import { useItemNewStore } from '../../../scripts/stores/itemNew'

export const useLocusStore = defineStore('locus', () => {
  const newFields = ref<Partial<TFieldsByModule<'Locus'>>>({})
  const { fields } = storeToRefs(useItemStore())
  const { openIdSelectorModal } = storeToRefs(useItemNewStore())

  const categorizer: TCategorizerByFieldName<'Locus'> = {}

  function categorizerByFieldName<key extends keyof TCategorizedFields>(field: key) {
    return categorizer[field]
  }

  const slugToId: FuncSlugToId = function (slug: string) {
    const arr = slug.split('.')

    if (arr.length !== 3) {
      return {
        success: false,
        message: 'No . [dot] detected in slug',
      }
    } else {
      return {
        success: true,
        id: slug,
      }
    }
  }

  function tagAndSlugFromId(id: string) {
    //console.log(`Stone.tagAndSlugFromId()`)
    return { tag: id, slug: id }
  }

  const currentIds = ref<string[]>([])

  function prepareForNew(isCreate: boolean, ids?: string[]): void {
    Object.assign(newFields.value, fields.value as TFieldsByModule<'Stone'>)

    if (isCreate) {
      currentIds.value = ids!
      openIdSelectorModal.value = true
    }
  }

  function beforeStore(isCreate: boolean): TFieldsUnion | false {
    //console.log(`stone.beforStore() isCreate: ${isCreate}  fields: ${JSON.stringify(fields, null, 2)}`)
    if (isCreate) {
      return newFields.value as TFieldsByModule<'Locus'>
    } else {
      return newFields.value as TFieldsByModule<'Locus'>
    }
  }

  const mainTableHeaders = computed(() => {
    return [
      { title: 'Label', align: 'start', key: 'tag' },
      { title: 'OC Label', align: 'start', key: 'oc_label' },
      { title: 'Square', align: 'start', key: 'square' },
      { title: 'Published Date', align: 'start', key: 'published_date' },
    ]
  })

  return {
    newFields,
    mainTableHeaders,
    prepareForNew,
    beforeStore,
    slugToId,
    tagAndSlugFromId,
    categorizerByFieldName,
  }
})
