import { computed } from 'vue'
import { defineStore } from 'pinia'
import { TObjCategorizerByFieldName } from '@/types/moduleTypes'

export const useCeramicStore = defineStore('ceramic', () => {
  const slugRegExp = computed(() => {
    return new RegExp(/^\d{2}.\d{1}$/)
  })

  function idToTagAndSlug(id: string) {
    return { slug: id, tag: id }
  }

  const categorizer: TObjCategorizerByFieldName<'Ceramic'> = {}

  const mainTableHeaders = computed(() => {
    return [
      { title: 'Name', align: 'start', key: 'tag' },
      { title: 'Year', align: 'start', key: 'id_year' },
      { title: 'Field Description', align: 'start', key: 'field_description' },
      { title: 'Specialist Description', align: 'start', key: 'specialist_description' },
    ]
  })

  return {
    slugRegExp,
    categorizer,
    mainTableHeaders,
    idToTagAndSlug,
  }
})
