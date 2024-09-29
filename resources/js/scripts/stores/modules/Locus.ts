import { computed } from 'vue'
import { defineStore } from 'pinia'
import { TObjCategorizerByFieldName, TFieldsDefaultsAndRules } from '@/types/moduleTypes'

export const useLocusStore = defineStore('locus', () => {
  const slugRegExp = computed(() => {
    return new RegExp(/^[a-zA-Z -]{2,10}.\d{1,3}.\d{1,3}$/)
  })

  function idToTagAndSlug(id: string) {
    return { slug: id, tag: id }
  }

  const categorizer: TObjCategorizerByFieldName<'Locus'> = {}

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

  const mainTableHeaders = computed(() => {
    return [
      { title: 'Label', align: 'start', key: 'tag' },
      { title: 'OC Label', align: 'start', key: 'oc_label' },
      { title: 'Square', align: 'start', key: 'square' },
      { title: 'Published Date', align: 'start', key: 'published_date' },
    ]
  })

  return {
    slugRegExp,
    categorizer,
    mainTableHeaders,
    idToTagAndSlug,
    defaultsAndRules,
  }
})
