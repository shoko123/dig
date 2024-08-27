<template>
  <v-container fluid>
    <v-card class="elevation-12">
      <v-card-title class="bg-grey text-black py-0 mb-4">
        {{ title }}
      </v-card-title>
      <v-card-text>
        <component :is="formNew" :is-create="isCreate">
          <template #newItem="{ v }">
            <v-btn variant="outlined" @click="submit(v)"> Submit </v-btn>
            <v-btn variant="outlined" class="ml-1" @click="cancel"> Cancel </v-btn>
          </template>
        </component>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts" setup>
import { computed, type Component } from 'vue'
import { storeToRefs } from 'pinia'
import { type Validation } from '@vuelidate/core'

import { useRoutesMainStore } from '../../scripts/stores/routes/routesMain'
import { useItemNewStore } from '../../scripts/stores/itemNew'
import { useModuleStore } from '../../scripts/stores/module'
import { useNotificationsStore } from '../../scripts/stores/notifications'

import StoneNew from '../modules/Stone/StoneNew.vue'
import CeramicNew from '../modules/Ceramic/CeramicNew.vue'

let { showSpinner, showSnackbar } = useNotificationsStore()
let { upload } = useItemNewStore()
let { beforeStore } = useModuleStore()
const { module } = storeToRefs(useModuleStore())
let { routerPush } = useRoutesMainStore()
let { current } = storeToRefs(useRoutesMainStore())

const isCreate = computed(() => {
  return current.value.name === 'create'
})

const title = computed(() => {
  return isCreate.value ? 'Create' : 'Update'
})

const formNew = computed<Component>(() => {
  switch (module.value) {
    case 'Ceramic':
      return CeramicNew
    case 'Stone':
      return StoneNew
    default:
      console.log(`Update.vue invalid module ${module.value}`)
      return CeramicNew
  }
})

async function submit(v: Validation) {
  //console.log(`CreateUpdate.submit() data: ${JSON.stringify(data, null, 2)}`)

  // vuelidate validation
  await v.$validate()

  if (v.$error || v.$silentErrors.length > 0) {
    showSnackbar('Please correct the marked errors!', 'orange')
    console.log(`validation errors: ${JSON.stringify(v.$errors, null, 2)}`)
    console.log(`validation silent errors: ${JSON.stringify(v.$silentErrors, null, 2)}`)
    return
  }

  // let newReq = child.value!.beforeStore()
  //alert("Form Successfully Submitted!")
  let fieldsToSend = beforeStore(isCreate.value)

  if (fieldsToSend === false) {
    alert(`problem with data`)
    return
  }

  showSpinner(`${isCreate.value ? 'Creating' : 'Updating'} ${module.value} item...`)
  const res = await upload(isCreate.value, fieldsToSend)
  showSpinner(false)

  if (!res.success) {
    showSnackbar(`Failed current ${isCreate.value ? 'create' : 'update'} item. ${res.message}`, 'red')
    return
  }

  showSnackbar(
    `${module.value} item ${isCreate.value ? 'created' : 'updated'} successfully!`,
  )
  console.log(`CreateUpdate. success! res: ${JSON.stringify(res, null, 2)}`)

  routerPush('show', res.slug)
}

const cancel = () => {
  console.log(`CreateUpdateForm.cancel()`)
  routerPush('back1')
}
</script>
