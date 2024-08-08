// stores/trio.js
import { ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import type { TFieldsUnion, TKeyOfFields } from '@/js/types/moduleTypes'
import type { TGroupColumn } from '@/js/types/trioTypes'
import { useXhrStore } from '../xhr'
import { useItemStore } from '../item'
import { useTrioStore } from './trio'
import { useRoutesMainStore } from '../routes/routesMain'

export const useTaggerStore = defineStore('tagger', () => {
  const { trio, fieldNameToGroupKey } = storeToRefs(useTrioStore())
  const { fields, selectedItemParams } = storeToRefs(useItemStore())

  const selectedNewItemParams = ref<string[]>([])

  function prepareTagger() {
    selectedNewItemParams.value = selectedItemParams.value.filter((x) => {
      const code = trio.value.groupsObj[trio.value.paramsObj[x].groupKey].code
      return code === 'TG' || code === 'TM'
    })

    for (const x in fieldNameToGroupKey.value) {
      const group = trio.value.groupsObj[fieldNameToGroupKey.value[x]]

      if (group.code === 'CV' && (<TGroupColumn>group).show_in_tagger) {
        const paramKey = group.paramKeys.find(
          // ** weak comparison because param.extra is either string, number or boolean
          (y) => trio.value.paramsObj[y].extra == (<TFieldsUnion>fields.value)[<TKeyOfFields>x],
        )

        if (paramKey === undefined) {
          console.log(`******serious error while preparing tagger****`)
          return
        }

        selectedNewItemParams.value.push(paramKey)
      }
      console.log(`Add Column Tag: ${group.label} => "${x}`)
    }
  }

  function truncateNewItemParams() {
    selectedNewItemParams.value = []
  }

  //When clearing params, set column values to default (index 0)
  function resetParams() {
    selectedNewItemParams.value = []
    for (const x in fieldNameToGroupKey.value) {
      const group = trio.value.groupsObj[fieldNameToGroupKey.value[x]]

      if (group.code === 'CV' && (<TGroupColumn>group).show_in_tagger) {
        selectedNewItemParams.value.push(group.paramKeys[0])
      }
      console.log(`Add Column Tag: ${group.label} => "${x}`)
    }
  }

  async function sync() {
    const { send } = useXhrStore()
    const { current } = storeToRefs(useRoutesMainStore())

    const payload = {
      module: current.value.module,
      module_id: (<TFieldsUnion>fields.value).id,
      global_tag_ids: <number[]>[],
      module_tag_ids: <number[]>[],
      columns: <{ column_name: string; val: number | string | boolean }[]>[],
    }

    selectedNewItemParams.value.forEach((paramKey) => {
      const group = <TGroupColumn>trio.value.groupsObj[trio.value.paramsObj[paramKey].groupKey]
      switch (group.code) {
        case 'TG':
          payload.global_tag_ids.push(<number>trio.value.paramsObj[paramKey].extra)
          break

        case 'TM':
          payload.module_tag_ids.push(<number>trio.value.paramsObj[paramKey].extra)
          break

        case 'CV':
          {
            const param = trio.value.paramsObj[paramKey]
            payload.columns.push({
              column_name: group.column_name,
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
