import { defineStore, storeToRefs } from 'pinia'
import type { TFields, TFieldValue } from '@/types/moduleTypes'
import type { TGroupField } from '@/types/trioTypes'
import { useXhrStore } from '../xhr'
import { useItemStore } from '../item'
import { useModuleStore } from '../module'
import { useTrioStore } from './trio'

export const useTaggerStore = defineStore('tagger', () => {
  const { fields } = storeToRefs(useItemStore())
  const { send } = useXhrStore()
  const { module } = storeToRefs(useModuleStore())
  const { itemFieldsToGroupKeyObj, trio, itemAllOptionKeys, taggerAllOptionKeys } =
    storeToRefs(useTrioStore())

  function taggerCopyItemOptionsToTagger() {
    const tmp = [...itemAllOptionKeys.value]
    taggerAllOptionKeys.value = [
      ...tmp.sort((a, b) => {
        return a > b ? 1 : -1
      }),
    ]
  }

  function taggerSetDefaultOptions() {
    const tmp: string[] = []
    // add fields dependent options (except 'Categorized') with default group.optionKeys[0]
    for (const x in itemFieldsToGroupKeyObj.value) {
      const group = trio.value.groupsObj[itemFieldsToGroupKeyObj.value[x]!]!
      if (group.code === 'FD' && (<TGroupField>group).tag_source !== 'Categorized') {
        tmp.push(group.optionKeys[0]!)
      }
      console.log(`Add Field Tag: ${group.label} => "${x}`)
    }
    taggerAllOptionKeys.value = [
      ...tmp.sort((a, b) => {
        return a > b ? 1 : -1
      }),
    ]
  }

  function taggerConvertSelectedToApi() {
    const optionsParams = {
      global_tag_ids: <number[]>[],
      module_tag_ids: <number[]>[],
      fields: <{ field_name: string; val: TFieldValue }[]>[],
    }

    taggerAllOptionKeys.value.forEach((optionKey) => {
      const group = <TGroupField>trio.value.groupsObj[trio.value.optionsObj[optionKey]!.groupKey]
      switch (group.code) {
        case 'TG':
          optionsParams.global_tag_ids.push(<number>trio.value.optionsObj[optionKey]!.extra)
          break

        case 'TM':
          optionsParams.module_tag_ids.push(<number>trio.value.optionsObj[optionKey]!.extra)
          break

        case 'FD':
          {
            if (group.tag_source !== 'Categorized') {
              const option = trio.value.optionsObj[optionKey]!
              optionsParams.fields.push({
                field_name: group.field_name,
                val: option.extra,
              })
            }
          }
          break
      }
    })
    // console.log(`taggerConvertSelectedToApi: ${JSON.stringify(optionsParams, null, 2)}`)
    return optionsParams
  }
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
    taggerCopyItemOptionsToTagger,
    taggerSetDefaultOptions,
  }
})
