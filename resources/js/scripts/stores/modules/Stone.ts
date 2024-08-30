import { ref, computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { maxLength } from '@vuelidate/validators'
import {
  TFieldsByModule,
  TFieldsUnion,
  FuncSlugToId,
  TCategorizerByFieldName,
  TCategorizedFields,
} from '@/js/types/moduleTypes'
import { useItemStore } from '../../../scripts/stores/item'
import { useItemNewStore } from '../../../scripts/stores/itemNew'

export const useStoneStore = defineStore('stone', () => {
  const { fields } = storeToRefs(useItemStore())
  const { newFields, openIdSelectorModal, isCreate, isUpdate } = storeToRefs(useItemNewStore())

  const categorizer: TCategorizerByFieldName<'Stone'> = {
    old_museum_id: (val) => {
      // console.log(`old_museum_idCategorizer(${val})`)
      return val === null || (typeof val === 'string' && val.length === 0) ? 1 : 0
    },
  }

  function categorizerByFieldName<key extends keyof TCategorizedFields>(field: key) {
    return categorizer[field]
  }

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
    return { tag: id, slug: id }
  }

  const nf = computed(() => {
    return newFields.value as TFieldsByModule<'Stone'>
  })

  function prepareForNew(isCreate: boolean, ids?: string[]): void {
    console.log(
      `prepNew(Stone) create(${isCreate}) fields: ${JSON.stringify(fields.value, null, 2)}`,
    )

    if (isCreate) {
      currentIds.value = ids!
      openIdSelectorModal.value = true
      newFields.value = { ...defaultFields }
      newFields.value.id = 'B2024.1.' + availableItemNumbers.value[0]
      newFields.value.id_year = 24
      newFields.value.id_access_no = 1
      newFields.value.id_object_no = availableItemNumbers.value[0]
      console.log(`isCreate. current ids: ${currentIds.value}`)
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
        return parseInt(sections[2])
      })

    const all = [...Array(200).keys()].map((i) => i + 1)

    return all.filter((x) => {
      return !itemNos.includes(x)
    })
  })

  function beforeStore(isCreate: boolean): Partial<TFieldsUnion> | false {
    //console.log(`stone.beforStore() isCreate: ${isCreate}  fields: ${JSON.stringify(fields, null, 2)}`)
    if (inOC.value) {
      return {
        id: nf.value.id,
        id_year: nf.value.id_year,
        id_access_no: nf.value.id_access_no,
        id_object_no: nf.value.id_object_no,
        specialist_description: nf.value.specialist_description,
        specialist_date: new Date(),
      }
    } else {
      const fieldsToSend: Partial<TFieldsByModule<'Stone'>> = {}
      Object.assign(fieldsToSend, nf.value)
      fieldsToSend.specialist_date = new Date()
      fieldsToSend.catalog_date = new Date()
      if (isCreate) {
        // do something e.g. fieldsToSend.cataloger_id = 10
      }
      return fieldsToSend
    }
  }

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
    return typeof nf.value.uri === 'string'
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
    newFields,
    rules,
    inOC,
    availableItemNumbers,
    categorizerByFieldName,
    slugToId,
    tagAndSlugFromId,
    prepareForNew,
    beforeStore,
  }
})
