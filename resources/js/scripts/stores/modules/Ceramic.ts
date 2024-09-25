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
    id: { val: '', rules: { required } },
    id_year: { val: 1, rules: { required, between: between(1, 9) } },
    id_object_no: { val: 1, rules: { required, between: between(1, 9) } },
    field_description: { val: '', rules: { maxLength: maxLength(50) } },
    specialist_description: { val: '4', rules: { maxLength: maxLength(50) } },
    base_type_id: { val: 1, rules: { required, between: between(1, 9) } },
  }

  async function prepareForNew(isCreate: boolean, ids?: string[]) {
    const { useItemNewStore } = await import('../../../scripts/stores/itemNew')
    const { newFields, openIdSelectorModal } = storeToRefs(useItemNewStore())
    //console.log(`stone.beforStore() isCreate: ${isCreate}  fields: ${JSON.stringify(fields, null, 2)}`)
    Object.assign(newFields.value, fields.value as TFields<'Stone'>)

    if (isCreate) {
      currentIds.value = ids!
      openIdSelectorModal.value = true
    }
  }

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
    defaultsAndRules,
  }
})
