import type { TApiFields, TFields, TFieldsTexts } from '@/types/moduleTypes'
import type { TApiItemShow, TApiTag } from '@/types/itemTypes'

import { ref, computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import { useCollectionsStore } from './collections/collections'
import { useElementAndCollectionStore } from './collections/elementAndCollection'
import { useRoutesMainStore } from './routes/routesMain'
import { useXhrStore } from './xhr'
import { useModuleStore } from './module'
import { useTrioStore } from './trio/trio'
import { dateStringFromDate } from '../../scripts/utils/utils'
export const useItemStore = defineStore('item', () => {
  const { current } = storeToRefs(useRoutesMainStore())
  const { getCollectionStore, setCollectionArray } = useCollectionsStore()
  const { tagAndSlugFromId } = useModuleStore()
  const { module } = storeToRefs(useModuleStore())
  const { send } = useXhrStore()
  const { getFieldsOptions, setItemAllOptions } = useTrioStore()
  const { groupLabelToGroupKeyObj, trio } = storeToRefs(useTrioStore())
  const mcs = getCollectionStore('main')
  const fields = ref<Partial<TFields>>({})
  const slug = ref<string>('')
  const tag = ref<string>('')
  const short = ref<string>('')

  const ready = ref<boolean>(false)
  const itemViews = ref<string[]>([])
  const itemViewIndex = ref<number>(0)
  const itemIndex = ref<number>(-1)

  const id = computed(() => {
    return fields.value.id
  })

  const itemView = computed(() => {
    return itemViews.value[itemViewIndex.value]
  })

  function setItemViewIndex(index: number) {
    itemViewIndex.value = index
  }

  const derived = computed(() => {
    return {
      module: current.value.module,
      slug: current.value.slug,
      tag: tag.value,
      moduleAndTag: `${current.value === undefined ? '' : current.value.module} ${tag.value}`,
    }
  })

  const fieldsTexts = computed(() => {
    if (Object.keys(fields.value).length === 0) {
      return {}
    }

    const fo = getFieldsOptions(fields.value as TFields)
    const tmp: Partial<TFieldsTexts> = {}
    fo.forEach((x) => (tmp[x.fieldName as keyof TFields] = x.optionLabel))
    for (const key in fields.value!) {
      if (tmp[key as keyof TFields] === undefined) {
        const val = fields.value[key as keyof TFields]
        if (Object.prototype.toString.call(val) === '[object Date]') {
          console.log(`field: ${key} is of type Date`)
          tmp[key as keyof TFields] = dateStringFromDate(val as unknown as Date)
        } else {
          tmp[key as keyof TFields] = val
        }
      }
    }
    return tmp
  })

  async function saveitemFieldsPlus<F extends TApiFields>(apiItem: TApiItemShow<F>) {
    // save media & related collections
    setCollectionArray('media', apiItem.media)
    setCollectionArray('related', apiItem.related)
    console.log(`saveitemFieldsPlus`)
    saveItemFields(apiItem.fields)

    const res = tagAndSlugFromId(apiItem.fields.id)
    tag.value = res.tag
    slug.value = res.slug

    //get fields related options
    const fd = getFieldsOptions(apiItem.fields)

    //set item's fields and tags options keys
    const fieldsOptions = fd.map((x) => x.optionKey)
    const tagOptions = getSelectedTagOptions(apiItem.model_tags.concat(apiItem.global_tags))
    setItemAllOptions([...fieldsOptions, ...tagOptions])
  }

  function saveItemFields<F extends TApiFields>(apiFields: F) {
    // If field_name contains '_date' and value is a string in YYYY-MM-DD format, assume that we deal with a date field, and make a new Date
    // TODO implement above

    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/
    const tmpMap = new Map()

    Object.entries(apiFields).forEach(([key, value]) => {
      //console.log(`Item[${key}] => ${value}`)
      if (typeof value === 'string' && isoDateRegex.test(value)) {
        tmpMap.set(key, new Date(<string>value))
      } else {
        tmpMap.set(key, value)
      }
    })
    fields.value = Object.fromEntries(tmpMap.entries())
  }

  function getSelectedTagOptions(apiTags: TApiTag[]) {
    // console.log(`SaveItem - Add extrnal (module and global) tags`)
    const tagOptions: string[] = []
    for (const x of apiTags) {
      const group = trio.value.groupsObj[groupLabelToGroupKeyObj.value[x.group_label]!]!
      // console.log(`Add Tag:  ${x.group_label} => "${x.tag_text}"`)
      const optionKey = group.optionKeys.find((y) => trio.value.optionsObj[y]!.text === x.tag_text)
      if (optionKey === undefined) {
        throw new Error(
          `getSelectedTagOptions() - Can't find tag ${x.tag_text} in group ${group.label}`,
        )
      }
      tagOptions.push(optionKey)
    }
    return tagOptions
  }

  function itemClear() {
    itemIndex.value = -1
    fields.value = {}
    slug.value = ''
    short.value = ''
    tag.value = ''
    setCollectionArray('media', [])
    setCollectionArray('related', [])
  }

  const mainArray = computed(() => {
    return mcs.array as string[]
  })

  async function itemRemove(): Promise<
    { success: true; slug: string | null } | { success: false; message: string }
  > {
    const res = await send<{ deleted_id: string }>('module/destroy', 'post', {
      module: module.value,
      id: fields.value?.id,
    })

    if (!res.success) {
      return res
    }

    const { nextArrayElement } = useElementAndCollectionStore()
    const prevItem = nextArrayElement('main', itemIndex.value, false)
    const tagAndSlug = tagAndSlugFromId(<string>prevItem.item, current.value.module)
    const prevSlug = tagAndSlug.slug

    const index = mainArray.value.indexOf(res.data.deleted_id)
    if (index > -1) {
      mainArray.value.splice(index, 1)
    }

    //return of slug === null means that is was the last element in the current array.
    if (mainArray.value.length === 0) {
      return { success: true, slug: null }
    } else {
      return { success: true, slug: prevSlug }
    }
  }

  return {
    slug,
    tag,
    short,
    ready,
    fields,
    id,
    derived,
    itemIndex,
    itemClear,
    itemViews,
    itemViewIndex,
    itemView,
    setItemViewIndex,
    saveItemFields,
    saveitemFieldsPlus,
    itemRemove,
    fieldsTexts,
  }
})
