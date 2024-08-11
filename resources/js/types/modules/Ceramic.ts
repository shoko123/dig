import type { TModuleInfo } from '@/js/types/moduleTypes'

type TCeramic<T extends TModuleInfo> = {
  url_name: 'ceramics'
  fields: {
    id: string
    name: string
    area: string
  }
  CV: Pick<TCeramic<T>['fields'], 'id' | 'area'>
  TabularViewFields: TCeramic<T>['fields']
}

export { TCeramic }
