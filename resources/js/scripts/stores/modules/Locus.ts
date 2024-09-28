import { computed } from 'vue'
import { defineStore } from 'pinia'
import { TFields, TObjCategorizerByFieldName, TFieldsDefaultsAndRules } from '@/types/moduleTypes'

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

  const categorizer: TObjCategorizerByFieldName<'Locus'> = {}

  // eslint-disable-next-line
  function beforeStoreSpecific(fieldsNew: Partial<TFields>, isCreate: boolean): Partial<TFields> {
    return fieldsNew
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
    beforeStoreSpecific,
    categorizer,
    defaultsAndRules,
  }
})
