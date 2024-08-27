// stores/trio.js
import { ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import type { TFieldsUnion } from '@/js/types/moduleTypes'
import type { TGroupField } from '@/js/types/trioTypes'
import { useXhrStore } from '../xhr'
import { useItemStore } from '../item'
import { useTrioStore } from './trio'
import { useModuleStore } from '../module'

export const useTaggerStore = defineStore('tagger', () => {
  const { trio, fieldsToGroupKeyObj } = storeToRefs(useTrioStore())
  const { fields, itemAllParams } = storeToRefs(useItemStore())
  const { send } = useXhrStore()
  const { module } = storeToRefs(useModuleStore())

  const selectedNewItemParams = ref<string[]>([])

  function prepareTagger() {
    selectedNewItemParams.value = itemAllParams.value.filter((x) => {
      const code = trio.value.groupsObj[trio.value.paramsObj[x].groupKey].code
      return code === 'TG' || code === 'TM'
    })

    const tmpMap = new Map()
    Object.entries(fieldsToGroupKeyObj.value).forEach(([key, value]) => {
      const group = trio.value.groupsObj[value]

      if (group.code === 'FD' && (<TGroupField>group).show_in_tagger) {
        const val = fields.value![key as keyof TFieldsUnion]
        const paramKey = group.paramKeys.find(
          // ** weak comparison because param.extra is either string, number or boolean
          (y) => trio.value.paramsObj[y].extra == val,
        )
        if (paramKey === undefined) {
          throw new Error(
            `prepareTagger() - Can't find value ${val} in group ${group.label} field ${key}`,
          )
        }
        selectedNewItemParams.value.push(paramKey)
      }
    })
    const res = Object.fromEntries(tmpMap.entries())
    return res
  }

  function truncateNewItemParams() {
    selectedNewItemParams.value = []
  }

  //When clearing params, set field values to default (index 0)
  function resetParams() {
    selectedNewItemParams.value = []
    for (const x in fieldsToGroupKeyObj.value) {
      const group = trio.value.groupsObj[fieldsToGroupKeyObj.value[x]]

      if (group.code === 'FD' && (<TGroupField>group).show_in_tagger) {
        selectedNewItemParams.value.push(group.paramKeys[0])
      }
      console.log(`Add Field Tag: ${group.label} => "${x}`)
    }
  }

  async function sync() {
    const payload = {
      module: module.value,
      module_id: (<TFieldsUnion>fields.value).id,
      global_tag_ids: <number[]>[],
      module_tag_ids: <number[]>[],
      fields: <{ field_name: string; val: number | string | boolean }[]>[],
    }

    selectedNewItemParams.value.forEach((paramKey) => {
      const group = <TGroupField>trio.value.groupsObj[trio.value.paramsObj[paramKey].groupKey]
      switch (group.code) {
        case 'TG':
          payload.global_tag_ids.push(<number>trio.value.paramsObj[paramKey].extra)
          break

        case 'TM':
          payload.module_tag_ids.push(<number>trio.value.paramsObj[paramKey].extra)
          break

        case 'FD':
          {
            const param = trio.value.paramsObj[paramKey]
            payload.fields.push({
              field_name: group.field_name,
              val: param.extra,
            })
          }
          break
      }
    })

    //console.log(`tagger.toSend: ${JSON.stringify(payload, null, 2)}`)
    const res = await send<boolean>('tags/sync', 'post', payload)

    if (res.success) {
      return { success: true }
    }
    return { success: false, message: res.message }
  }

  return {
    selectedNewItemParams,
    truncateNewItemParams,
    prepareTagger,
    resetParams,
    sync,
  }
})
