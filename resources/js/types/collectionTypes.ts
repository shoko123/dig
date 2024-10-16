import { TMediaOfItem, TMediaUrls } from '@/types/mediaTypes'
import { TModule, TApiTabular, TTabular } from '@/types/moduleTypes'

type TCollectionView = 'Gallery' | 'Chips' | 'Tabular'

type TApiPageMain = {
  Gallery: {
    id: string
    short: string
    urls: TMediaUrls
  }
  Tabular: TTabular
  Chips: { id: string }
}

type TApiPageMedia = {
  Gallery: {
    id: number
    order_column: number
    urls: TMediaUrls
  }
}

type TApiPageRelated = {
  Gallery: {
    relation_name: string
    module: TModule
    id: string
    short: string
    urls: TMediaUrls
  }
  Tabular: {
    relation_name: string
    module: TModule
    id: string
    short: string
    urls: TMediaUrls
  }
  Chips: {
    relation_name: string
    module: TModule
    id: string
  }
}

type TAllCollections = {
  main: {
    array: string
    apiPage: TApiPageMain
  }
  media: {
    array: TApiPageMedia['Gallery']
    apiPage: TApiPageMedia
  }
  related: {
    array: TApiPageRelated['Gallery']
    apiPage: TApiPageRelated
  }
}

type TCName = keyof TAllCollections
type TArray<C extends TCName = TCName> = TAllCollections[C]['array']

type TApiPage1<C extends TCName> = TAllCollections[C]['apiPage']
type TViewsByCName<C extends TCName> = keyof TApiPage1<C>
type TApiPage2<C extends TCName, V extends TViewsByCName<C>> = TApiPage1<C>[V]
type TApiPage<
  C extends TCName = TCName,
  V extends TViewsByCName<C> = TViewsByCName<C>,
  M extends TModule = 'Stone',
> = C extends 'main' ? (V extends 'Tabular' ? TApiTabular<M> : TApiPage2<C, V>) : TApiPage2<C, V>

type TPage<
  C extends TCName = TCName,
  V extends TViewsByCName<C> = TViewsByCName<C>,
  M extends TModule = 'Stone',
> = V extends 'Gallery'
  ? SwapUrlWithMedia<TApiPage<C, V, M>> & { tag: string; slug: string }
  : TApiPage<C, V, M> & { tag: string; slug: string }

// //convert media property type from the api's TMediaUrls to the frontend's TMediaOfItem
type SwapUrlWithMedia<T extends TApiPage<TCName, 'Gallery'>> = Omit<T, 'urls'> & {
  media: TMediaOfItem
}

type TArrayEqualFunc = (a: TArray, b: TArray) => boolean
type TPageEqualFunc = (a: TArray, p: TPage) => boolean

// const a: TPage<'main', 'Tabular', 'Ceramic'> = {id: 'G', tag: "",}

export {
  TArray,
  TCName,
  TCollectionView,
  TApiPage,
  TPage,
  TArrayEqualFunc,
  TPageEqualFunc,
  TViewsByCName,
}
