import { ref, computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import type { TApiFields, TFields, TFieldInfo } from '@/types/moduleTypes'
import type { TApiItemShow } from '@/types/itemTypes'
import { useCollectionsStore } from './collections/collections'
import { useRoutesMainStore } from './routes/routesMain'
import { useXhrStore } from './xhr'
import { useModuleStore } from './module'

export const useItemNewStore = defineStore('itemNew', () => {
  const { current } = storeToRefs(useRoutesMainStore())
  const { module } = storeToRefs(useModuleStore())
  const { tagAndSlugFromId, getStore } = useModuleStore()
  const { send } = useXhrStore()
  const { getCollectionStore } = useCollectionsStore()

  const newFields = ref<Partial<TFields>>({})
  const slug = ref<string | undefined>(undefined)
  const tag = ref<string | undefined>(undefined)
  const itemNewAllOptions = ref<string[]>([])
  const ready = ref<boolean>(false)
  const openIdSelectorModal = ref<boolean>(false)

  const store = getCollectionStore('main')

  const mainArray = computed(() => {
    return store.array as string[]
  })
  const isCreate = computed(() => {
    return current.value.name === 'create'
  })

  const isUpdate = computed(() => {
    return current.value.name === 'update'
  })

  const id = computed(() => {
    return newFields.value!.id
  })

  async function getFuncFieldsOptions() {
    const { useTrioStore } = await import('./trio/trio')
    const trio = useTrioStore()
    return trio.getFieldsOptions
  }

  const itemNewFieldsToOptionsObj = ref<Record<string, TFieldInfo>>({})

  async function prepareForNew(isCreate: boolean, ids?: string[]) {
    const store = await getStore(module.value)
    await store.prepareForNew(isCreate, ids)
    const func = await getFuncFieldsOptions()
    const fd = func(newFields.value! as TFields)
    itemNewAllOptions.value = fd.map((x) => x.optionKey)

    //build object [field_name] : fieldInfo
    const tmp = ref<Record<string, TFieldInfo>>({})
    fd.forEach((x) => (tmp.value[x.fieldName] = x))
    itemNewFieldsToOptionsObj.value = tmp.value
  }

  async function beforeStore(newFields: Partial<TFields>) {
    const store = await getStore(module.value)
    return store.beforeStore(newFields, isCreate.value)
  }

  async function upload(
    isCreate: boolean,
    newFields: Partial<TFields>,
  ): Promise<{ success: true; slug: string } | { success: false; message: string }> {
    console.log(
      `item.upload isCreate: ${isCreate}, module: ${module.value}, fields: ${JSON.stringify(newFields, null, 2)}`,
    )

    const res = await send<TApiItemShow<TApiFields>>('module/store', isCreate ? 'post' : 'put', {
      module: module.value,
      fields: newFields,
    })
    if (!res.success) {
      return res
    }

    const tagAndSlug = tagAndSlugFromId(res.data.fields.id)

    if (isCreate) {
      //push newly created id into the 'main' collection
      mainArray.value.push(res.data.fields.id)
    }

    return { success: true, slug: tagAndSlug.slug }
  }

  function itemClear() {
    slug.value = undefined

    tag.value = undefined
    itemNewAllOptions.value = []
  }

  return {
    slug,
    tag,
    ready,
    newFields,
    id,
    isCreate,
    isUpdate,
    itemNewAllOptions,
    openIdSelectorModal,
    itemNewFieldsToOptionsObj,
    itemClear,
    prepareForNew,
    beforeStore,
    upload,
  }
})
