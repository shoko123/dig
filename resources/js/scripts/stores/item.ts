// stores/media.js
import { ref, computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import type { TApiFieldsUnion, TFieldsUnion, TKeyOfFields, TModule } from '@/js/types/moduleTypes'
import type { TApiItemShow, TApiTag } from '@/js/types/itemTypes'
import type { TApiArray } from '@/js/types/collectionTypes'
import { useCollectionsStore } from './collections/collections'
import { useCollectionMainStore } from './collections/collectionMain'
import { useRoutesMainStore } from './routes/routesMain'
import { useXhrStore } from './xhr'
import { useModuleStore } from './module'
import { useTrioStore } from './trio/trio'
import { TGroupColumn } from '@/js/types/trioTypes'

export const useItemStore = defineStore('item', () => {
  const { current } = storeToRefs(useRoutesMainStore())
  const { collection, itemByIndex } = useCollectionsStore()
  const { tagAndSlugFromId } = useModuleStore()
  const { send } = useXhrStore()
  const { trio, cvColumnNameToGroupKey, groupLabelToKey } = storeToRefs(useTrioStore())

  const fields = ref<TFieldsUnion | undefined>(undefined)
  const slug = ref<string | undefined>(undefined)
  const tag = ref<string | undefined>(undefined)
  const short = ref<string | undefined>(undefined)
  const selectedItemParams = ref<string[]>([])

  const ready = ref<boolean>(false)
  const itemViews = ref<string[]>([])
  const itemViewIndex = ref<number>(0)
  const itemIndex = ref<number>(-1)

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
      short: short.value,
    }
  })

  const cvColumns = computed(() => {
    // return Object.fromEntries(
    //   Object.keys(cvColumnNameToGroupKey.value).map((k) => {
    //     return [k, (<TFieldsUnion>fields.value)[<TKeyOfFields>k]]
    //   }),
    // )

    const cvs: Record<string, string | number | boolean> = {}
    for (const x in cvColumnNameToGroupKey.value) {
      const group = trio.value.groupsObj[cvColumnNameToGroupKey.value[x]]
      const paramKey = group.paramKeys.find(
        // ** weak comparison because param.extra is either string, number or boolean
        (y) => trio.value.paramsObj[y].extra == (<TFieldsUnion>fields.value)[<TKeyOfFields>x],
      )

      // if (paramKey === undefined) {
      //   console.log(`******serious error while calculating item CV columns****`)
      //   return
      // }

      cvs[<string>x] = trio.value.paramsObj[paramKey!].text
    }
    return cvs
  })

  function saveitemFieldsPlus<F extends TApiFieldsUnion>(apiItem: TApiItemShow<F>) {
    saveItemFields(apiItem.fields)

    const res = tagAndSlugFromId(<TModule>current.value.module, apiItem.fields.id)
    tag.value = res.tag
    slug.value = res.slug
    selectedItemParams.value = []

    addColumnTags()
    addExternalTags(apiItem.model_tags.concat(apiItem.global_tags))
  }

  function saveItemFields<F extends TApiFieldsUnion>(apiFields: F) {
    // If ket has '_date' and value is a string in YYYY-MM-DD format, assume that we deal with a date column, and make a new Date
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

  function addColumnTags() {
    for (const x in cvColumnNameToGroupKey.value) {
      const group = trio.value.groupsObj[cvColumnNameToGroupKey.value[x]]

      const paramKey = group.paramKeys.find(
        // ** weak comparison because param.extra is either string, number or boolean
        (y) => trio.value.paramsObj[y].extra == (<TFieldsUnion>fields.value)[<TKeyOfFields>x],
      )

      if (paramKey === undefined) {
        console.log(`******serious error while saving item columns****`)
        return
      }

      if ((<TGroupColumn>group).show_in_item_tags) {
        selectedItemParams.value.push(paramKey)
      }
    }
  }

  function addExternalTags(apiTags: TApiTag[]) {
    // console.log(`SaveItem - Add extrnal (module and global) tags`)
    for (const x of apiTags) {
      const group = trio.value.groupsObj[groupLabelToKey.value[x.group_label]]
      // console.log(`Add Tag:  ${x.group_label} => "${x.tag_text}"`)

      const paramKey = group.paramKeys.find((y) => trio.value.paramsObj[y].text === x.tag_text)
      if (paramKey === undefined) {
        console.log(`******serious error while saving item's tags****`)
        return
      }
      selectedItemParams.value.push(paramKey)
    }
  }

  function itemClear() {
    itemIndex.value = -1
    fields.value = undefined
    slug.value = undefined
    short.value = undefined
    tag.value = undefined
    selectedItemParams.value = []
  }

  function nextSlug(isRight: boolean) {
    let newIndex
    const length = collection('main').value.meta.length
    if (isRight) {
      newIndex = itemIndex.value === length - 1 ? 0 : itemIndex.value + 1
    } else {
      newIndex = itemIndex.value === 0 ? length - 1 : itemIndex.value - 1
    }

    const tagAndSlug = tagAndSlugFromId(
      <TModule>current.value.module,
      <TApiArray>itemByIndex('main', newIndex),
    )
    return tagAndSlug.slug
  }

  async function itemRemove(): Promise<
    { success: true; slug: string | null } | { success: false; message: string }
  > {
    const { removeItemIdFromMainArray } = useCollectionMainStore()
    //const prev = next('main', itemIndexById((<TFieldsUnion>fields.value).id), false)

    const res = await send<TApiItemShow<TApiFieldsUnion>>('module/destroy', 'post', {
      module: current.value.module,
      id: fields.value?.id,
    })

    if (!res.success) {
      return res
    }

    console.log(`${current.value.module}item.itemRemove() success!`)
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
    selectedItemParams,
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
    cvColumns,
  }
})
