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
      <!-- <v-text-field v-model="nf.id" label="Name" :error-messages="errors.id" class="mr-1" readonly filled /> -->
      <!-- <v-select v-model="nf.specialist_description" label="Specialist Description" :items="areas" /> -->
      <v-text-field v-model="nf.id_year" label="Year" :error-messages="errors.id_year" class="mr-1" filled />
      <v-text-field v-model="nf.id_object_no" label="Object No." :error-messages="errors.id_object_no" class="mr-1"
        filled />
    </v-row>

    <v-row wrap no-gutters>

      <v-textarea v-model="nf.field_description" label="Field Description" :error-messages="errors.field_description"
        class="mr-1" filled />

      <v-textarea v-model="nf.specialist_description" label="Specialist Description"
        :error-messages="errors.specialist_description" class="mr-1" filled />
      <v-textarea v-model="nf.notes" label="Notes" :error-messages="errors.notes" class="mr-1" filled />

    </v-row>
    <!-- <v-row v-if="currentItemFields"></v-row> -->
    <slot :id="nf.id" name="newItem" :v="v$" :new-fields="nf" />
  </v-container>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import type { TFields, TFieldsErrors } from '@/types/moduleTypes'
import { useVuelidate } from '@vuelidate/core'

// import { useItemStore } from '../../../scripts/stores/item'
import { useItemNewStore } from '../../../scripts/stores/itemNew'
import { useCeramicStore } from '../../../scripts/stores/modules/Ceramic'
import IdSelector from '../../form-elements/IdSelector.vue'
import CeramicIdSelector from './CeramicIdSelector.vue'

const props = defineProps<{
  isCreate: boolean
}>()

// const { fields } = storeToRefs(useItemStore())
const { rulesObj } = storeToRefs(useCeramicStore())
let { newFields } = storeToRefs(useItemNewStore())
const v$ = useVuelidate(rulesObj.value, newFields.value, { $autoDirty: true })

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



// const currentItemFields = computed(() => {
//   return fields.value! as TFields<'Ceramic'>
// })

</script>
