import type { TModuleInfo } from '@/js/types/moduleTypes'

type TCeramic<T extends TModuleInfo> = {
  url_name: 'ceramic'
  fields: {
    id: string
    name: string
    area: string
  }
  modify: Pick<TCeramic<T>['fields'], 'id' | 'area'>
  lookup: Pick<TCeramic<T>['fields'], 'id'>
  tabular: TCeramic<T>['fields']
}

export { TCeramic }
