<template>
  <v-container fluid class="pa-1 ma-0">
    <v-row wrap no-gutters>
      <v-text-field v-model="nf.id" label="Name" :error-messages="nameErrors" class="mr-1" filled />
      <v-select v-model="nf.specialist_description" label="Specialist Description" :items="areas" />
      <v-text-field v-model="nf.id" label="Square" :error-messages="squareErrors" class="mr-1" filled />
      <v-text-field v-model="nf.id" label="stratum" :error-messages="stratumErrors" class="mr-1" filled />
    </v-row>
    <v-row v-if="currentItemFields"></v-row>
    <slot :id="nf.id" name="newFields" :v="v" :new-fields="nf" />
  </v-container>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import type { TFields } from '@/types/moduleTypes'
import { useVuelidate } from '@vuelidate/core'

import { useItemStore } from '../../../scripts/stores/item'
import { useItemNewStore } from '../../../scripts/stores/itemNew'
import { useCeramicStore } from '../../../scripts/stores/modules/Ceramic'


const { fields } = storeToRefs(useItemStore())
const { rules } = storeToRefs(useCeramicStore())
let { newFields, itemNewFieldsToOptionsObj } = storeToRefs(useItemNewStore())

const nf = computed(() => {
  return newFields.value as TFields<'Ceramic'>
})





const currentItemFields = computed(() => {
  return fields.value! as TFields<'Ceramic'>
})

const v = useVuelidate(rules, newFields.value as TFields<'Ceramic'>)

const nameErrors = computed(() => {
  return <string>(v.value.name.$error ? v.value.name.$errors[0].$message : undefined)
})

const squareErrors = computed(() => {
  return <string>(v.value.square.$error ? v.value.square.$errors[0].$message : undefined)
})

const stratumErrors = computed(() => {
  return <string>(v.value.stratum.$error ? v.value.stratum.$errors[0].$message : undefined)
})

const areas = computed(() => {
  return itemNewFieldsToOptionsObj.value['area']
})
</script>
