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

  // eslint-disable-next-line
  function beforeStoreSpecific(fieldsNew: Partial<TFields>, isCreate: boolean): Partial<TFields> {
    const newStone = fieldsNew as TFields<'Stone'>
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
    beforeStoreSpecific,
  }
})
