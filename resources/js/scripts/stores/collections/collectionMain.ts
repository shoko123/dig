import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TApiArray, TApiPage, TPage, TCollectionView } from '@/js/types/collectionTypes'
import type { TFuncLoadPage } from '@/js/types/routesTypes'
import type { TModule, TApiPageMainTabularUnion } from '@/js/types/moduleTypes'
import { useModuleStore } from '../module'
import { useXhrStore } from '../xhr'
import { useMediaStore } from '../media'
import { useCollectionsStore } from './collections'

export const useCollectionMainStore = defineStore('collectionMain', () => {
  const { send } = useXhrStore()
  const { buildMedia } = useMediaStore()
  const { tagAndSlugFromId } = useModuleStore()
  const { getConsumeableCollection } = useCollectionsStore()

  const pageNoB1 = ref(1)
  const viewIndex = ref(0)
  const array = ref<TApiArray[]>([])

  const page = ref<TPage<'main', TCollectionView, TModule>[]>([])

  const info = computed(() => {
    return getConsumeableCollection(
      'main',
      viewIndex.value,
      pageNoB1.value,
      page.value.length,
      array.value.length,
    )
  })

  const loadPage: TFuncLoadPage = async function (
    pageNo: number,
    view: TCollectionView,
    pageLength: number,
    module: TModule,
  ) {
    const start = (pageNo - 1) * pageLength

    console.log(
      `loadPage() c: main v: ${view} pageB1: ${pageNo}  length: ${pageLength} startIndex: ${start} endIndex: ${start + pageLength - 1} module: ${module}`,
    )

    //if view is chips, use a slice into the 'main' collection's array
    if (view === 'Chips') {
      pageNoB1.value = pageNo
      const slice = array.value.slice(start, start + pageLength)
      savePage(
        slice,
        // slice.map((x) => {
        //   return { id: x, ...tagAndSlugFromId(module, x) }
        // }),
        view,
        module,
      )
      return { success: true, message: '' }
    }

    //'Gallery' and 'Tabular' views require db access
    const ids = array.value.slice(start, start + pageLength)
    // console.log(`start: ${start}, pageLength: ${pageLength}, ids to send to module/page: ${ids}`)
    if (ids.length === 0) {
      console.log(`ids.length is 0 - returning`)
      savePage([], view, module)
      return { success: false, message: 'Error: page size 0.' }
    }

    const res = await send<TApiPage<'main', 'Gallery'>[]>('module/page', 'post', {
      module: module,
      view: view,
      ids,
    })
    if (res.success) {
      savePage(res.data, view, module)
      pageNoB1.value = pageNo
      return { success: true, message: '' }
    } else {
      console.log(`loadPage failed. err: ${JSON.stringify(res.message, null, 2)}`)
      return { success: false, message: res.message }
    }
  }

  function savePage<M extends TModule>(
    apiPage: TApiPage<'main', TCollectionView, TModule>[],
    view: TCollectionView,
    module: M,
  ): void {
    let toSave = []
    let typed = []
    //console.log(`savePage view: ${view.name} apiPage: ${JSON.stringify(apiPage, null, 2)}`)
    switch (view) {
      case 'Gallery':
        typed = apiPage as TApiPage<'main', 'Gallery', M>[]
        toSave = typed.map((x) => {
          const media = buildMedia(x.media, module)
          return { ...x, ...tagAndSlugFromId(x.id), media }
        })
        page.value = toSave
        break

      case 'Tabular':
        typed = apiPage as TApiPageMainTabularUnion[]
        toSave = typed.map((x) => {
          return { ...x, ...tagAndSlugFromId(x.id) }
        })
        page.value = toSave
        break

      case 'Chips':
        typed = apiPage as string[]
        toSave = typed.map((x) => {
          return { id: x, ...tagAndSlugFromId(x) }
        })
        page.value = toSave
        break
    }
    //console.log(`mainCollection.savePage() length: ${toSave.length}\npage:\n${JSON.stringify(page.value, null, 2)}`)
  }

  function itemIndexById<IDtype extends string | number>(id: IDtype) {
    const index = array.value.findIndex((x) => x === id)
    //console.log(`collectionMain.itemIndexById(id:${id}) array: ${JSON.stringify(array.value.slice(0,5), null, 2)} index: ${index}`)
    return index
  }

  function itemIsInPage<IDtype extends string | number>(id: IDtype) {
    return page.value.some((x) => (<TPage<'main', 'Gallery'>>x).id === id)
  }

  // function removeItemFromArray(id: string): number {
  //   const index = array.value.indexOf(id)
  //   if (index > -1) {
  //     array.value.splice(index, 1)
  //   }

  //   const newArray = array.value.filter((x) => x !== id)
  //   array.value = newArray
  //   return newArray.length
  // }

  function clear() {
    console.log(`collectionMain.clear()`)
    array.value = []
    page.value = []
    pageNoB1.value = 1
  }

  return {
    pageNoB1,
    viewIndex,
    array,
    page,
    loadPage,
    itemIndexById,
    itemIsInPage,
    // removeItemFromArray,
    clear,
    info,
  }
})
