// stores/media.js
import { ref, computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import type { TApiFieldsUnion, TFieldsUnion, TBespokeFieldsUnion } from '@/js/types/moduleTypes'
import type { TApiItemShow, TApiTag } from '@/js/types/itemTypes'
import type { TApiArray } from '@/js/types/collectionTypes'
import { useCollectionsStore } from './collections/collections'
import { useCollectionMainStore } from './collections/collectionMain'
import { useMediaStore } from './media'
import { useCollectionRelatedStore } from './collections/collectionRelated'
import { useRoutesMainStore } from './routes/routesMain'
import { useXhrStore } from './xhr'
import { useModuleStore } from './module'

export const useItemStore = defineStore('item', () => {
  const { current } = storeToRefs(useRoutesMainStore())
  const { collection, itemByIndex } = useCollectionsStore()
  const { tagAndSlugFromId } = useModuleStore()
  const { module } = storeToRefs(useModuleStore())
  const { send } = useXhrStore()

  const fields = ref<TFieldsUnion | undefined>(undefined)
  const slug = ref<string | undefined>(undefined)
  const tag = ref<string | undefined>(undefined)
  const short = ref<string | undefined>(undefined)

  const ready = ref<boolean>(false)
  const itemViews = ref<string[]>([])
  const itemViewIndex = ref<number>(0)
  const itemIndex = ref<number>(-1)

  const itemFieldsToOptionsObj = ref<Partial<TBespokeFieldsUnion>>({})

  const id = computed(() => {
    return typeof fields.value === 'undefined' ? -1 : (<TFieldsUnion>fields.value).id
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
      moduleAndTag: `${current.value === undefined ? '' : current.value.module} ${tag.value === undefined ? '' : tag.value}`,
    }
  })

  async function saveitemFieldsPlus<F extends TApiFieldsUnion>(apiItem: TApiItemShow<F>) {
    const { useTrioStore } = await import('./trio/trio')
    const { getFieldsOptions, setItemAllOptions } = useTrioStore()
    const { setItemMedia } = useMediaStore()
    const { array } = storeToRefs(useCollectionRelatedStore())
    setItemMedia(apiItem.media)
    array.value = apiItem.related
    console.log(`saveitemFieldsPlus`)
    saveItemFields(apiItem.fields)

    const res = tagAndSlugFromId(apiItem.fields.id)
    tag.value = res.tag
    slug.value = res.slug

    //get fields related options
    const fd = getFieldsOptions(apiItem.fields)

    //build itemFieldsToOptionsObj [field_name] : tag.text
    const tmp = ref<Record<string, string>>({})
    fd.forEach((x) => (tmp.value[x.fieldName] = x.optionLabel))
    itemFieldsToOptionsObj.value = tmp.value

    //set item's fields and tags options keys
    const fieldsOptions = fd.map((x) => x.optionKey)
    const tagOptions = await getSelectedTagOptions(apiItem.model_tags.concat(apiItem.global_tags))
    setItemAllOptions([...fieldsOptions, ...tagOptions])
  }

  function saveItemFields<F extends TApiFieldsUnion>(apiFields: F) {
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

  async function getSelectedTagOptions(apiTags: TApiTag[]) {
    const { useTrioStore } = await import('./trio/trio')
    const { trio, groupLabelToGroupKeyObj } = storeToRefs(useTrioStore())
    // console.log(`SaveItem - Add extrnal (module and global) tags`)
    const tagOptions: string[] = []
    for (const x of apiTags) {
      const group = trio.value.groupsObj[groupLabelToGroupKeyObj.value[x.group_label]]
      // console.log(`Add Tag:  ${x.group_label} => "${x.tag_text}"`)
      const optionKey = group.optionKeys.find((y) => trio.value.optionsObj[y].text === x.tag_text)
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
    fields.value = undefined
    slug.value = undefined
    short.value = undefined
    tag.value = undefined
    itemFieldsToOptionsObj.value = {}
  }

  function nextSlug(isRight: boolean) {
    let newIndex
    const length = collection('main').value.info.length
    if (isRight) {
      newIndex = itemIndex.value === length - 1 ? 0 : itemIndex.value + 1
    } else {
      newIndex = itemIndex.value === 0 ? length - 1 : itemIndex.value - 1
    }

    const tagAndSlug = tagAndSlugFromId(<TApiArray>itemByIndex('main', newIndex))
    return tagAndSlug.slug
  }

  async function itemRemove(): Promise<
    { success: true; slug: string | null } | { success: false; message: string }
  > {
    const { removeItemIdFromMainArray } = useCollectionMainStore()

    const res = await send<TApiItemShow<TApiFieldsUnion>>('module/destroy', 'post', {
      module: module.value,
      id: fields.value?.id,
    })

    if (!res.success) {
      return res
    }

    const prevSlug = nextSlug(false)
    const newLength = removeItemIdFromMainArray((<TFieldsUnion>fields.value).id)

    //return of slug === null means that is was the last element in the current array.
    if (newLength === 0) {
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
    nextSlug,
    itemClear,
    itemViews,
    itemViewIndex,
    itemView,
    setItemViewIndex,
    saveItemFields,
    saveitemFieldsPlus,
    itemRemove,
    itemFieldsToOptionsObj,
  }
})
