import { defineStore, storeToRefs } from 'pinia'
import { useMediaStore } from '../media'

import type {
  TApiTrio,
  TApiParam,
  TGroupTmpUnion,
  TGroupUnion,
  TApiGroupByCode,
  TParamObj,
  TGroupObj,
  TCategoriesArray,
  TGroupLabelToKey,
  TGroupColumn,
  TParamTmp,
} from '@/js/types/trioTypes'

export const useTrioNormalizerStore = defineStore('trioNormalize', () => {
  const { mediaCollectionNames } = storeToRefs(useMediaStore())

  let categories: TCategoriesArray = []
  let groupsObj: TGroupObj = {}
  let paramsObj: TParamObj = {}
  let groupLabelToKey: TGroupLabelToKey = {}
  let fieldNameToGroupKey: TGroupLabelToKey = {}
  let orderByOptions: TApiParam[] = []
  let catCnt = 0
  let grpCnt = 0
  let prmCnt = 0
  let tmpGroup: TGroupTmpUnion | null = null
  let tmpParams: TParamTmp[] = []

  function reset() {
    categories = []
    groupsObj = {}
    paramsObj = {}
    groupLabelToKey = {}
    fieldNameToGroupKey = {}
    catCnt = 0
    grpCnt = 0
    prmCnt = 0
    tmpGroup = null
    tmpParams = []
  }

  function normalizeTrio2(apiTrio: TApiTrio) {
    reset()

    apiTrio.forEach((cat) => {
      categories.push({ name: cat.name, groupKeys: [] })
      cat.groups.forEach((grp) => {
        const grpKey = pad(grpCnt, 3)
        categories[catCnt].groupKeys.push(grpKey)
        switch (grp.code) {
          case 'CV':
            handleCV(grp as TApiGroupByCode<'CV'>)
            break

          case 'CS':
            handleCS(grp as TApiGroupByCode<'CS'>)
            break
          case 'TM':
            handleTag(grp as TApiGroupByCode<'TM'>)
            break
          case 'TG':
            handleTag(grp as TApiGroupByCode<'TG'>)
            break
          case 'MD':
            handleMD(grp as TApiGroupByCode<'MD'>)
            break
          case 'OB':
            handleOB(grp as TApiGroupByCode<'OB'>)
            break
          default:
        }
        saveGroupAndParams(grpKey)
        grpCnt++
      })
      catCnt++
    })

    return {
      trio: { categories, groupsObj, paramsObj },
      groupLabelToKey,
      fieldNameToGroupKey,
      orderByOptions,
    }
  }

  function saveGroupAndParams(grpKey: string) {
    // console.log(
    //   `saveGroup() group: ${JSON.stringify(tmpGroup, null, 2)} params: ${JSON.stringify(tmpParams, null, 2)}`,
    // )
    const grpToSave: TGroupUnion = {
      ...(tmpGroup as TGroupTmpUnion),
      paramKeys: <string[]>[],
      categoryIndex: catCnt,
    }

    tmpParams.forEach((p) => {
      const prmKey = pad(prmCnt, 3)
      grpToSave.paramKeys.push(prmKey)
      paramsObj[prmKey] = { ...p, groupKey: pad(grpCnt, 3) }
      prmCnt++
    })
    groupsObj[grpKey] = grpToSave
    groupLabelToKey[grpToSave.label] = grpKey

    if ('CV' === grpToSave.code) {
      fieldNameToGroupKey[(<TGroupColumn>grpToSave).column_name] = grpKey
    }
  }

  function processDependency(dependency: string[]) {
    return dependency.map((x) => {
      const pieces = x.split('.')
      const group = groupsObj[groupLabelToKey[pieces[0]]]
      //console.log(`groupLabel: ${pieces[0]}. key: ${groupLabelToKey[pieces[0]]}  `);
      const res = group.paramKeys.find((x) => paramsObj[x].text === pieces[1])
      return res!
    })
  }

  function handleCV(grp: TApiGroupByCode<'CV'>) {
    tmpParams = grp.params

    tmpGroup = {
      label: grp.label,
      code: grp.code,
      column_name: grp.column_name,
      text_source: grp.text_source,
      table_name: grp.table_name,
      column_type: grp.column_type,
      dependency: grp.dependency,
      show_in_item_tags: grp.show_in_item_tags,
      show_in_filters: grp.show_in_filters,
      show_in_tagger: grp.show_in_tagger,
      allow_dependents: grp.allow_dependents,
    }
  }

  function handleCS(grp: TApiGroupByCode<'CS'>) {
    tmpParams = Array(6).fill({ text: '', extra: null })
    tmpGroup = {
      label: grp.label,
      code: grp.code,
      column_name: grp.column_name,
    }
  }

  function handleTag(grp: TApiGroupByCode<'TM' | 'TG'>) {
    tmpParams = grp.params.map((x) => {
      return { text: x.text, extra: x.extra }
    })

    tmpGroup = {
      label: grp.label,
      code: grp.code,
      dependency: processDependency(grp.dependency),
      multiple: grp.multiple,
      group_id: grp.group_id,
    }
  }

  function handleMD(grp: TApiGroupByCode<'MD'>) {
    tmpParams = mediaCollectionNames.value.map((x) => {
      return { text: x, extra: '' }
    })

    tmpGroup = {
      label: grp.label,
      code: grp.code,
    }
  }

  function handleOB(grp: TApiGroupByCode<'OB'>) {
    orderByOptions = grp.params

    tmpParams = Array(grp.params.length).fill({ text: '', extra: null })

    tmpGroup = {
      label: grp.label,
      code: grp.code,
    }
  }

  function pad(num: number, size: number): string {
    let s = num + ''
    while (s.length < size) s = '0' + s
    return s
  }

  return {
    normalizeTrio2,
  }
})
