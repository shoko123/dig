import { ref, computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { required, between, maxLength } from '@vuelidate/validators'
import { TFields, TObjCategorizerByFieldName, TFieldsDefaultsAndRules } from '@/types/moduleTypes'
import { useItemStore } from '../../../scripts/stores/item'

export const useStoneStore = defineStore('stone', () => {
  const defaultsAndRules: TFieldsDefaultsAndRules<'Stone'> = {
    id: { val: '', rules: { required } },
    id_year: { val: 1, rules: { required, between: between(1, 999) } },
    id_access_no: { val: 1, rules: { required, between: between(1, 999) } },
    id_object_no: { val: 1, rules: { between: between(1, 999) } },
    square: { val: '', rules: { maxLength: maxLength(20) } },
    context: { val: '', rules: { maxLength: maxLength(20) } },
    excavation_date: { val: null, rules: {} },
    occupation_level: { val: '', rules: {} },
    cataloger_material: { val: '', rules: {} },
    whole: { val: false, rules: {} },
    cataloger_typology: { val: '', rules: { maxLength: maxLength(20) } },
    cataloger_description: { val: '', rules: { maxLength: maxLength(20) } },
    conservation_notes: { val: '', rules: { maxLength: maxLength(20) } },
    weight: { val: '', rules: { maxLength: maxLength(20) } },
    length: { val: '', rules: { maxLength: maxLength(20) } },
    width: { val: '', rules: { maxLength: maxLength(20) } },
    height: { val: '', rules: { maxLength: maxLength(20) } },
    diameter: { val: '', rules: { maxLength: maxLength(20) } },
    dimension_notes: { val: '', rules: { maxLength: maxLength(20) } },
    cultural_period: { val: '', rules: { maxLength: maxLength(20) } },
    excavation_object_id: { val: '', rules: { maxLength: maxLength(20) } },
    old_museum_id: { val: '', rules: { maxLength: maxLength(20) } },
    cataloger_id: { val: 1, rules: { maxLength: maxLength(20) } },
    catalog_date: { val: null, rules: {} },
    specialist_description: { val: '', rules: { maxLength: maxLength(20) } },
    specialist_date: { val: null, rules: { maxLength: maxLength(20) } },
    thumbnail: { val: '', rules: { maxLength: maxLength(20) } },
    uri: { val: '', rules: { maxLength: maxLength(20) } },
    base_type_id: { val: 1, rules: { between: between(1, 255) } },
    material_id: { val: 1, rules: { between: between(1, 255) } },
  }
  const { fields } = storeToRefs(useItemStore())

  const categorizer = computed<TObjCategorizerByFieldName<'Stone'>>(() => {
    return {
      old_museum_id: (val) => {
        // console.log(`old_museum_idCategorizer(${val})`)
        return val === null || (typeof val === 'string' && val.length === 0) ? 1 : 0
      },
    }
  })

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
    newItemIsInOC.value = typeof newStone.uri === 'string' && newStone.uri.length > 0
    newFields.value = { ...newStone }
  }
  const newItemIsInOC = ref<boolean>(false)

  const defaultsObj = computed(() => {
    return Object.fromEntries(Object.entries(defaultsAndRules).map(([k, v]) => [k, v.val]))
  })

  const rulesObj = computed(() => {
    return Object.fromEntries(Object.entries(defaultsAndRules).map(([k, v]) => [k, v.rules]))
  })

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
    const stone = formFields as TFields<'Stone'>
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
      const fieldsToSend: Partial<TFields<'Stone'>> = {}
      Object.assign(fieldsToSend, stone)
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
    defaultsAndRules,
    newItemIsInOC,
    availableItemNumbers,
    categorizer,
    prepareForNew,
    beforeStore,
    // rules,
    // defaultsObj,
    rulesObj,
  }
})
