import { defineStore, storeToRefs } from 'pinia'
import { useMainStore } from '../main'
import type {
  TApiTrio,
  TApiOption,
  TGroupTmpUnion,
  TGroupUnion,
  TApiGroupByCode,
  TOptionObj,
  TGroupObj,
  TCategoriesArray,
  TGroupOrFieldToKeyObj,
  TGroupField,
  TOptionTmp,
} from '@/types/trioTypes'
import type { TFieldValue, TObjAllCategorizerFuncs } from '@/types/moduleTypes'

export const useTrioNormalizerStore = defineStore('trioNormalize', () => {
  const { mediaCollectionNames } = storeToRefs(useMainStore())

  let categories: TCategoriesArray = []
  let groupsObj: TGroupObj = {}
  let optionsObj: TOptionObj = {}
  let groupLabelToGroupKeyObj: TGroupOrFieldToKeyObj = {}
  let fieldsToGroupKeyObj: TGroupOrFieldToKeyObj = {}
  let orderByOptions: TApiOption[] = []
  let catCnt = 0
  let grpCnt = 0
  let prmCnt = 0
  let tmpGroup: TGroupTmpUnion | null = null
  let tmpOptions: TOptionTmp[] = []

  function reset() {
    categories = []
    groupsObj = {}
    optionsObj = {}
    groupLabelToGroupKeyObj = {}
    fieldsToGroupKeyObj = {}
    catCnt = 0
    grpCnt = 0
    prmCnt = 0
    tmpGroup = null
    tmpOptions = []
  }

  async function normalizetrio(
    apiTrio: TApiTrio,
    categorizerObj: Record<string, (val: TFieldValue) => number>,
  ) {
    reset()
    console.log(`normalizeTrio()`)

    apiTrio.forEach((cat) => {
      categories.push({ name: cat.name, groupKeys: [] })
      cat.groups.forEach((grp) => {
        const grpKey = pad(grpCnt, 3)
        categories[catCnt].groupKeys.push(grpKey)
        switch (grp.code) {
          case 'FD':
            handleFD(grp as TApiGroupByCode<'FD'>, categorizerObj)
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
        saveGroupAndOptions(grpKey)
        grpCnt++
      })
      catCnt++
    })

    return {
      trio: { categories, groupsObj, optionsObj },
      groupLabelToGroupKeyObj,
      fieldsToGroupKeyObj,
      orderByOptions,
    }
  }

  function saveGroupAndOptions(grpKey: string) {
    // console.log(
    //   `saveGroup() group: ${JSON.stringify(tmpGroup, null, 2)} options: ${JSON.stringify(tmpOptions, null, 2)}`,
    // )
    const grpToSave: TGroupUnion = {
      ...(tmpGroup as TGroupTmpUnion),
      optionKeys: <string[]>[],
      categoryIndex: catCnt,
    }

    tmpOptions.forEach((p) => {
      const prmKey = pad(prmCnt, 3)
      grpToSave.optionKeys.push(prmKey)
      optionsObj[prmKey] = { ...p, groupKey: pad(grpCnt, 3) }
      prmCnt++
    })
    groupsObj[grpKey] = grpToSave
    groupLabelToGroupKeyObj[grpToSave.label] = grpKey

    if ('FD' === grpToSave.code) {
      fieldsToGroupKeyObj[(<TGroupField>grpToSave).field_name] = grpKey
    }
  }

  function processDependency(dependency: string[]) {
    return dependency.map((x) => {
      const pieces = x.split('.')
      const group = groupsObj[groupLabelToGroupKeyObj[pieces[0]]]
      //console.log(`groupLabel: ${pieces[0]}. key: ${groupLabelToGroupKeyObj[pieces[0]]}  `);
      const res = group.optionKeys.find((x) => optionsObj[x].text === pieces[1])
      return res!
    })
  }

  function handleFD(
    grp: TApiGroupByCode<'FD'>,
    catObj: Record<string, (val: TFieldValue) => number>,
  ) {
    tmpOptions = grp.options

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
      console.log(`trioNormalizer 'FD'  Categorized`)
      tmpGroup.categorizer = catObj[grp.field_name as keyof TObjAllCategorizerFuncs]
    }
  }

  function handleFS(grp: TApiGroupByCode<'FS'>) {
    tmpOptions = Array(6).fill({ text: '', extra: null })
    tmpGroup = {
      label: grp.label,
      code: grp.code,
      field_name: grp.field_name,
    }
  }

  function handleTag(grp: TApiGroupByCode<'TM' | 'TG'>) {
    tmpOptions = grp.options.map((x) => {
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
    tmpOptions = mediaCollectionNames.value.map((x) => {
      return { text: x, extra: '' }
    })

    tmpGroup = {
      label: grp.label,
      code: grp.code,
    }
  }

  function handleOB(grp: TApiGroupByCode<'OB'>) {
    orderByOptions = grp.options

    tmpOptions = Array(grp.options.length).fill({ text: '', extra: null })

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
