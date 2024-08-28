import type { TFieldValue } from '@/js/types/moduleTypes'
type TrioSourceName = 'Item' | 'Tagger' | 'Filter'

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

type TApiOption = { text: string; extra: TFieldValue }

type TApiGroupBase = {
  code: TCodeUnion
  label: string
  options: TApiOption[]
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

type TOptionTmp = {
  text: string
  extra: TFieldValue
}

type TOption = TOptionTmp & {
  groupKey: string
}

//"Tmp" ending is for group fields prior to adding the trio "keep track" mechanisms (categoryIndex & optionKeys).

type TGroupBaseTmp = {
  label: string
  code: TCodeUnion
  options?: TOptionTmp[]
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
  optionKeys: string[]
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

type TOptionObj = { [key: string]: TOption }
type TGroupObj = { [key: string]: TGroupUnion }
type TCategoriesArray = { name: string; groupKeys: string[] }[]
type TGroupOrFieldToKeyObj = { [key: string]: string }

type TTrio = { categories: TCategoriesArray; groupsObj: TGroupObj; optionsObj: TOptionObj }

export {
  TrioSourceName,
  TTrio,
  TApiTrio,
  TApiOption,
  TGroupApiUnion,
  TGroupTmpUnion,
  TOptionTmp,
  TOption,
  TGroupUnion,
  TApiGroupByCode,
  TOptionObj,
  TGroupObj,
  TCategoriesArray,
  TGroupOrFieldToKeyObj,
  TGroupBase,
  TGroupField,
  TGroupTag,
  TFieldValueSource,
  TCategorizerFunc,
}
