<template>
  <v-container fluid class="pa-1 ma-0">
    <v-row wrap no-gutters>
      <template v-if="props.isCreate">
        <id-selector>
          <template #specific-id-selctor>
            <StoneIdSelector></StoneIdSelector>
          </template>
        </id-selector>
      </template>
      <template v-else>
        <v-text-field v-model="nf.id" label="Label" class="mr-1" filled disabled />
      </template>

      <v-text-field v-model="nf.square" label="Square" :error-messages="errors.square" class="mx-1" filled
        :disabled="inOC" />
      <v-text-field v-model="nf.context" label="Context" :error-messages="errors.context" class="mr-1" filled
        :disabled="inOC" />
      <v-text-field v-model="nf.occupation_level" label="Occupation Level" :error-messages="errors.occupation_level"
        class="mr-1" filled :disabled="inOC" />
      <v-text-field v-model="nf.excavation_object_id" label="Excavation Object Id"
        :error-messages="errors.excavation_object_id" class="mr-1" filled :disabled="inOC" />
      <v-text-field v-model="nf.old_museum_id" label="Old Museum Id" class="mr-1" filled :disabled="inOC" />
    </v-row>

    <v-row wrap no-gutters>
      <v-select v-model="nf.cataloger_id" label="Select" item-title="text" item-value="extra"
        :items="catalogerInfo.options"></v-select>

      <v-select v-model="nf.material_id" label="Select" item-title="text" item-value="extra"
        :items="materialInfo.options"></v-select>

      <v-select v-model="nf.base_type_id" label="Select" item-title="text" item-value="extra"
        :items="typologyInfo.options"></v-select>
    </v-row>

    <v-row wrap no-gutters>
      <v-textarea v-model="nf.cataloger_description" label="Cataloger Description"
        :error-messages="errors.cataloger_description" class="mr-1" filled :disabled="inOC" />
      <v-textarea v-model="nf.conservation_notes" label="Conservation Notes" :error-messages="errors.conservation_notes"
        class="mr-1" filled :disabled="inOC" />
      <v-textarea v-model="nf.dimension_notes" label="Dimension Notes" :error-messages="errors.dimension_notes"
        class="mr-1" filled :disabled="inOC" />
    </v-row>

    <v-row wrap no-gutters>
      <v-text-field v-model="nf.weight" label="Weight" :error-messages="errors.weight" class="mr-1" filled
        :disabled="inOC" />
      <v-text-field v-model="nf.length" label="Length" :error-messages="errors.length" class="mr-1" filled
        :disabled="inOC" />
      <v-text-field v-model="nf.width" label="Width" :error-messages="errors.width" class="mr-1" filled
        :disabled="inOC" />
      <v-text-field v-model="nf.diameter" label="Diameter" :error-messages="errors.diameter" class="mr-1" filled
        :disabled="inOC" />
    </v-row>

    <v-row wrap no-gutters>
      <v-text-field v-model="nf.cultural_period" label="Cataloger Assumed Period"
        :error-messages="errors.cultural_period" class="mr-1" filled :disabled="inOC" />
      <v-date-input v-model="nf.excavation_date" label="Excavation Date" :error-messages="errors.excavation_date"
        clearable :disabled="inOC" max-width="368" @click:clear="clearDate('Excavation')"></v-date-input>
      <template v-if="inOC">
        <!-- <v-text-field v-model="catalogerInfo." label="Cataloger" class="mx-1" filled :disabled="inOC" /> -->
        <v-date-input v-model="nf.catalog_date" label="Catalog Date" clearable :disabled="inOC" max-width="368"
          @click:clear="clearDate('Catalog')"></v-date-input>
      </template>
    </v-row>
    <v-row wrap no-gutters>
      <v-textarea v-model="nf.specialist_description" label="Specialist Description"
        :error-messages="errors.specialist_description" class="mr-1" filled />
    </v-row>
    <slot :id="nf.id" name="newItem" :v="v$" :new-fields="nf" />
  </v-container>
</template>

<script lang="ts" setup>
import { TFields, TFieldsErrors, TFieldInfo, TFieldsDefaultsAndRules } from '@/types/moduleTypes'
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useVuelidate } from '@vuelidate/core'
import { required, between, maxLength } from '@vuelidate/validators'
import { VDateInput } from 'vuetify/labs/VDateInput'
import { useItemStore } from '../../../scripts/stores/item'
import { useItemNewStore } from '../../../scripts/stores/itemNew'
import IdSelector from '../../form-elements/IdSelector.vue'
import StoneIdSelector from './StoneIdSelector.vue'

