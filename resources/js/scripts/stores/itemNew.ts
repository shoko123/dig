import { ref, computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import type { TModule, TApiFields, TFields, TFieldInfo } from '@/types/moduleTypes'
import type { TApiItemShow } from '@/types/itemTypes'
import type { TArray } from '@/types/collectionTypes'
// import { type Validation } from '@vuelidate/core'
import { useCollectionsStore } from './collections/collections'
import { useRoutesMainStore } from './routes/routesMain'
import { useXhrStore } from './xhr'
import { useModuleStore } from './module'
import { useTrioStore } from './trio/trio'

export const useItemNewStore = defineStore('itemNew', () => {
  const { current } = storeToRefs(useRoutesMainStore())
  const { module } = storeToRefs(useModuleStore())
  const { tagAndSlugFromId, getStore } = useModuleStore()
  const { send } = useXhrStore()
  const { getCollectionStore } = useCollectionsStore()
  const { getFieldsOptions } = useTrioStore()

  const currentIds = ref<string[]>([])
  const newFields = ref<Partial<TFields>>({})
  const slug = ref<string | undefined>(undefined)
  const tag = ref<string | undefined>(undefined)
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

  const fieldsWithOptions = computed(() => {
    if (Object.keys(newFields.value).length === 0) {
      return {}
    }

    const fo = getFieldsOptions(newFields.value as TFields)
    const tmp: Partial<Record<keyof TFields, TFieldInfo>> = {}
    fo.forEach((x) => (tmp[x.fieldName as keyof TFields] = x))
    return tmp as Partial<Record<keyof TFields, TFieldInfo>>
  })

  async function prepareForNewItem(
    module: TModule,
    isCreate: boolean,
  ): Promise<{ success: true } | { success: false; message: string }> {
    if (isCreate) {
      const res = await send<TArray<'main'>[]>('module/index', 'post', {
        module,
      })
      if (res.success) {
        currentIds.value = res.data
        console.log(`prepareForCreate. Current ids: ${currentIds.value}`)
      } else {
        return { success: false, message: `Error: failed to load current ids` }
      }
    }
    return { success: true }
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

  function itemNewClear() {
    slug.value = undefined

    tag.value = undefined
  }

  return {
    currentIds,
    newFields,
    slug,
    tag,
    ready,
    id,
    isCreate,
    isUpdate,
    openIdSelectorModal,
    prepareForNewItem,
    fieldsWithOptions,
    itemNewClear,
    beforeStore,
    upload,
  }
})
