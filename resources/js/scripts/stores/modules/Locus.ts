import { ref, computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { TFields, TObjCategorizerByFieldName } from '@/types/moduleTypes'
import { useItemStore } from '../../../scripts/stores/item'

export const useLocusStore = defineStore('locus', () => {
  const { fields } = storeToRefs(useItemStore())
  const categorizer: TObjCategorizerByFieldName<'Locus'> = {}
  const currentIds = ref<string[]>([])

  async function prepareForNew(isCreate: boolean, ids?: string[]) {
    const { useItemNewStore } = await import('../../../scripts/stores/itemNew')
    const { newFields, openIdSelectorModal } = storeToRefs(useItemNewStore())
    Object.assign(newFields.value, fields.value as TFields<'Stone'>)

    if (isCreate) {
      currentIds.value = ids!
      openIdSelectorModal.value = true
    }
  }

  function beforeStore(formFields: Partial<TFields>, isCreate: boolean): Partial<TFields> {
    //console.log(`ceramic.beforStore() isCreate: ${isCreate}  fields: ${JSON.stringify(fields, null, 2)}`)
    if (isCreate) {
      //
    }
    return formFields
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
    mainTableHeaders,
    prepareForNew,
    beforeStore,
    categorizer,
  }
})
