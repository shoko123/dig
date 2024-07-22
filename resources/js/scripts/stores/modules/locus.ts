import { ref, computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { TFieldsByModule, TFieldsUnion, FuncSlugToId } from '@/js/types/moduleTypes'
import { useItemStore } from '../../../scripts/stores/item'
import { useItemNewStore } from '../../../scripts/stores/itemNew'
export const useLocusStore = defineStore('locus', () => {
  const newFields = ref<Partial<TFieldsByModule<'Locus'>>>({})

  const { fields } = storeToRefs(useItemStore())
  const { openIdSelectorModal } = storeToRefs(useItemNewStore())

  const slugToId: FuncSlugToId = function (slug: string) {
    const arr = slug.split('.')

    if (arr.length === 1) {
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
      return newFields.value as TFieldsByModule<'Locus'>
    } else {
      return newFields.value as TFieldsByModule<'Locus'>
    }
  }

  const headers = computed(() => {
    return [
      { title: 'Label', align: 'start', key: 'tag' },
      { title: 'OC Label', align: 'start', key: 'oc_label' },
      { title: 'Basic Typology', align: 'start', key: 'basic_typology' },
      { title: 'Number', align: 'start', key: 'number' },
      { title: 'Subnumber', align: 'start', key: 'sub_number' },
      { title: 'Square', align: 'start', key: 'square' },
      { title: 'Published Date', align: 'start', key: 'published_date' },
      { title: 'Updated Date', align: 'start', key: 'updated_date' },
    ]
  })

  return {
    newFields,
    prepareForNew,
    beforeStore,
    slugToId,
    tagAndSlugFromId,
    headers,
  }
})
