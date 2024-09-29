<template>
  <v-container fluid class="pa-1 ma-0">
    <v-row wrap no-gutters>
      <template v-if="props.isCreate">
        <id-selector>
          <template #specific-id-selctor>
            <CeramicIdSelector></CeramicIdSelector>
          </template>
        </id-selector>
      </template>
      <template v-else>
        <v-text-field v-model="nf.id" label="Label" class="mr-1" filled disabled />
      </template>
    </v-row>

    <v-row wrap no-gutters>
      <v-textarea v-model="nf.field_description" label="Field Description" :error-messages="errors.field_description"
        class="mr-1" filled />
      <v-textarea v-model="nf.specialist_description" label="Specialist Description"
        :error-messages="errors.specialist_description" class="mr-1" filled />
      <v-textarea v-model="nf.notes" label="Notes" :error-messages="errors.notes" class="mr-1" filled />
    </v-row>

    <slot :id="nf.id" name="newItem" :v="v$" :new-fields="nf" />
  </v-container>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import type { TFields, TFieldsErrors, TFieldsDefaultsAndRules } from '@/types/moduleTypes'
import { useVuelidate } from '@vuelidate/core'
import { required, between, maxLength } from '@vuelidate/validators'
import { useItemStore } from '../../../scripts/stores/item'
import { useItemNewStore } from '../../../scripts/stores/itemNew'
import IdSelector from '../../form-elements/IdSelector.vue'
import CeramicIdSelector from './CeramicIdSelector.vue'

const props = defineProps<{
  isCreate: boolean
}>()

const defaultsAndRules: TFieldsDefaultsAndRules<'Ceramic'> = {
  id: { d: '', r: { required } },
  id_year: { d: 20, r: { required, between: between(20, 24) } },
  id_object_no: { d: 1, r: { required, between: between(1, 9) } },
  field_description: { d: '', r: { maxLength: maxLength(50) } },
  specialist_description: { d: '4', r: { maxLength: maxLength(50) } },
  notes: { d: '', r: { maxLength: maxLength(50) } },
  base_type_id: { d: 1, r: { required, between: between(1, 9) } },
}

const defaultsObj = computed(() => {
  return Object.fromEntries(Object.entries(defaultsAndRules).map(([k, v]) => [k, v.d]))
})

const rulesObj = computed(() => {
  return Object.fromEntries(Object.entries(defaultsAndRules).map(([k, v]) => [k, v.r]))
})

const { fields } = storeToRefs(useItemStore())
const { newFields, openIdSelectorModal } = storeToRefs(useItemNewStore())

// setup
let newCeramic: Partial<TFields<'Ceramic'>> = {}
if (props.isCreate) {
  newCeramic = { ...defaultsObj.value }
  openIdSelectorModal.value = true
} else {
  newCeramic = { ...fields.value }
}
newFields.value = { ...newCeramic }

console.log(
  `Ceramic(${props.isCreate ? 'Create' : 'Update'}) fields: ${JSON.stringify(fields.value, null, 2)}`,
)

const v$ = useVuelidate(rulesObj.value, newFields.value as TFields<'Ceramic'>, { $autoDirty: true })

const nf = computed(() => {
  return newFields.value as TFields<'Ceramic'>
})

const errors = computed(() => {
  let errorObj: Partial<TFieldsErrors<'Ceramic'>> = {}
  for (const key in newFields.value) {
    const message = v$.value[key].$errors.length > 0 ? v$.value[key].$errors[0].$message : undefined
    errorObj[key as keyof TFieldsErrors<'Ceramic'>] = message
  }
  return errorObj
})

function beforeStore() {
  console.log(`Ceramic.beforeStore()`)
  return newFields.value
}

defineExpose({
  beforeStore
});

</script>
