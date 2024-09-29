import { computed } from 'vue'
import { defineStore } from 'pinia'
import { TObjCategorizerByFieldName } from '@/types/moduleTypes'

export const useStoneStore = defineStore('stone', () => {
  const slugRegExp = computed(() => {
    return new RegExp(/^B20\d{2}.\d{1}.\d{1,3}$/)
  })

  function idToTagAndSlug(id: string) {
    return { slug: id, tag: id }
  }

  const categorizer = computed<TObjCategorizerByFieldName<'Stone'>>(() => {
    return {
      old_museum_id: (val) => {
        // console.log(`old_museum_idCategorizer(${val})`)
        return val === null || (typeof val === 'string' && val.length === 0) ? 1 : 0
      },
    }
  })

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
    slugRegExp,
    categorizer,
    mainTableHeaders,
    idToTagAndSlug,
  }
})
