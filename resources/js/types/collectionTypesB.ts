// collectionTypes.ts

import { TMediaOfItem, TMediaUrls } from '@/js/types/mediaTypes'
import {
  TModule,
  TApiTabularByModule,
  TTabularByModule,
  // TApiPageMainTabular,
} from '@/js/types/moduleTypes'

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
    id: number
    short: string
    urls: TMediaUrls
  }
  Tabular: {
    relation_name: string
    module: TModule
    id: string
    short: string
    media: TMediaUrls
  }
  Chips: {
    relation_name: string
    module: TModule
    id: string
  }
}

// type AddSlugAndTagToValues<
//   M extends TModule,
//   P extends TApiPageMain<M> | TApiPageRelated | TApiPageMedia,
// > = {
//   [k in keyof P]: P[k] & { tag: string; slug: string }
// }[keyof P]

type TAllCollections<M extends TModule = 'Stone'> = {
  main: {
    array: string
    apiPage: TApiPageMain<M>
    page: AddSlugAndTag<TApiPageMain<M>>
    apiCarousel: {
      id: string
      short: string
      media: TMediaOfItem
    }
  }
  media: {
    array: TApiPageMedia['Gallery']
    apiPage: TApiPageMedia['Gallery']
    page: AddSlugAndTag<TApiPageMedia>
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
    array: TApiPageRelated
    apiPage: TApiPageRelated
    page: AddSlugAndTag<TApiPageRelated>
    apiCarousel: {
      module: TModule
      id: number
      urls: TMediaUrls
      short: string
      relation_name: string
    }
  }
}

type TCName = keyof TAllCollections
type TCArray = TAllCollections[TCName]['array']

type TArrayByCName<C extends TCName = 'main'> = TAllCollections[C]['array']
// type TApiPage1 = TAllCollections[TCName]['apiPage']

type TApiPage<
  C extends TCName,
  V extends TCollectionView,
  M extends TModule = 'Stone',
> = C extends 'main'
  ? V extends 'Tabular'
    ? TApiTabularByModule<M>
    : V extends 'Gallery'
      ? {
          id: string
          short: string
          media: TMediaUrls
        }
      : // <'main', 'Chips', default>
        string
  : C extends 'media'
    ? TArrayByCName<'media'>
    : /* C extends 'related' */
      V extends 'Tabular'
      ? {
          relation_name: string
          module: TModule
          id: number
          slug: string
          tag: string
          short: string
        }
      : V extends 'Gallery'
        ? TApiPage<'main', 'Gallery'> & {
            relation_name: string
            module: TModule
          }
        : TApiPage<'main', 'Chips'>

type AddSlugAndTag<T> = T & {
  tag: string
  slug: TModule
}

type TPage<
  C extends TCName,
  V extends TCollectionView,
  M extends TModule = 'Stone',
> = C extends 'main'
  ? V extends 'Tabular'
    ? AddSlugAndTag<TTabularByModule<M>>
    : V extends 'Gallery'
      ? AddSlugAndTag<TApiPage<'main', 'Gallery'>>
      : //V extends 'Chips'
        {
          id: string
          slug: string
          tag: string
        }
  : C extends 'media'
    ? TArrayByCName<'media'>
    : V extends 'Tabular'
      ? AddSlugAndTag<TApiPage<'related', 'Tabular'>>
      : V extends 'Gallery'
        ? AddSlugAndTag<ExchangeMediaProperty<TApiPage<'related', 'Gallery'>>>
        : TPage<'main', 'Chips'> & {
            module: TModule
          }

//used by MediaSquare & MediaOverlay to pass a 'generic' record of different types between them
type TGalleryIntersection = TPage<'main', 'Gallery'> &
  TPage<'media', 'Gallery'> &
  TPage<'related', 'Gallery'>

//convert media proporty type from the api's TMediaUrls to the frontend's TMediaOfItem
type ExchangeMediaProperty<T extends TApiPage<'related', 'Gallery'>> = Omit<T, 'media'> & {
  media: TMediaOfItem
}
type TArrayEqualFunc = (a: TCArray, b: TCArray) => boolean

type TPageEqualFunc<C extends TCName, V extends TCollectionView, M extends TModule = 'Stone'> = (
  a: TApiPage<C, V, M>,
  b: TApiPage<C, V, M>,
) => boolean

export {
  TArrayByCName,
  TCName,
  TCArray,
  TCollectionView,
  TApiPage,
  TPage,
  TGalleryIntersection,
  TArrayEqualFunc,
  TPageEqualFunc,
}
