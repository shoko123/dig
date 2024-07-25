// stores/trio.js
import { ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import type { TFieldsUnion } from '@/js/types/moduleTypes'
import type { TGroupColumn } from '@/js/types/trioTypes'
import { useXhrStore } from '../xhr'
import { useItemStore } from '../item'
import { useTrioStore } from './trio'
import { useRoutesMainStore } from '../routes/routesMain'

export const useTaggerStore = defineStore('tagger', () => {
  const { trio } = storeToRefs(useTrioStore())
  const { fields, selectedItemParams } = storeToRefs(useItemStore())

  const selectedNewItemParams = ref<string[]>([])

  function copyCurrentToNew() {
    selectedNewItemParams.value = [...selectedItemParams.value]
  }

  function truncateNewItemParams() {
    selectedNewItemParams.value = []
  }

  //When clearing params, set columns lookup and value to default (index 0)
  function setDefaultNewItemParams() {
    selectedNewItemParams.value = []
    const clCvParamKeys = selectedItemParams.value.filter((x) =>
      ['CL', 'CV'].includes(trio.value.groupsObj[trio.value.paramsObj[x].groupKey].code),
    )

    console.log(`tagger.clear('CL', 'CV' groupKeys): ${JSON.stringify(clCvParamKeys, null, 2)}`)
    clCvParamKeys.forEach((x) => {
      const group = trio.value.groupsObj[trio.value.paramsObj[x].groupKey]
      selectedNewItemParams.value.push(group.paramKeys[0])
    })
  }

  async function sync() {
    const { send } = useXhrStore()
    const { current } = storeToRefs(useRoutesMainStore())

    const payload = {
      module: current.value.module,
      id: (<TFieldsUnion>fields.value).id,
      global_tag_ids: <number[]>[],
      module_tag_ids: <number[]>[],
      columns: <{ column_name: string; val: number | string }[]>[],
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

        case 'CL':
        case 'CV':
          {
            const param = trio.value.paramsObj[paramKey]
            payload.columns.push({
              column_name: group.column_name,
              val: group.code === 'CL' ? <number>param.extra : param.text,
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
    setDefaultNewItemParams,
    truncateNewItemParams,
    copyCurrentToNew,
    sync,
  }
})
