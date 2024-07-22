type TrioSourceName = 'Item' | 'New' | 'Filter'

type TAllGroups = {
  CV: {
    apiGroup: TApiGroupColumn<string[]>
    group: TGroupColumnTmp
  }
  CR: {
    apiGroup: TApiGroupColumn<string[]>
    group: TGroupColumnTmp
  }
  CB: {
    apiGroup: TApiGroupColumn<string[]>
    group: TGroupColumnTmp
  }
  CL: {
    apiGroup: TApiGroupColumn<TApiParamNameAndId[]>
    group: TGroupColumnTmp
  }
  CS: {
    apiGroup: TApiGroupColumn<null>
    group: TGroupColumnTmp
  }
  TM: {
    apiGroup: TApiGroupTag<TApiParamNameAndId[]>
    group: TGroupTagTmp
  }
  TG: {
    apiGroup: TApiGroupTag<TApiParamNameAndId[]>
    group: TGroupTagTmp
  }
  MD: {
    apiGroup: TApiGroupBase<null>
    group: TGroupBaseTmp
  }
  OB: {
    apiGroup: TApiGroupBase<TApiParamNameAndColumn[]>
    group: TGroupColumnTmp
  }
}

//////////// Backend types /////////////////

type TApiParamNameAndId = { name: string; id: number }

type TApiParamNameAndColumn = { name: string; column_name: string }

type TApiGroupBase<T> = {
  group_type_code: TCodeUnion
  group_name: string
  params: T
}

type TApiGroupColumn<T> = TApiGroupBase<T> & {
  column_name: string
  dependency: null | string[]
}

type TApiGroupTag<T> = TApiGroupBase<T> & {
  group_id: number
  dependency: null | string[]
  multiple: boolean
}

type TApiTrio = { name: string; groups: TGroupApiUnion[] }[]

//////////// Frontend types /////////////////

type TParamTmp = {
  text: string
  extra: null | number | string
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
  column_name: string
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
  TApiParamNameAndColumn,
}
