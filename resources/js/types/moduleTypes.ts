import type { TApiTrio, TParam } from '@/js/types/trioTypes'
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

type SwapDatesWithStrings<T> = {
  [k in keyof T]: T[k] extends Date ? string : T[k]
}

type TAllModules<T extends TModuleInfo = TModuleInfo> = {
  Stone: TStone<T>
  Locus: TLocus<T>
  Ceramic: TCeramic<T>
}

type AddTagAndSlugProperties<M> = M & { tag: string; slug: string }

type AddModuleProperty<T extends TAllModules> = {
  [k in keyof T]: T[k] & { module: k }
}[keyof T]

type ModuleToUrlName<T extends TAllModules> = {
  [Key in keyof T]: T[Key] extends TModuleInfo ? T[Key]['url_name'] : never
}

type UrlModuleToModule<T extends TModuleToUrlName> = {
  [Key in keyof T as T[Key] extends string ? T[Key] : never]: Key
}

type TModuleBtnsInfo = { title: string; module: TModule; url_module: TUrlModule }
type ModuleUnion = AddModuleProperty<TAllModules>
type TModule = keyof TAllModules

type TAllByName<TModuleName extends TModule> = TAllModules[TModuleName]

type TUrlModule = ModuleUnion['url_name']
type TFieldsUnion = ModuleUnion['fields']
type TCategorizedFields = ModuleUnion['categorizedFields']

type TFieldsByModule<ModuleName extends TModule> = TAllByName<ModuleName>['fields']
type TDiscreteColumnUnion = ModuleUnion['FD']
type TDiscreteFieldsByModule<ModuleName extends TModule> = TAllByName<ModuleName>['FD']

type TApiFieldsUnion = SwapDatesWithStrings<TFieldsUnion>
type TApiPageMainTabularUnion = ModuleUnion['TabularViewFields'] & { slug: string }

type TModuleToUrlName = ModuleToUrlName<TAllModules>
type TUrlModuleNameToModule = UrlModuleToModule<TModuleToUrlName>

type TFieldValue = string | number | boolean

type TFieldInfo = {
  fieldName: string
  fieldValue: TFieldValue
  paramKey: string
  paramLabel: string
  paramExtra: TFieldValue
  options: TParam[]
  index: number
}

type TFieldsToFieldInfo<T extends TDiscreteColumnUnion> = {
  [k in keyof T]: TFieldInfo
}

type TCategorizedFieldsByModule<M extends TModule> = TAllByName<M>['categorizedFields']

////////work RO
type TCategorizerByFieldName<M extends TModule> = {
  [Key in keyof TCategorizedFieldsByModule<M> as TCategorizedFieldsByModule<M>[Key] extends string
    ? TCategorizedFieldsByModule<M>[Key]
    : never]: (val: TCategorizedFieldsByModule<M>[Key]) => number
}

type CategorizerByModuleAndFieldName<
  M extends TModule,
  F extends keyof TCategorizedFieldsByModule<M>,
> = {
  [K in keyof F]: F[K] extends (val: F[K]) => number ? F[K] : never
}

type TAllTCategorizerByFieldName = TCategorizerByFieldName<TModule>

type TTabularByModule<ModuleName extends TModule> = TAllByName<ModuleName>['TabularViewFields']
type TApiTabularByModule<ModuleName extends TModule> = AddTagAndSlugProperties<
  TTabularByModule<ModuleName>
>

type FuncSlugToId = (
  slug: string,
) => { success: true; id: string } | { success: false; message: string }

type TApiModuleInit = {
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
  TDiscreteColumnUnion,
  TApiFieldsUnion,
  TApiPageMainTabularUnion,
  TFieldsByModule,
  TApiTabularByModule,
  TTabularByModule,
  TApiModuleInit,
  FuncSlugToId,
  TFieldInfo,
  TFieldsToFieldInfo,
  TDiscreteFieldsByModule,
  TFieldValue,
  TCategorizerByFieldName,
  TAllTCategorizerByFieldName,
  TCategorizedFieldsByModule,
  TCategorizedFields,
  CategorizerByModuleAndFieldName,
}
