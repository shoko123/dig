import { computed } from 'vue'
import { defineStore } from 'pinia'
import { TFields, TObjCategorizerByFieldName } from '@/types/moduleTypes'

export const useStoneStore = defineStore('stone', () => {
  const categorizer = computed<TObjCategorizerByFieldName<'Stone'>>(() => {
    return {
      old_museum_id: (val) => {
        // console.log(`old_museum_idCategorizer(${val})`)
        return val === null || (typeof val === 'string' && val.length === 0) ? 1 : 0
      },
    }
  })

  function beforeStore(formFields: Partial<TFields>, isCreate: boolean): Partial<TFields> {
    //console.log(`stone.beforStore() isCreate: ${isCreate}  fields: ${JSON.stringify(fields, null, 2)}`)
    // const { useItemNewStore } = await import('../../../scripts/stores/itemNew')
    // const { newFields } = storeToRefs(useItemNewStore())

    const newStone = formFields as TFields<'Stone'>
    if (typeof newStone.uri === 'string' && newStone.uri.length > 0) {
      return {
        id: newStone.id,
        id_year: newStone.id_year,
        id_access_no: newStone.id_access_no,
        id_object_no: newStone.id_object_no,
        specialist_description: newStone.specialist_description,
        specialist_date: new Date(),
      }
    } else {
      const fieldsToSend: Partial<TFields<'Stone'>> = {}
      Object.assign(fieldsToSend, newStone)
      fieldsToSend.specialist_date = new Date()
      fieldsToSend.catalog_date = new Date()
      if (isCreate) {
        // do something e.g. fieldsToSend.cataloger_id = 10
      }
      return fieldsToSend
    }
  }

  const mainTableHeaders = computed(() => {
    return [
      { title: 'Label', align: 'start', key: 'tag' },
      { title: 'Context', align: 'start', key: 'context' },
      { title: 'Excavation Date', align: 'start', key: 'excavation_date' },
      { title: 'Cataloger Description', align: 'start', key: 'cataloger_description' },
      { title: 'Conservation Notes', align: 'start', key: 'conservation_notes' },
    ]
  })

  return {
    mainTableHeaders,
    categorizer,
    beforeStore,
  }
})
