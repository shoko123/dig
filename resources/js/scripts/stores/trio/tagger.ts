// stores/trio.js
import { ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import type { TFieldsUnion, TFieldValue } from '@/js/types/moduleTypes'
import type { TGroupField } from '@/js/types/trioTypes'
import { useXhrStore } from '../xhr'
import { useItemStore } from '../item'
import { useTrioStore } from './trio'
import { useModuleStore } from '../module'

export const useTaggerStore = defineStore('tagger', () => {
  const { trio, fieldsToGroupKeyObj } = storeToRefs(useTrioStore())
  const { fields, itemAllOptions } = storeToRefs(useItemStore())
  const { send } = useXhrStore()
  const { module } = storeToRefs(useModuleStore())

  const taggerAllOptions = ref<string[]>([])

  function prepareTagger() {
    taggerAllOptions.value = itemAllOptions.value
  }

  function clearOptions() {
    taggerAllOptions.value = []
  }

  function setDefaultOptions() {
    //copy all the options from item
    taggerAllOptions.value = itemAllOptions.value

    //keep only 'Categorized'
    taggerAllOptions.value = taggerAllOptions.value.filter((x) => {
      const group = <TGroupField>trio.value.groupsObj[trio.value.optionsObj[x].groupKey]
      return group.tag_source === 'Categorized'
    })

    // add fields dependent options (except 'Categorized') with default group.optionKeys[0]
    for (const x in fieldsToGroupKeyObj.value) {
      const group = trio.value.groupsObj[fieldsToGroupKeyObj.value[x]]
      if (group.code === 'FD' && (<TGroupField>group).tag_source !== 'Categorized') {
        taggerAllOptions.value.push(group.optionKeys[0])
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
      fields: <{ field_name: string; val: TFieldValue }[]>[],
    }

    taggerAllOptions.value.forEach((optionKey) => {
      const group = <TGroupField>trio.value.groupsObj[trio.value.optionsObj[optionKey].groupKey]
      switch (group.code) {
        case 'TG':
          payload.global_tag_ids.push(<number>trio.value.optionsObj[optionKey].extra)
          break

        case 'TM':
          payload.module_tag_ids.push(<number>trio.value.optionsObj[optionKey].extra)
          break

        case 'FD':
          {
            if (group.tag_source !== 'Categorized') {
              const option = trio.value.optionsObj[optionKey]
              payload.fields.push({
                field_name: group.field_name,
                val: option.extra,
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
    taggerAllOptions,
    clearOptions,
    prepareTagger,
    setDefaultOptions,
    sync,
  }
})
