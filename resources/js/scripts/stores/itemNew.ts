// stores/media.js
import { ref, computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import type { TApiFieldsUnion, TFieldsUnion, TModule } from '@/js/types/moduleTypes'
import type { TApiItemShow } from '@/js/types/itemTypes'
import type { IStringObject } from '@/js/types/generalTypes'
import { useCollectionMainStore } from './collections/collectionMain'
import { useRoutesMainStore } from './routes/routesMain'
import { useXhrStore } from './xhr'
import { useModuleStore } from './module'

export const useItemNewStore = defineStore('itemNew', () => {
  const { current } = storeToRefs(useRoutesMainStore())
  const { getStore } = useModuleStore()
  const { send } = useXhrStore()

  const slug = ref<string | undefined>(undefined)
  const tag = ref<string | undefined>(undefined)
  const selectedItemParams = ref<string[]>([])
  const discreteColumns = ref<IStringObject>({})
  const dateColumns = ref<string[]>([])
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
      'model/store',
      isCreate ? 'post' : 'put',
      {
        model: current.value.module,
        item: newFields,
        id: newFields.id,
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
    discreteColumns.value = {}
    slug.value = undefined

    tag.value = undefined
    selectedItemParams.value = []
  }

  return {
    slug,
    tag,
    ready,
    newFields,
    dateColumns,
    id,
    isCreate,
    isUpdate,
    discreteColumns,
    selectedItemParams,
    openIdSelectorModal,
    itemClear,
    prepareForNew,
    upload,
  }
})
