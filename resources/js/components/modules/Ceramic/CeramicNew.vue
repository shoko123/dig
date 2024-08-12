<template>
  <v-container fluid class="pa-1 ma-0">
    <v-row wrap no-gutters>
      <v-text-field v-model="newFields.id" label="Name" :error-messages="nameErrors" class="mr-1" filled />
      <v-select v-model="newFields.specialist_description" label="Specialist Description" :items="areas" />
      <v-text-field v-model="newFields.id" label="Square" :error-messages="squareErrors" class="mr-1" filled />
      <v-text-field v-model="newFields.id" label="stratum" :error-messages="stratumErrors" class="mr-1" filled />
    </v-row>
    <v-row v-if="currentItemFields"></v-row>
    <slot :id="newFields.id" name="newFields" :v="v" :new-fields="newFields" />
  </v-container>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import type { TFieldsByModule } from '@/js/types/moduleTypes'
import { useVuelidate } from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import { useItemStore } from '../../../scripts/stores/item'
import { useCeramicStore } from '../../../scripts/stores/modules/Ceramic'
import { useTrioStore } from '../../../scripts/stores/trio/trio'


const { fields } = storeToRefs(useItemStore())
const { newFields } = storeToRefs(useCeramicStore())
const { trio, groupLabelToKey } = storeToRefs(useTrioStore())

const areas = computed(() => {
  let paramKeys = trio.value.groupsObj[groupLabelToKey.value['Area']].paramKeys
  return paramKeys.map((x) => trio.value.paramsObj[x].text)
})

const rules = computed(() => {
  return {
    id: {},
    id_year: { required },
    id_object_no: { required }, //from select list
  }
})

const currentItemFields = computed(() => {
  return fields.value! as TFieldsByModule<'Ceramic'>
})

const v = useVuelidate(rules, newFields.value as TFieldsByModule<'Ceramic'>)

const nameErrors = computed(() => {
  return <string>(v.value.name.$error ? v.value.name.$errors[0].$message : undefined)
})

const squareErrors = computed(() => {
  return <string>(v.value.square.$error ? v.value.square.$errors[0].$message : undefined)
})

const stratumErrors = computed(() => {
  return <string>(v.value.stratum.$error ? v.value.stratum.$errors[0].$message : undefined)
})
</script>
