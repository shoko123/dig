import { ref, computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { required } from '@vuelidate/validators'
import { TFieldsByModule, TFieldsUnion, TObjCategorizerByFieldName } from '@/types/moduleTypes'
import { useItemStore } from '../item'

export const useCeramicStore = defineStore('ceramic', () => {
  const { fields } = storeToRefs(useItemStore())
  const categorizer: TObjCategorizerByFieldName<'Ceramic'> = {}
  const currentIds = ref<string[]>([])

  async function prepareForNew(isCreate: boolean, ids?: string[]) {
    const { useItemNewStore } = await import('../../../scripts/stores/itemNew')
    const { newFields, openIdSelectorModal } = storeToRefs(useItemNewStore())
    //console.log(`stone.beforStore() isCreate: ${isCreate}  fields: ${JSON.stringify(fields, null, 2)}`)
    Object.assign(newFields.value, fields.value as TFieldsByModule<'Stone'>)

    if (isCreate) {
      currentIds.value = ids!
      openIdSelectorModal.value = true
    }
  }

  function beforeStore(
    formFields: Partial<TFieldsUnion>,
    isCreate: boolean,
  ): Partial<TFieldsUnion> {
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

  const rules = computed(() => {
    return {
      id: {},
      id_year: { required },
      id_object_no: { required }, //from select list
    }
  })

  return {
    mainTableHeaders,
    prepareForNew,
    beforeStore,
    categorizer,
    rules,
  }
})
