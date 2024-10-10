import { defineStore, storeToRefs } from 'pinia'
import type { TFields } from '@/types/moduleTypes'
import { useXhrStore } from '../xhr'
import { useItemStore } from '../item'
import { useModuleStore } from '../module'
import { useTrioStore } from './trio'

export const useTaggerStore = defineStore('tagger', () => {
  const { fields } = storeToRefs(useItemStore())
  const { send } = useXhrStore()
  const { module } = storeToRefs(useModuleStore())
  const { taggerConvertSelectedToApi } = useTrioStore()

  async function sync() {
    const payload = {
      module: module.value,
      module_id: (<TFields>fields.value).id,
      ...taggerConvertSelectedToApi(),
    }

    //console.log(`tagger.toSend: ${JSON.stringify(payload, null, 2)}`)
    const res = await send<boolean>('tags/sync', 'post', payload)

    if (res.success) {
      return { success: true }
    }
    return { success: false, message: res.message }
  }

  return {
    sync,
  }
})
