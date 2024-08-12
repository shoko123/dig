type TrioSourceName = 'Item' | 'New' | 'Filter'

type TAllGroups = {
  CV: {
    apiGroup: TApiGroupColumn
    group: TGroupColumnTmp
  }
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

type TApiParam = { text: string; extra: boolean | number | string }

type TApiGroupBase = {
  code: TCodeUnion
  label: string
  params: TApiParam[]
}

type TColumnTextSource =
  | 'Column' // exact table value
  | 'Manipulated' // A one-to-one conversion of the field values
  | 'Lookup' // lookup table

type TApiGroupColumn = TApiGroupBase & {
  text_source: TColumnTextSource
  table_name: string
  column_name: string
  column_type: 'boolean' | 'string' | 'number'
  dependency: string[]
  allow_dependents: boolean
  show_in_item_tags: boolean
  show_in_filters: boolean
  show_in_tagger: boolean
}

type TApiGroupTag = TApiGroupBase & {
  group_id: number
  dependency: string[]
  multiple: boolean
}

type TApiTrio = { name: string; groups: TGroupApiUnion[] }[]

//////////// Frontend types /////////////////

type TParamTmp = {
  text: string
  extra: number | string | boolean
}

type TParam = TParamTmp & {
  groupKey: string
}

//"Tmp" ending is for group fields prior to adding the trio "keep track" mechanisms (categoryIndex & paramKeys).

type TGroupBaseTmp = {
  label: string
  code: TCodeUnion
  params?: TParamTmp[]
}

type TGroupTagTmp = TGroupBaseTmp & {
  dependency: string[]
  multiple: boolean
  group_id: number
}

type TGroupColumnTmp = TGroupBaseTmp & {
  text_source: TColumnTextSource
  table_name: string
  column_name: string
  column_type: 'boolean' | 'number' | 'string'
  show_in_item_tags: boolean
  show_in_filters: boolean
  show_in_tagger: boolean
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
type AddGroupTypeCode<T, V> = T & { code: V }

type GroupUnionA<T extends object> = {
  [k in keyof T]: T[k] & { code: k }
}[keyof T]

type GroupUnionB = GroupUnionA<TAllGroups>
type TCodeUnion = keyof TAllGroups
type TGroupApiUnion = AddGroupTypeCode<GroupUnionB['apiGroup'], GroupUnionB['code']>
type TGroupTmpUnion = AddCode<GroupUnionB['group'], GroupUnionB['code']>
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
  TGroupApiUnion,
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
}
