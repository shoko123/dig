import { computed } from 'vue'
import { defineStore } from 'pinia'
import { TFields, TObjCategorizerByFieldName } from '@/types/moduleTypes'

export const useCeramicStore = defineStore('ceramic', () => {
  const categorizer: TObjCategorizerByFieldName<'Ceramic'> = {}

  // eslint-disable-next-line
  function beforeStoreSpecific(fieldsNew: Partial<TFields>, isCreate: boolean): Partial<TFields> {
    return fieldsNew
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
    mainTableHeaders,
    beforeStoreSpecific,
    categorizer,
  }
})
