<template>
  <v-btn :disabled="disableShowUploaderButton" variant="outlined" @click="showUpldr">
    Upload files
  </v-btn>
  <v-btn variant="outlined" @click="back">
    {{ backText }}
  </v-btn>
  <v-btn v-if="orderChanged" variant="outlined" @click="reorderAndBack"> Save Order & back </v-btn>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoutesMainStore } from '../../../../scripts/stores/routes/routesMain'
import { useMediaStore } from '../../../../scripts/stores/media'
import { useItemStore } from '../../../../scripts/stores/item'
import { useNotificationsStore } from '../../../../scripts/stores/notifications'

const { routerPush } = useRoutesMainStore()
const { derived } = storeToRefs(useItemStore())
const { showUploader, orderChanged } = storeToRefs(useMediaStore())
const { clear, mediaReorder } = useMediaStore()
const { showSpinner, showSnackbar } = useNotificationsStore()

const disableShowUploaderButton = computed(() => {
  return showUploader.value
})

const backText = computed(() => {
  return orderChanged.value ? 'Back without saving order' : 'back'
})

function showUpldr() {
  showUploader.value = true
}

async function reorderAndBack() {
  console.log('Reorder')
  showSpinner('Reordering media...')
  let res = await mediaReorder()
  showSpinner(false)
  if (res.success)
    showSnackbar(res.success ? `Reorder completed successfully` : `Reorde failed. ${res.message}`)
  clear()
  await routerPush('show', <string>derived.value.slug)
}
async function back() {
  clear()
  await routerPush('show', <string>derived.value.slug)
}
</script>
