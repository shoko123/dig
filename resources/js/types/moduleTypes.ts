import type { TApiTrio, TOption } from '@/js/types/trioTypes'
import type { TCollectionView } from '@/js/types/collectionTypes'
import type { TLocus } from '@/js/types/modules/Locus'
import type { TStone } from '@/js/types/modules/Stone'
import type { TCeramic } from '@/js/types/modules/Ceramic'

type TModuleInfo = {
  url_name: string
  fields: object
  FD: object
  categorizedFields: object
  TabularViewFields: object
}

type TAllModules<T extends TModuleInfo = TModuleInfo> = {
  Stone: TStone<T>
  Locus: TLocus<T>
  Ceramic: TCeramic<T>
}

type TAllByModule<TModuleName extends TModule> = TAllModules[TModuleName]

type AddModuleProperty<T extends TAllModules> = {
  [k in keyof T]: T[k] & { module: k }
}[keyof T]

type SwapDatesWithStrings<T> = {
  [k in keyof T]: T[k] extends Date ? string : T[k]
}

type AddTagAndSlugProperties<M> = M & { tag: string; slug: string }

type ModuleToUrlName<T extends TAllModules> = {
  [Key in keyof T]: T[Key] extends TModuleInfo ? T[Key]['url_name'] : never
}

type UrlModuleToModule<T extends TModuleToUrlName> = {
  [Key in keyof T as T[Key] extends string ? T[Key] : never]: Key
}

type TModuleToUrlName = ModuleToUrlName<TAllModules>
type TUrlModuleNameToModule = UrlModuleToModule<TModuleToUrlName>

type TModuleBtnsInfo = { title: string; module: TModule; url_module: TUrlModule }
type ModuleUnion = AddModuleProperty<TAllModules>
type TModule = keyof TAllModules

type TUrlModule = ModuleUnion['url_name']
type TFieldsUnion = ModuleUnion['fields']
type TCategorizedFields = ModuleUnion['categorizedFields']

type TFieldsByModule<ModuleName extends TModule> = TAllByModule<ModuleName>['fields']
type TBespokeFieldsUnion = ModuleUnion['FD']
type TBespokeFieldsByModule<ModuleName extends TModule> = TAllByModule<ModuleName>['FD']

type TApiFieldsUnion = SwapDatesWithStrings<TFieldsUnion>
type TApiPageMainTabularUnion = ModuleUnion['TabularViewFields'] & { slug: string }

type TFieldValue = string | number | boolean

type TFieldInfo = {
  fieldName: string
  fieldValue: TFieldValue
  optionKey: string
  optionLabel: string
  optionExtra: TFieldValue
  options: TOption[]
  index: number
}

type TTabularByModule<ModuleName extends TModule> = TAllByModule<ModuleName>['TabularViewFields']
type TApiTabularByModule<ModuleName extends TModule> = AddTagAndSlugProperties<
  TTabularByModule<ModuleName>
>
type TFieldsToFieldInfo<T extends TBespokeFieldsUnion> = {
  [k in keyof T]: TFieldInfo
}

type TCategorizedFieldsByModule<M extends TModule> = TAllByModule<M>['categorizedFields']

type TObjCategorizerByFieldName<M extends TModule> = {
  [Key in keyof TCategorizedFieldsByModule<M>]: (val: TCategorizedFieldsByModule<M>[Key]) => number
}

/*

type TCategorizerByFieldName<M extends TModule> = {
  [Key in keyof TCategorizedFieldsByModule<M> as TCategorizedFieldsByModule<M>[Key] extends string
    ? TCategorizedFieldsByModule<M>[Key]
    : never]: (val: TCategorizedFieldsByModule<M>[Key]) => number
}

*/

type FuncCategorizer = (val: TFieldValue) => number
type TObjCategorizerFuncsByModule<M extends TModule> = Record<
  keyof TObjCategorizerByFieldName<M>,
  FuncCategorizer
>
type TObjAllCategorizerFuncs = TObjCategorizerFuncsByModule<TModule>

type TFuncIdToTagAndSlug = (id: string) => { slug: string; tag: string }
type TFuncSlugToId = (
  slug: string,
) => { success: true; id: string } | { success: false; message: string }

type TObjIdTagAnddSlugFuncsByModule = Record<
  TModule,
  { idToSlugTag: TFuncIdToTagAndSlug; slugToId: TFuncSlugToId }
>

type TApiModuleInit = {
  module: TModule
  counts: { items: number; media: number }
  first_id: string
  display_options: {
    item_views: string[]
    main_collection_views: TCollectionView[]
    related_collection_views: TCollectionView[]
  }
  trio: TApiTrio
  welcome_text: string
}

export {
  TModuleInfo,
  TModule,
  TUrlModule,
  TModuleToUrlName,
  TUrlModuleNameToModule,
  TModuleBtnsInfo,
  TFieldsUnion,
  TBespokeFieldsUnion,
  TApiFieldsUnion,
  TApiPageMainTabularUnion,
  TFieldsByModule,
  TApiTabularByModule,
  TTabularByModule,
  TApiModuleInit,
  TFieldInfo,
  TFieldsToFieldInfo,
  TBespokeFieldsByModule,
  TFieldValue,
  TObjCategorizerByFieldName,
  TObjAllCategorizerFuncs,
  TCategorizedFieldsByModule,
  TCategorizedFields,
  TObjIdTagAnddSlugFuncsByModule,
  TObjCategorizerFuncsByModule,
}
