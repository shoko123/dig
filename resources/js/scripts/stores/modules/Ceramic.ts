import { computed } from 'vue'
import { defineStore } from 'pinia'
import { TFields, TObjCategorizerByFieldName } from '@/types/moduleTypes'

export const useCeramicStore = defineStore('ceramic', () => {
  const categorizer: TObjCategorizerByFieldName<'Ceramic'> = {}

  function beforeStore(formFields: Partial<TFields>, isCreate: boolean): Partial<TFields> {
    //console.log(`ceramic.beforStore() isCreate: ${isCreate}  fields: ${JSON.stringify(fields, null, 2)}`)
    if (isCreate) {
      //
    }
    return formFields
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
    beforeStore,
    categorizer,
  }
})
