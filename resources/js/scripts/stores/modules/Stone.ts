import { ref, computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { required, between, maxLength } from '@vuelidate/validators'
import { TFields, TObjCategorizerByFieldName, TFieldsDefaultsAndRules } from '@/types/moduleTypes'
import { useItemStore } from '../../../scripts/stores/item'

export const useStoneStore = defineStore('stone', () => {
  const defaultsAndRules: TFieldsDefaultsAndRules<'Stone'> = {
    id: { d: '', r: { required } },
    id_year: { d: 1, r: { required, between: between(1, 999) } },
    id_access_no: { d: 1, r: { required, between: between(1, 999) } },
    id_object_no: { d: 1, r: { between: between(1, 999) } },
    square: { d: '', r: { maxLength: maxLength(20) } },
    context: { d: '', r: { maxLength: maxLength(20) } },
    excavation_date: { d: null, r: {} },
    occupation_level: { d: '', r: {} },
    cataloger_material: { d: '', r: {} },
    whole: { d: false, r: {} },
    cataloger_typology: { d: '', r: { maxLength: maxLength(20) } },
    cataloger_description: { d: '', r: { maxLength: maxLength(20) } },
    conservation_notes: { d: '', r: { maxLength: maxLength(20) } },
    weight: { d: '', r: { maxLength: maxLength(20) } },
    length: { d: '', r: { maxLength: maxLength(20) } },
    width: { d: '', r: { maxLength: maxLength(20) } },
    height: { d: '', r: { maxLength: maxLength(20) } },
    diameter: { d: '', r: { maxLength: maxLength(20) } },
    dimension_notes: { d: '', r: { maxLength: maxLength(20) } },
    cultural_period: { d: '', r: { maxLength: maxLength(20) } },
    excavation_object_id: { d: '', r: { maxLength: maxLength(20) } },
    old_museum_id: { d: '', r: { maxLength: maxLength(20) } },
    cataloger_id: { d: 1, r: { maxLength: maxLength(20) } },
    catalog_date: { d: null, r: {} },
    specialist_description: { d: '', r: { maxLength: maxLength(20) } },
    specialist_date: { d: null, r: { maxLength: maxLength(20) } },
    thumbnail: { d: '', r: { maxLength: maxLength(20) } },
    uri: { d: '', r: { maxLength: maxLength(20) } },
    base_type_id: { d: 1, r: { between: between(1, 255) } },
    material_id: { d: 1, r: { between: between(1, 255) } },
  }

  const defaultsObj = computed(() => {
    return Object.fromEntries(Object.entries(defaultsAndRules).map(([k, v]) => [k, v.d]))
  })

  const rulesObj = computed(() => {
    return Object.fromEntries(Object.entries(defaultsAndRules).map(([k, v]) => [k, v.r]))
  })

  const categorizer = computed<TObjCategorizerByFieldName<'Stone'>>(() => {
    return {
      old_museum_id: (val) => {
        // console.log(`old_museum_idCategorizer(${val})`)
        return val === null || (typeof val === 'string' && val.length === 0) ? 1 : 0
      },
    }
  })

  const { fields } = storeToRefs(useItemStore())

  async function prepareForNew(isCreate: boolean, ids?: string[]) {
    const { useItemNewStore } = await import('../../../scripts/stores/itemNew')
    const { newFields, openIdSelectorModal } = storeToRefs(useItemNewStore())
    console.log(
      `prepNew(Stone) create(${isCreate}) fields: ${JSON.stringify(fields.value, null, 2)}`,
    )
    let newStone: Partial<TFields<'Stone'>> = {}
    if (isCreate) {
      currentIds.value = ids!
      newStone = { ...defaultsObj.value }
      newStone.id = 'B2024.1.' + availableItemNumbers.value[0]
      newStone.id_year = 24
      newStone.id_access_no = 1
      newStone.id_object_no = availableItemNumbers.value[0]!
      console.log(`isCreate. current ids: ${currentIds.value}`)
      openIdSelectorModal.value = true
    } else {
      newStone = { ...fields.value }
    }
    newFields.value = { ...newStone }
  }

  //new id selection
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
    currentIds,
    availableItemNumbers,
    categorizer,
    prepareForNew,
    beforeStore,
    rulesObj,
  }
})
