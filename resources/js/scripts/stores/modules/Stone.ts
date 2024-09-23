import { ref, computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { maxLength } from '@vuelidate/validators'
import { TFieldsByModule, TFieldsUnion, TObjCategorizerByFieldName } from '@/types/moduleTypes'
import { useItemStore } from '../../../scripts/stores/item'

export const useStoneStore = defineStore('stone', () => {
  const { fields } = storeToRefs(useItemStore())

  const categorizer = computed<TObjCategorizerByFieldName<'Stone'>>(() => {
    return {
      old_museum_id: (val) => {
        // console.log(`old_museum_idCategorizer(${val})`)
        return val === null || (typeof val === 'string' && val.length === 0) ? 1 : 0
      },
    }
  })

  const newItemIsInOC = ref<boolean>(false)

  async function prepareForNew(isCreate: boolean, ids?: string[]) {
    const { useItemNewStore } = await import('../../../scripts/stores/itemNew')
    const { newFields, openIdSelectorModal } = storeToRefs(useItemNewStore())
    console.log(
      `prepNew(Stone) create(${isCreate}) fields: ${JSON.stringify(fields.value, null, 2)}`,
    )
    const stone = newFields.value as TFieldsByModule<'Stone'>

    newItemIsInOC.value = typeof stone.uri === 'string'
    if (isCreate) {
      currentIds.value = ids!

      newFields.value = { ...defaultFields }
      newFields.value.id = 'B2024.1.' + availableItemNumbers.value[0]
      newFields.value.id_year = 24
      newFields.value.id_access_no = 1
      newFields.value.id_object_no = availableItemNumbers.value[0]
      console.log(`isCreate. current ids: ${currentIds.value}`)
      openIdSelectorModal.value = true
    } else {
      newFields.value = { ...fields.value }
    }
  }

  const defaultFields: TFieldsByModule<'Stone'> = {
    id: 'change me',
    id_year: 7,
    id_access_no: 1,
    id_object_no: 1,
    square: '',
    context: '',
    excavation_date: null,
    occupation_level: '',
    cataloger_material: '',
    whole: true,
    cataloger_typology: '',
    cataloger_description: '',
    conservation_notes: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    diameter: '',
    dimension_notes: '',
    cultural_period: '',
    excavation_object_id: '',
    old_museum_id: '',
    cataloger_id: 10,
    catalog_date: null,
    specialist_description: '',
    specialist_date: null,
    thumbnail: '',
    uri: null,
    base_type_id: 1,
    material_id: 1,
  }

  const currentIds = ref<string[]>([])

  const availableItemNumbers = computed(() => {
    const itemNos = currentIds.value
      .filter((x) => {
        const sections = x.split('.')
        return sections[0] === 'B2024'
      })
      .map((x) => {
        const sections = x.split('.')
        return parseInt(sections[2]!)
      })

    const all = [...Array(200).keys()].map((i) => i + 1)

    return all.filter((x) => {
      return !itemNos.includes(x)
    })
  })

  function beforeStore(
    formFields: Partial<TFieldsUnion>,
    isCreate: boolean,
  ): Partial<TFieldsUnion> {
    //console.log(`stone.beforStore() isCreate: ${isCreate}  fields: ${JSON.stringify(fields, null, 2)}`)
    // const { useItemNewStore } = await import('../../../scripts/stores/itemNew')
    // const { newFields } = storeToRefs(useItemNewStore())
    const stone = formFields as TFieldsByModule<'Stone'>
    const inOC = typeof stone.uri === 'string'
    if (inOC) {
      return {
        id: stone.id,
        id_year: stone.id_year,
        id_access_no: stone.id_access_no,
        id_object_no: stone.id_object_no,
        specialist_description: stone.specialist_description,
        specialist_date: new Date(),
      }
    } else {
      const fieldsToSend: Partial<TFieldsByModule<'Stone'>> = {}
      Object.assign(fieldsToSend, stone)
      fieldsToSend.specialist_date = new Date()
      fieldsToSend.catalog_date = new Date()
      if (isCreate) {
        // do something e.g. fieldsToSend.cataloger_id = 10
      }
      return fieldsToSend
    }
  }

  const rules = computed(() => {
    return newItemIsInOC.value
      ? {
          id: {},
          specialist_description: { maxLength: maxLength(25) },
        }
      : {
          id: {},
          square: { maxLength: maxLength(50) },
          context: { maxLength: maxLength(50) },
          excavation_date: {},
          occupation_level: { maxLength: maxLength(10) },
          cataloger_material: { maxLength: maxLength(50) },
          whole: false,
          cataloger_typology: { maxLength: maxLength(50) },
          cataloger_description: { maxLength: maxLength(350) },
          conservation_notes: { maxLength: maxLength(250) },
          weight: { maxLength: maxLength(50) },
          length: { maxLength: maxLength(50) },
          width: { maxLength: maxLength(50) },
          height: { maxLength: maxLength(50) },
          diameter: { maxLength: maxLength(50) },
          dimension_notes: { maxLength: maxLength(250) },
          cultural_period: { maxLength: maxLength(50) },
          excavation_object_id: { maxLength: maxLength(50) },
          old_museum_id: { maxLength: maxLength(50) },
          catalog_date: {},
          specialist_description: { maxLength: maxLength(250) },
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
    mainTableHeaders,
    currentIds,
    rules,
    newItemIsInOC,
    availableItemNumbers,
    categorizer,
    prepareForNew,
    beforeStore,
  }
})
