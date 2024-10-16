// routesStore.js
//handles the entire routing mechanism - parsing, loading resources, error handling

import { ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import {
  useRouter,
  type LocationQueryRaw,
  type RouteLocationNormalized,
  type RouteLocationRaw,
} from 'vue-router'
import type { TModule } from '@/types/moduleTypes'
import type { TRouteInfo, TPageName, TPlanAction } from '@/types/routesTypes'

import { useRoutesParserStore } from './routesParser'
import { useRoutesPlanTransitionStore } from './routesPlanTransition'
import { useRoutesPrepareStore } from './routesPrepare'
import { useAuthStore } from '../auth'
import { useModuleStore } from '../module'
import { useTrioStore } from '../trio/trio'
import { useNotificationsStore } from '../notifications'
import { useElementAndCollectionStore } from '../collections/elementAndCollection'

export const useRoutesMainStore = defineStore('routesMain', () => {
  const router = useRouter()
  const { parseModule } = useRoutesParserStore()

  const { planTransition } = useRoutesPlanTransitionStore()
  const { showSnackbar, showSpinner } = useNotificationsStore()
  const { moduleToUrlModuleName } = storeToRefs(useModuleStore())

  const current = ref<TRouteInfo>({
    url_module: undefined,
    slug: undefined,
    url_full_path: undefined,
    module: undefined,
    name: 'home',
    queryParams: undefined,
    preLoginFullPath: undefined,
  })

  const to = ref<TRouteInfo>({
    url_module: undefined,
    slug: undefined,
    url_full_path: undefined,
    module: undefined,
    name: 'home',
    queryParams: undefined,
    preLoginFullPath: undefined,
  })

  const inTransition = ref(false)

  async function handleRouteChange(
    handle_to: RouteLocationNormalized,
    handle_from: RouteLocationNormalized,
  ): Promise<RouteLocationRaw | true> {
    //These elements have to be here to prevent circular reference
    const { prepareForNewRoute } = useRoutesPrepareStore()
    const { authenticated } = storeToRefs(useAuthStore())

    console.log(`handleRouteChange(${String(handle_from.name)} -> ${String(handle_to.name)})`)

    //authorize
    if (handle_to.name === 'login' && authenticated.value) {
      console.log(
        `Authenticated user trying to access login route. to.name: ${handle_to.name}, authenticated: ${authenticated.value}`,
      )
      return handle_from
    }

    if (!authorize(handle_to.path)) {
      showSnackbar('Unauthorized; redirected to Login Page')
      return { name: 'login' }
    }

    to.value.name = <TPageName>handle_to.name
    to.value.url_full_path = handle_to.fullPath

    //parse module
    if ('url_module' in handle_to.params) {
      const res = parseModule(handle_to.params.url_module as string)
      // console.log(`After parse url_module. res: ${JSON.stringify(res, null, 2)}`)

      if (res.success) {
        to.value.module = <TModule>res.module
        to.value.url_module = res.url_module
      } else {
        console.log(`parseModule returned ${JSON.stringify(res, null, 2)}`)
        showSnackbar(`${res.message}. redirected to Home Page`)
        inTransition.value = false
        return { name: 'home' }
      }
    }

    //console.log(`after successful module parse. to: ${JSON.stringify(to.value, null, 2)})`)

    //verify that the transition is legal and prepare the plan required for a successful transition.

    const res1 = planTransition(handle_to, handle_from)

    if (!res1.success) {
      console.log('plan failed...')
      showSnackbar(`${res1.message} Redirected to Home Page`)
      inTransition.value = false
      return { name: 'home' }
    }

    console.log(`Plan successful: ${JSON.stringify(res1.data, null, 2)}`)

    //Access server and load stuff (async)
    inTransition.value = true

    const res = await prepareForNewRoute(
      to.value.module!,
      handle_to.query,
      <string>handle_to.params.slug,
      <TPlanAction[]>res1.data,
      handle_from.name === undefined,
    )
    if (res.success) {
      finalizeRouting(handle_to, handle_from)
    } else {
      inTransition.value = false
      if (res.message === 'Error: Empty result set' && handle_from.name === 'filter') {
        showSnackbar('No results returned. Please modify query and resubmit!')
        return { name: 'filter' }
      } else {
        showSpinner(false)
        showSnackbar(`Navigation Error: ${res.message}. Redirected to home page`)
        return { name: 'home' }
      }
    }
    //console.log(`router.beforeEach returned ${JSON.stringify(res, null, 2)}`);
    inTransition.value = false
    return true
  }

  function authorize(path: string) {
    //has to be here to prevent circular reference
    const { authenticated, accessibility } = storeToRefs(useAuthStore())
    if (path === '/auth/login' || path === '/') {
      return true
    }
    return !(accessibility.value.authenticatedUsersOnly && !authenticated.value)
  }

  function finalizeRouting(
    handle_to: RouteLocationNormalized,
    handle_from: RouteLocationNormalized,
  ) {
    current.value.name = <TPageName>handle_to.name
    current.value.module = to.value.module
    current.value.url_module = to.value.url_module
    current.value.queryParams = ['index', 'show'].includes(current.value.name)
      ? handle_to.query
      : undefined
    current.value.url_full_path = handle_to.fullPath
    current.value.preLoginFullPath = to.value.name === 'login' ? handle_from.fullPath : undefined

    switch (handle_to.name) {
      case 'show':
      case 'update':
      case 'media':
      case 'tag':
        current.value.slug = <string>handle_to.params.slug
        break
      default:
        current.value.slug = undefined
    }

    //console.log(`finalizing routing. current: ${JSON.stringify(current.value)}`)
    //current.value = Object.assign(to.value);
    //current.value = JSON.parse(JSON.stringify(to.value))
  }

  async function pushHome(message = '') {
    console.log(`goHome`)
    inTransition.value = false
    if (message !== '') {
      showSnackbar(message)
    }
    await router.push('home')
  }

  async function routerPush(
    routeName: string,
    slug: string = 'none',
    module: TModule | 'current' = 'current',
    keepQuery: boolean = true,
  ) {
    let urlModule,
      query = null
    switch (routeName) {
      case 'back1':
        router.go(-1)
        break

      case 'home':
      case 'dashboard':
        await router.push({ name: routeName })
        break

      case 'login':
      case 'register':
      case 'forgot-password':
      case 'reset-password':
        await router.push({ name: routeName })
        break

      case 'welcome':
      case 'filter':
      case 'create':
        urlModule =
          module === 'current' ? current.value.url_module : moduleToUrlModuleName.value[module]
        await router.push({ name: routeName, params: { url_module: urlModule } })
        break

      case 'index':
        urlModule =
          module === 'current' ? current.value.url_module : moduleToUrlModuleName.value[module]
        query = keepQuery ? current.value.queryParams : ''
        await router.push({
          name: 'index',
          params: { url_module: urlModule },
          query: <LocationQueryRaw>query,
        })
        break

      case 'show':
        urlModule =
          module === 'current' ? current.value.url_module : moduleToUrlModuleName.value[module]
        query = keepQuery ? current.value.queryParams : ''
        await router.push({
          name: 'show',
          params: { url_module: urlModule, slug: slug },
          query: <LocationQueryRaw>query,
        })
        break

      case 'update':
      case 'media':
      case 'tag':
        await router.push({
          name: routeName,
          params: { url_module: current.value.url_module, slug: slug },
        })
        break
    }
  }

  async function moveToRelatedItem(module: TModule, id: string) {
    const { setIndexByElement, getElement } = useElementAndCollectionStore()
    const { filterClearOptions } = useTrioStore()
    const { tagAndSlugFromId } = useModuleStore()

    const tas = tagAndSlugFromId(id, module)

    if (current.value.module !== module) {
      return await routerPush('show', tas.slug, module, false)
    }

    setIndexByElement('Show', 'main', id)
    if (getElement('Show') !== undefined) {
      console.log(`moveToRelated "${module} ${tas.slug}" - IN collection`)
      return await routerPush('show', tas.slug, module)
    } else {
      console.log(
        `moveToRelated "${module} ${tas.slug}" - NOT in collection: Filters cleared and result set reloaded`,
      )
      filterClearOptions()
      await routerPush('show', tas.slug, module, false)
      showSnackbar(`Filters removed and result set reloaded`)
    }
  }
  return {
    inTransition,
    current,
    to,
    handleRouteChange,
    routerPush,
    pushHome,
    moveToRelatedItem,
  }
})
