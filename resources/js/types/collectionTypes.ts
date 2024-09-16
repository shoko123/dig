// collectionTypes.ts

import { TMediaOfItem, TMediaUrls } from '@/js/types/mediaTypes'
import { TModule, TApiTabularByModule, TTabularByModule } from '@/js/types/moduleTypes'

type TCollectionView = 'Gallery' | 'Chips' | 'Tabular'

type TAllCollections = {
  main: string
  media: { id: number; order_column: number; urls: TMediaUrls }
  related: {
    id: string
    short: string
    relation_name: string
    module: TModule
    media: TMediaUrls
  }
}

type TCName = keyof TAllCollections
type TCArray = TAllCollections[TCName]

type TArrayByCName<C extends TCName = 'main'> = TAllCollections[C]

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

type TPageEqualFunc = (a: string, b: string) => boolean

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
