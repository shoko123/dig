import type { TModuleInfo } from '@/types/moduleTypes'

type TCeramic<T extends TModuleInfo> = {
  url_name: 'ceramics'
  fields: {
    id: string
    id_year: number
    id_object_no: number
    field_description: string
    specialist_description: string
    base_type_id: number
  }
  FD: Pick<TCeramic<T>['fields'], 'id_object_no' | 'id_year'>
  categorizedFields: Pick<TCeramic<T>['FD'], never>
  TabularViewFields: Pick<
    TCeramic<T>['fields'],
    'id' | 'field_description' | 'specialist_description' | 'base_type_id'
  >
}

export { TCeramic }