const props = defineProps<{
  isCreate: boolean
}>()

const defaultsAndRules: TFieldsDefaultsAndRules<'Stone'> = {
  id: { d: '', r: { required, maxLength: maxLength(20) } },
  id_year: { d: 1, r: { required, between: between(1, 999) } },
  id_access_no: { d: 1, r: { required, between: between(1, 999) } },
  id_object_no: { d: 1, r: { between: between(1, 999) } },
  square: { d: '', r: { maxLength: maxLength(50) } },
  context: { d: '', r: { maxLength: maxLength(50) } },
  excavation_date: { d: null, r: {} },
  occupation_level: { d: '', r: { maxLength: maxLength(10) } },
  cataloger_material: { d: '', r: { maxLength: maxLength(50) } },
  whole: { d: false, r: {} },
  cataloger_typology: { d: '', r: { maxLength: maxLength(50) } },
  cataloger_description: { d: '', r: { maxLength: maxLength(350) } },
  conservation_notes: { d: '', r: { maxLength: maxLength(250) } },
  weight: { d: '', r: { maxLength: maxLength(50) } },
  length: { d: '', r: { maxLength: maxLength(50) } },
  width: { d: '', r: { maxLength: maxLength(50) } },
  height: { d: '', r: { maxLength: maxLength(50) } },
  diameter: { d: '', r: { maxLength: maxLength(50) } },
  dimension_notes: { d: '', r: { maxLength: maxLength(250) } },
  cultural_period: { d: '', r: { maxLength: maxLength(50) } },
  excavation_object_id: { d: '', r: { maxLength: maxLength(50) } },
  old_museum_id: { d: '', r: { maxLength: maxLength(50) } },
  cataloger_id: { d: 1, r: { between: between(1, 2559) } },
  catalog_date: { d: null, r: {} },
  specialist_description: { d: '', r: { maxLength: maxLength(250) } },
  specialist_date: { d: null, r: {} },
  thumbnail: { d: '', r: { maxLength: maxLength(150) } },
  uri: { d: '', r: { maxLength: maxLength(100) } },
  base_type_id: { d: 1, r: { between: between(1, 255) } },
  material_id: { d: 1, r: { between: between(1, 255) } },
}

const defaultsObj = computed(() => {
  return Object.fromEntries(Object.entries(defaultsAndRules).map(([k, v]) => [k, v.d]))
})

const rulesObj = computed(() => {
  return Object.fromEntries(Object.entries(defaultsAndRules).map(([k, v]) => [k, v.r]))
})

const { fields } = storeToRefs(useItemStore())
const { newFields, openIdSelectorModal, fieldsWithOptions } = storeToRefs(useItemNewStore())

// setup
let newStone: Partial<TFields<'Ceramic'>> = {}
if (props.isCreate) {
  newStone = { ...defaultsObj.value }
  openIdSelectorModal.value = true
} else {
  newStone = { ...fields.value }
}
newFields.value = { ...newStone }

console.log(
  `Ceramic(${props.isCreate ? 'Create' : 'Update'}) fields: ${JSON.stringify(fields.value, null, 2)}`,
)

const v$ = useVuelidate(rulesObj.value, newFields.value as TFields<'Ceramic'>, { $autoDirty: true })

const nf = computed(() => {
  return newFields.value as TFields<'Stone'>
})

const stoneFieldsWithOptions = computed(() => {
  return fieldsWithOptions.value as Partial<Record<keyof TFields<'Stone'>, TFieldInfo>> //TFields<'Ceramic'>
})

const inOC = computed(() => {//in open context
  return typeof nf.value.uri === 'string' && nf.value.uri.length > 0
})

const errors = computed(() => {
  let errorObj: Partial<TFieldsErrors<'Stone'>> = {}
  for (const key in newFields.value) {
    const message = v$.value[key].$errors.length > 0 ? v$.value[key].$errors[0].$message : undefined
    errorObj[key as keyof TFieldsErrors<'Stone'>] = message
  }
  return errorObj
})

const catalogerInfo = computed(() => {
  return stoneFieldsWithOptions.value['cataloger_id']!
})

const materialInfo = computed(() => {
  return stoneFieldsWithOptions.value['material_id']!
})

const typologyInfo = computed(() => {
  return stoneFieldsWithOptions.value['base_type_id']!
})

function clearDate(field: string) {
  switch (field) {
    case 'Excavation':
      nf.value.excavation_date = null
      break

    case 'Catalog':
      nf.value.catalog_date = null
      break

    case 'Specialist':
      nf.value.specialist_date = null
      break
    default:
  }
}
</script>
