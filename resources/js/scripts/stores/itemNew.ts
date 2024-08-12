import { ref, computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import type { TApiFieldsUnion, TFieldsUnion, TModule } from '@/js/types/moduleTypes'
import type { TApiItemShow } from '@/js/types/itemTypes'
import { useCollectionMainStore } from './collections/collectionMain'
import { useRoutesMainStore } from './routes/routesMain'
import { useXhrStore } from './xhr'
import { useModuleStore } from './module'
import { useTrioStore } from './trio/trio'

export const useItemNewStore = defineStore('itemNew', () => {
  const { current } = storeToRefs(useRoutesMainStore())
  const { getStore } = useModuleStore()
  const { send } = useXhrStore()
  const { trio, cvColumnNameToGroupKey } = storeToRefs(useTrioStore())

  const slug = ref<string | undefined>(undefined)
  const tag = ref<string | undefined>(undefined)
  const selectedItemParams = ref<string[]>([])
  const ready = ref<boolean>(false)

  const openIdSelectorModal = ref<boolean>(false)

  const newFields = computed(() => {
    const store = getStore(<TModule>current.value.module)
    return store.newFields
  })

  const isCreate = computed(() => {
    return current.value.name === 'create'
  })

  const isUpdate = computed(() => {
    return current.value.name === 'update'
  })

  const id = computed(() => {
    return newFields.value.id
  })

  const cvColumns = computed(() => {
    const tmpMap = new Map()
    Object.entries(cvColumnNameToGroupKey.value).forEach(([key, value]) => {
      console.log(`cvColumns() Item[key: ${key}] => ${value}`)
      const group = trio.value.groupsObj[value]
      const val = newFields.value![key as keyof TFieldsUnion]
      const paramKey = group.paramKeys.find(
        // ** weak comparison because param.extra is either string, number or boolean
        (y) => trio.value.paramsObj[y].extra == val,
      )
      if (paramKey === undefined) {
        throw new Error(
          `cvColumns() - Can't find value ${val} in group ${group.label} column ${key}`,
        )
      }
      tmpMap.set(key, trio.value.paramsObj[paramKey].text)
    })
    const res = Object.fromEntries(tmpMap.entries())
    return res
  })

  function prepareForNew(isCreate: boolean, ids?: string[]): void {
    const store = getStore(<TModule>current.value.module)
    return store.prepareForNew(isCreate, ids)
  }

  //return the newly created/update item's slug (need it only for create())
  async function upload(
    isCreate: boolean,
    newFields: Partial<TFieldsUnion>,
  ): Promise<{ success: true; slug: string } | { success: false; message: string }> {
    console.log(
      `item.upload isCreate: ${isCreate}, module: ${current.value.module}, fields: ${JSON.stringify(newFields, null, 2)}`,
    )

    const res = await send<TApiItemShow<TApiFieldsUnion>>(
      'module/store',
      isCreate ? 'post' : 'put',
      {
        module: current.value.module,
        fields: newFields,
      },
    )
    if (!res.success) {
      return res
    }
    const store = getStore(<TModule>current.value.module)

    const tagAndSlug = store.tagAndSlugFromId(res.data.fields.id)

    if (isCreate) {
      //push newly created id into the 'main' collection
      const { array } = useCollectionMainStore()
      array.push(res.data.fields.id)
    }

    return { success: true, slug: tagAndSlug.slug }
  }

  function itemClear() {
    slug.value = undefined

    tag.value = undefined
    selectedItemParams.value = []
  }

  return {
    slug,
    tag,
    ready,
    newFields,
    id,
    isCreate,
    isUpdate,
    cvColumns,
    selectedItemParams,
    openIdSelectorModal,
    itemClear,
    prepareForNew,
    upload,
  }
})
