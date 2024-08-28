import { ref, computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import type { TApiFieldsUnion, TFieldsUnion, TFieldInfo } from '@/js/types/moduleTypes'
import type { TApiItemShow } from '@/js/types/itemTypes'
import { useCollectionMainStore } from './collections/collectionMain'
import { useRoutesMainStore } from './routes/routesMain'
import { useXhrStore } from './xhr'
import { useModuleStore } from './module'
import { useTrioStore } from './trio/trio'

export const useItemNewStore = defineStore('itemNew', () => {
  const { current } = storeToRefs(useRoutesMainStore())
  const { moduleNewFields, module } = storeToRefs(useModuleStore())
  const { modulePrepareForNew, tagAndSlugFromId } = useModuleStore()

  const { send } = useXhrStore()
  const { getFieldsOptions } = useTrioStore()

  const slug = ref<string | undefined>(undefined)
  const tag = ref<string | undefined>(undefined)
  const itemNewAllOptions = ref<string[]>([])
  const ready = ref<boolean>(false)

  const openIdSelectorModal = ref<boolean>(false)

  const newFields = computed(() => {
    return moduleNewFields.value
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

  const itemNewFieldsToOptionsObj = ref<Record<string, TFieldInfo>>({})

  function prepareForNew(isCreate: boolean, ids?: string[]): void {
    modulePrepareForNew(isCreate, ids)

    const fd = getFieldsOptions(newFields.value! as TFieldsUnion)
    itemNewAllOptions.value = fd.map((x) => x.optionKey)

    //build object [field_name] : fieldInfo
    const tmp = ref<Record<string, TFieldInfo>>({})
    fd.forEach((x) => (tmp.value[x.fieldName] = x))
    itemNewFieldsToOptionsObj.value = tmp.value
  }

  async function upload(
    isCreate: boolean,
    newFields: Partial<TFieldsUnion>,
  ): Promise<{ success: true; slug: string } | { success: false; message: string }> {
    console.log(
      `item.upload isCreate: ${isCreate}, module: ${module.value}, fields: ${JSON.stringify(newFields, null, 2)}`,
    )

    const res = await send<TApiItemShow<TApiFieldsUnion>>(
      'module/store',
      isCreate ? 'post' : 'put',
      {
        module: module.value,
        fields: newFields,
      },
    )
    if (!res.success) {
      return res
    }

    const tagAndSlug = tagAndSlugFromId(res.data.fields.id)

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
    upload,
  }
})
