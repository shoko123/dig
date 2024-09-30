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
  const trioStore = useTrioStore()

  function prepareTagger() {
    trioStore.copyItemOptionsToTaggerOptions()
  }

  async function setDefaultOptions() {
    trioStore.taggerAllOptions = []
    // add fields dependent options (except 'Categorized') with default group.optionKeys[0]
    for (const x in trioStore.fieldsToGroupKeyObj) {
      const group = trioStore.trio.groupsObj[trioStore.fieldsToGroupKeyObj[x]!]!
      if (group.code === 'FD' && (<TGroupField>group).tag_source !== 'Categorized') {
        trioStore.taggerAllOptions.push(group.optionKeys[0]!)
      }
      console.log(`Add Field Tag: ${group.label} => "${x}`)
    }
  }

  async function sync() {
    const payload = {
      module: module.value,
      module_id: (<TFields>fields.value).id,
      global_tag_ids: <number[]>[],
      module_tag_ids: <number[]>[],
      fields: <{ field_name: string; val: TFieldValue }[]>[],
    }

    trioStore.taggerAllOptions.forEach((optionKey) => {
      const group = <TGroupField>(
        trioStore.trio.groupsObj[trioStore.trio.optionsObj[optionKey]!.groupKey]
      )
      switch (group.code) {
        case 'TG':
          payload.global_tag_ids.push(<number>trioStore.trio.optionsObj[optionKey]!.extra)
          break

        case 'TM':
          payload.module_tag_ids.push(<number>trioStore.trio.optionsObj[optionKey]!.extra)
          break

        case 'FD':
          {
            if (group.tag_source !== 'Categorized') {
              const option = trioStore.trio.optionsObj[optionKey]!
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
    prepareTagger,
    setDefaultOptions,
    sync,
  }
})
