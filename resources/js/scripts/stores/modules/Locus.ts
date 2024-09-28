import { computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { TFields, TObjCategorizerByFieldName, TFieldsDefaultsAndRules } from '@/types/moduleTypes'
import { useItemStore } from '../../../scripts/stores/item'

export const useLocusStore = defineStore('locus', () => {
  const defaultsAndRules: TFieldsDefaultsAndRules<'Locus'> = {
    id: { d: 'Change me', r: {} },
    category: { d: 'Bin', r: {} },
    a: { d: 3, r: {} },
    b: { d: 3, r: {} },
    oc_label: { d: '4', r: {} },
    square: { d: '', r: {} },
    uri: { d: '', r: {} },
    context_uri: { d: '', r: {} },
    published_date: { d: '', r: {} },
    updated_date: { d: '4', r: {} },
  }

  const { fields } = storeToRefs(useItemStore())
  const categorizer: TObjCategorizerByFieldName<'Locus'> = {}

  async function prepareForNew(isCreate: boolean) {
    const { useItemNewStore } = await import('../../../scripts/stores/itemNew')
    const { newFields, openIdSelectorModal } = storeToRefs(useItemNewStore())
    Object.assign(newFields.value, fields.value as TFields<'Stone'>)

    if (isCreate) {
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
    defaultsAndRules,
  }
})
