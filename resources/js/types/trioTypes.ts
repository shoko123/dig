import type { TFieldValue } from '@/js/types/moduleTypes'
type TrioSourceName = 'Item' | 'New' | 'Filter'

type TAllGroups = {
  FD: {
    apiGroup: TApiGroupColumn
    group: TGroupFieldTmp
  }
  FS: {
    apiGroup: TApiGroupColumn
    group: TGroupFieldTmp
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
    group: TGroupFieldTmp
  }
}

//////////// Backend types /////////////////

type TApiParam = { text: string; extra: TFieldValue }

type TApiGroupBase = {
  code: TCodeUnion
  label: string
  params: TApiParam[]
}

type TFieldValueSource =
  | 'Value' // exact table value with a text that is a one-to-one conversion of the field values
  | 'Lookup' // lookup table
  | 'Categorized' // categorize all possible value to a list oflimited choices

type TApiGroupColumn = TApiGroupBase & {
  tag_source: TFieldValueSource
  table_name: string
  field_name: string
  field_type: 'boolean' | 'string' | 'number'
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

type TCategorizerFunc = (val: TFieldValue) => number

type TGroupFieldTmp = TGroupBaseTmp & {
  tag_source: TFieldValueSource
  table_name: string
  field_name: string
  field_type: 'boolean' | 'number' | 'string'
  show_in_item_tags: boolean
  show_in_filters: boolean
  show_in_tagger: boolean
  allow_dependents: boolean
  dependency: string[]
  categorizer?: TCategorizerFunc
}

type AddTrioFields<T> = T & {
  categoryIndex: number
  paramKeys: string[]
}

type TGroupBase = AddTrioFields<TGroupBaseTmp>
type TGroupTag = AddTrioFields<TGroupTagTmp>
type TGroupField = AddTrioFields<TGroupFieldTmp>

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
type TGroupOrFieldToKeyObj = { [key: string]: string }

type TTrio = { categories: TCategoriesArray; groupsObj: TGroupObj; paramsObj: TParamObj }

export {
  TrioSourceName,
  TTrio,
  TApiTrio,
  TApiParam,
  TGroupApiUnion,
  TGroupTmpUnion,
  TParamTmp,
  TParam,
  TGroupUnion,
  TApiGroupByCode,
  TParamObj,
  TGroupObj,
  TCategoriesArray,
  TGroupOrFieldToKeyObj,
  TGroupBase,
  TGroupField,
  TGroupTag,
  TFieldValueSource,
  TCategorizerFunc,
}
