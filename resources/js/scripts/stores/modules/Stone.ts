import { ref, computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { maxLength } from '@vuelidate/validators'
import { TFieldsByModule, TFieldsUnion, FuncSlugToId } from '@/js/types/moduleTypes'
import { useItemStore } from '../../../scripts/stores/item'
import { useItemNewStore } from '../../../scripts/stores/itemNew'

export const useStoneStore = defineStore('stone', () => {
  const { fields } = storeToRefs(useItemStore())
  const { openIdSelectorModal, isCreate, isUpdate } = storeToRefs(useItemNewStore())
  const newFields = ref<Partial<TFieldsByModule<'Stone'>>>({})

  const rules = computed(() => {
    return inOC.value
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

  const inOC = computed(() => {
    if (!isCreate.value && !isUpdate.value) {
      return undefined
    }
    return typeof newFields.value.uri === 'string'
  })

  const slugToId: FuncSlugToId = function (slug: string) {
    const sections = slug.split('.')

    if (sections.length !== 3) {
      return {
        success: false,
        message: `Unsupported slug format detected: ${slug}`,
      }
    }

    return {
      success: true,
      id: slug,
    }
  }

  function tagAndSlugFromId(id: string) {
    //console.log(`Stone.tagAndSlugFromId()`)
    return { tag: id, slug: id }
  }

  const currentIds = ref<string[]>([])

  function prepareForNew(isCreate: boolean, ids?: string[]): void {
    console.log(
      `prepNew(Stone) create(${isCreate}) fields: ${JSON.stringify(fields.value, null, 2)}`,
    )
    if (isCreate) {
      currentIds.value = ids!
      openIdSelectorModal.value = true
      prepareDefaultNewFields()
      console.log(`isCreate. current ids: ${currentIds.value}`)
    } else {
      Object.assign(newFields.value, fields.value as TFieldsByModule<'Stone'>)
    }
  }

  const availableItemNumbers = computed(() => {
    const itemNos = currentIds.value
      .filter((x) => {
        const sections = x.split('.')
        return sections[0] === 'B2024'
      })
      .map((x) => {
        const sections = x.split('.')
        return parseInt(sections[2])
      })

    const all = [...Array(200).keys()].map((i) => i + 1)

    return all.filter((x) => {
      return !itemNos.includes(x)
    })

    // console.log(`current ids: ${itemNos}`)
    // console.log(`all ids: ${all}`)
    // console.log(`diff: ${diff}`)
  })

  function beforeStore(isCreate: boolean): Partial<TFieldsUnion> | false {
    //console.log(`stone.beforStore() isCreate: ${isCreate}  fields: ${JSON.stringify(fields, null, 2)}`)
    if (inOC.value) {
      return {
        id: newFields.value.id,
        id_year: newFields.value.id_year,
        id_access_no: newFields.value.id_access_no,
        id_object_no: newFields.value.id_object_no,
        specialist_description: newFields.value.specialist_description,
        specialist_date: new Date(),
      }
    } else {
      const fieldsToSend: Partial<TFieldsByModule<'Stone'>> = {}
      Object.assign(fieldsToSend, newFields.value)
      fieldsToSend.specialist_date = new Date()
      fieldsToSend.catalog_date = new Date()
      if (isCreate) {
        fieldsToSend.cataloger_id = 10
      }
      return fieldsToSend
    }
  }

  function prepareDefaultNewFields() {
    newFields.value.id = 'B2024.1.' + availableItemNumbers.value[0]
    newFields.value.id_year = 24
    newFields.value.id_access_no = 1
    newFields.value.id_object_no = availableItemNumbers.value[0]
    newFields.value.square = ''
    newFields.value.context = ''
    newFields.value.excavation_date = null
    newFields.value.occupation_level = ''
    newFields.value.excavation_object_id = ''
    newFields.value.whole = false
    newFields.value.cataloger_typology = ''
    newFields.value.cataloger_description = ''
    newFields.value.conservation_notes = ''
    newFields.value.weight = ''
    newFields.value.length = ''
    newFields.value.width = ''
    newFields.value.height = ''
    newFields.value.diameter = ''
    newFields.value.dimension_notes = ''
    newFields.value.cultural_period = ''
    newFields.value.old_museum_id = ''
    newFields.value.cataloger_id = 1
    newFields.value.catalog_date = null
    newFields.value.specialist_description = ''
    newFields.value.specialist_date = null
    newFields.value.thumbnail = ''
    newFields.value.uri = null
    newFields.value.base_type_id = 1
    newFields.value.base_type_id = 1
    newFields.value.material_id = 1
  }

  const headers = computed(() => {
    return [
      { title: 'Label', align: 'start', key: 'tag' },
      { title: 'Square', align: 'start', key: 'square' },
      { title: 'Context', align: 'start', key: 'context' },
      { title: 'Excavation Date', align: 'start', key: 'excavation_date' },
      { title: 'Cataloger Description', align: 'start', key: 'cataloger_description' },
      { title: 'Conservation Notes', align: 'start', key: 'conservation_notes' },
    ]
  })

  return {
    newFields,
    rules,
    inOC,
    prepareForNew,
    availableItemNumbers,
    beforeStore,
    slugToId,
    tagAndSlugFromId,
    headers,
    currentIds,
  }
})
