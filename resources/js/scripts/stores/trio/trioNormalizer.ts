import { defineStore, storeToRefs } from 'pinia'
import { useMediaStore } from '../media'
import type { TModule } from '@/js/types/moduleTypes'
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
  TGroupField,
  TParamTmp,
} from '@/js/types/trioTypes'
import { useModuleStore } from '../module'

export const useTrioNormalizerStore = defineStore('trioNormalize', () => {
  const { mediaCollectionNames } = storeToRefs(useMediaStore())
  const { categorizerByFieldName } = useModuleStore()

  let categories: TCategoriesArray = []
  let groupsObj: TGroupObj = {}
  let paramsObj: TParamObj = {}
  let groupLabelToKey: TGroupLabelToKey = {}
  let discreteFieldNameToGroupKey: TGroupLabelToKey = {}
  let orderByOptions: TApiParam[] = []
  let catCnt = 0
  let grpCnt = 0
  let prmCnt = 0
  let tmpGroup: TGroupTmpUnion | null = null
  let tmpParams: TParamTmp[] = []
  let tmpModule: TModule | null = null

  function reset() {
    categories = []
    groupsObj = {}
    paramsObj = {}
    groupLabelToKey = {}
    discreteFieldNameToGroupKey = {}
    catCnt = 0
    grpCnt = 0
    prmCnt = 0
    tmpGroup = null
    tmpParams = []
  }

  function normalizetrio(apiTrio: TApiTrio, module: TModule) {
    reset()
    tmpModule = module
    apiTrio.forEach((cat) => {
      categories.push({ name: cat.name, groupKeys: [] })
      cat.groups.forEach((grp) => {
        const grpKey = pad(grpCnt, 3)
        categories[catCnt].groupKeys.push(grpKey)
        switch (grp.code) {
          case 'FD':
            handleFD(grp as TApiGroupByCode<'FD'>)
            break

          case 'FS':
            handleFS(grp as TApiGroupByCode<'FS'>)
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
      discreteFieldNameToGroupKey,
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

    if ('FD' === grpToSave.code) {
      discreteFieldNameToGroupKey[(<TGroupField>grpToSave).field_name] = grpKey
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

  function handleFD(grp: TApiGroupByCode<'FD'>) {
    tmpParams = grp.params

    tmpGroup = {
      label: grp.label,
      code: grp.code,
      field_name: grp.field_name,
      tag_source: grp.tag_source,
      table_name: grp.table_name,
      field_type: grp.field_type,
      dependency: grp.dependency,
      show_in_item_tags: grp.show_in_item_tags,
      show_in_filters: grp.show_in_filters,
      show_in_tagger: grp.show_in_tagger,
      allow_dependents: grp.allow_dependents,
    }
    if (grp.tag_source === 'Categorized') {
      tmpGroup.categorizer = categorizerByFieldName(tmpModule!, grp.field_name)
    }
  }

  function handleFS(grp: TApiGroupByCode<'FS'>) {
    tmpParams = Array(6).fill({ text: '', extra: null })
    tmpGroup = {
      label: grp.label,
      code: grp.code,
      field_name: grp.field_name,
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
    normalizetrio,
  }
})
