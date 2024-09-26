import { ref, computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { required, between, maxLength } from '@vuelidate/validators'
import { TFields, TFieldsDefaultsAndRules, TObjCategorizerByFieldName } from '@/types/moduleTypes'
import { useItemStore } from '../item'

export const useCeramicStore = defineStore('ceramic', () => {
  const { fields } = storeToRefs(useItemStore())
  const categorizer: TObjCategorizerByFieldName<'Ceramic'> = {}
  const currentIds = ref<string[]>([])

  const defaultsAndRules: TFieldsDefaultsAndRules<'Ceramic'> = {
    id: { d: '', r: { required } },
    id_year: { d: 1, r: { required, between: between(20, 24) } },
    id_object_no: { d: 1, r: { required, between: between(1, 9) } },
    field_description: { d: '', r: { maxLength: maxLength(50) } },
    specialist_description: { d: '4', r: { maxLength: maxLength(50) } },
    notes: { d: '', r: { maxLength: maxLength(50) } },

    base_type_id: { d: 1, r: { required, between: between(1, 9) } },
  }

  const defaultsObj = computed(() => {
    return Object.fromEntries(Object.entries(defaultsAndRules).map(([k, v]) => [k, v.d]))
  })

  const rulesObj = computed(() => {
    return Object.fromEntries(Object.entries(defaultsAndRules).map(([k, v]) => [k, v.r]))
  })

  async function prepareForNew(isCreate: boolean, ids?: string[]) {
    const { useItemNewStore } = await import('../../../scripts/stores/itemNew')
    const { newFields, openIdSelectorModal } = storeToRefs(useItemNewStore())
    // console.log(
    //   `prepNew(Ceramic) create(${isCreate}) fields: ${JSON.stringify(fields.value, null, 2)}`,
    // )
    let newCeramic: Partial<TFields<'Ceramic'>> = {}
    if (isCreate) {
      currentIds.value = ids!
      newCeramic = { ...defaultsObj.value }
      newCeramic.id_object_no = 6 //availableObjectNos.value[0]!
      console.log(`isCreate. current ids: ${currentIds.value}`)
      openIdSelectorModal.value = true
    } else {
      newCeramic = { ...fields.value }
    }
    newFields.value = { ...newCeramic }
  }

  const availableObjectNos = computed(() => {
    //  const itemNos = currentIds.value
    //    .filter((x) => {
    //      const sections = x.split('.')
    //      return sections[0] === 'B2024'
    //    })
    //    .map((x) => {
    //      const sections = x.split('.')
    //      return parseInt(sections[2]!)
    //    })

    //  const all = [...Array(200).keys()].map((i) => i + 1)

    //  return all.filter((x) => {
    //    return !itemNos.includes(x)
    //  })
    return [1, 2, 3, 4]
  })

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
    prepareForNew,
    beforeStore,
    categorizer,
    rulesObj,
    availableObjectNos,
  }
})
