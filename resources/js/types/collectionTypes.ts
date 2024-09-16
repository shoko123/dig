import { TMediaOfItem, TMediaUrls } from '@/js/types/mediaTypes'
import { TModule, TApiTabularByModule, TTabularByModule } from '@/js/types/moduleTypes'

type TCollectionView = 'Gallery' | 'Chips' | 'Tabular'

type TApiPageMain<M extends TModule> = {
  Gallery: {
    id: string
    short: string
    urls: TMediaUrls
  }
  Tabular: TTabularByModule<M>
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

type TAllCollections<M extends TModule> = {
  main: {
    array: string
    apiPage: TApiPageMain<M>
    apiCarousel: {
      id: string
      short: string
      media: TMediaOfItem
    }
  }
  media: {
    array: TApiPageMedia['Gallery']
    apiPage: TApiPageMedia
    apiCarousel: {
      id: number
      urls: TMediaUrls
      size: number
      collection_name: string
      file_name: string
      order_column: number
      title: string
      text: string
    }
  }
  related: {
    array: TApiPageRelated['Gallery']
    apiPage: TApiPageRelated
    apiCarousel: {
      relation_name: string
      module: TModule
      id: number
      urls: TMediaUrls
      short: string
    }
  }
}

type TCName = keyof TAllCollections<TModule>
type TCArray = TAllCollections<TModule>[TCName]['array']
type TArrayByCName<C extends TCName = 'main'> = TAllCollections<TModule>[C]['array']

type TApiPage1<C extends TCName> = TAllCollections<TModule>[C]['apiPage']
type TViewsByCName<C extends TCName> = keyof TApiPage1<C>
type TApiPage2<C extends TCName, V extends TViewsByCName<C>> = TApiPage1<C>[V]
type TApiPage<
  C extends TCName,
  V extends TViewsByCName<C>,
  M extends TModule = 'Stone',
> = C extends 'main'
  ? V extends 'Tabular'
    ? TApiTabularByModule<M>
    : TApiPage2<C, V>
  : TApiPage2<C, V>

type TPage<
  C extends TCName,
  V extends TViewsByCName<C>,
  M extends TModule = 'Stone',
> = V extends 'Gallery'
  ? SwapUrlWithMedia<TApiPage<C, V, M>> & { tag: string; slug: string }
  : TApiPage<C, V, M> & { tag: string; slug: string }

// //convert media property type from the api's TMediaUrls to the frontend's TMediaOfItem
type SwapUrlWithMedia<T extends TApiPage<TCName, 'Gallery'>> = Omit<T, 'urls'> & {
  media: TMediaOfItem
}

type TArrayEqualFunc = (a: TCArray, b: TCArray) => boolean
type TPageEqualFunc = (a: string, b: string) => boolean

// const a: TPage<'main', 'Tabular', 'Ceramic'> = {id: 'G', tag: "",}

export {
  TArrayByCName,
  TCName,
  TCArray,
  TCollectionView,
  TApiPage,
  TPage,
  TArrayEqualFunc,
  TPageEqualFunc,
}
