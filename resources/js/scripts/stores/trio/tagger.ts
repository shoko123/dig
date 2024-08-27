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

  const taggerAllParams = ref<string[]>([])

  function prepareTagger() {
    taggerAllParams.value = itemAllParams.value
  }

  function clearParams() {
    taggerAllParams.value = []
  }

  function setDefaultParams() {
    //copy all the params from item
    taggerAllParams.value = itemAllParams.value

    //keep only 'Categorized'
    taggerAllParams.value = taggerAllParams.value.filter((x) => {
      const group = <TGroupField>trio.value.groupsObj[trio.value.paramsObj[x].groupKey]
      return group.tag_source === 'Categorized'
    })

    // add fields dependent params (except 'Categorized') with default group.paramKeys[0]
    for (const x in fieldsToGroupKeyObj.value) {
      const group = trio.value.groupsObj[fieldsToGroupKeyObj.value[x]]
      if (group.code === 'FD' && (<TGroupField>group).tag_source !== 'Categorized') {
        taggerAllParams.value.push(group.paramKeys[0])
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

    taggerAllParams.value.forEach((paramKey) => {
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
            if (group.tag_source !== 'Categorized') {
              const param = trio.value.paramsObj[paramKey]
              payload.fields.push({
                field_name: group.field_name,
                val: param.extra,
              })
            }
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
    taggerAllParams,
    clearParams,
    prepareTagger,
    setDefaultParams,
    sync,
  }
})
