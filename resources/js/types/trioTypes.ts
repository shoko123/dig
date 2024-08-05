type TrioSourceName = 'Item' | 'New' | 'Filter'

type TAllGroups = {
  CV: {
    apiGroup: TApiGroupColumn
    group: TGroupColumnTmp
  }
  // CR: {
  //   apiGroup: TApiGroupColumn<string[]>
  //   group: TGroupColumnTmp
  // }
  // CB: {
  //   apiGroup: TApiGroupColumn<string[]>
  //   group: TGroupColumnTmp
  // }
  // CL: {
  //   apiGroup: TApiGroupColumn<TApiParamNameAndId[]>
  //   group: TGroupColumnTmp
  // }
  CS: {
    apiGroup: TApiGroupColumn
    group: TGroupColumnTmp
  }
  TM: {
    apiGroup: TApiGroupTag
    group: TGroupTagTmp
  }
  TG: {
    apiGroup: TApiGroupTag
    group: TGroupTagTmp
  }
  MD: {
    apiGroup: TApiGroupBase
    group: TGroupBaseTmp
  }
  OB: {
    apiGroup: TApiGroupBase
    group: TGroupColumnTmp
  }
}

//////////// Backend types /////////////////

//type TApiParamNameAndId = { name: string; id: number }

// type TApiParamNameAndColumn = { name: string; column_name: string }
type TApiParam = { text: string; extra: boolean | number | string }

type TApiGroupBase = {
  group_type_code: TCodeUnion
  group_name: string
  params: null | TApiParam[]
}

type TApiGroupColumn = TApiGroupBase & {
  text_source: string
  table_name: string
  column_name: string
  column_type: 'boolean' | 'string' | 'number'
  dependency: null | string[]
  allow_dependents: boolean
  allow_tagger_access: boolean

  /////
  // column_name: string
  // dependency: null | string[]
}

type TApiGroupTag = TApiGroupBase & {
  group_id: number
  dependency: null | string[]
  multiple: boolean
}

type TApiTrio = { name: string; groups: TGroupApiUnion[] }[]

//////////// Frontend types /////////////////

type TParamTmp = {
  text: string
  extra: null | number | string | boolean
}

type TParam = TParamTmp & {
  groupKey: string
}

//"Tmp" ending is for group fields prior to adding the trio "keep track" mechanisms (categoryIndex & paramKeys).

type TGroupBaseTmp = {
  label: string
  code: TCodeUnion
}

type TGroupTagTmp = TGroupBaseTmp & {
  dependency: string[]
  multiple: boolean
  group_id: number
}

type TGroupColumnTmp = TGroupBaseTmp & {
  text_source: string
  table_name: string
  column_name: string
  column_type: 'boolean' | 'number' | 'string'
  allow_tagger_access: boolean
  allow_dependents: boolean
  dependency: string[]
}

type AddTrioFields<T> = T & {
  categoryIndex: number
  paramKeys: string[]
}

type TGroupBase = AddTrioFields<TGroupBaseTmp>
type TGroupTag = AddTrioFields<TGroupTagTmp>
type TGroupColumn = AddTrioFields<TGroupColumnTmp>

type AddCode<T, V> = T & { code: V }
type AddGroupTypeCode<T, V> = T & { group_type_code: V }

type GroupUnionA<T extends object> = {
  [k in keyof T]: T[k] & { group_type_code: k }
}[keyof T]

type GroupUnionB = GroupUnionA<TAllGroups>
type TCodeUnion = keyof TAllGroups
type TGroupApiUnion = AddGroupTypeCode<GroupUnionB['apiGroup'], GroupUnionB['group_type_code']>
type TGroupTmpUnion = AddCode<GroupUnionB['group'], GroupUnionB['group_type_code']>
type TGroupUnion = AddTrioFields<TGroupTmpUnion>
type TAllByCode<Code extends TCodeUnion> = TAllGroups[Code]
type TApiGroupByCode<Code extends TCodeUnion> = TAllByCode<Code>['apiGroup']

type TParamObj = { [key: string]: TParam }
type TGroupObj = { [key: string]: TGroupUnion }
type TCategoriesArray = { name: string; groupKeys: string[] }[]
type TGroupLabelToKey = { [key: string]: string }

type TTrio = { categories: TCategoriesArray; groupsObj: TGroupObj; paramsObj: TParamObj }

export {
  TrioSourceName,
  TTrio,
  TApiTrio,
  TApiParam,
  TGroupTmpUnion,
  TParamTmp,
  TGroupUnion,
  TApiGroupByCode,
  TParamObj,
  TGroupObj,
  TCategoriesArray,
  TGroupLabelToKey,
  TGroupBase,
  TGroupColumn,
  TGroupTag,
  //TApiParamNameAndColumn,
}
