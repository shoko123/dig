<template>
  <v-btn v-if="isAllowed('update')" icon size="small" @click="itemUpdate()">
    <v-icon>mdi-pencil</v-icon>
    <v-tooltip activator="parent" location="bottom"> Edit {{ module }} Entry </v-tooltip>
  </v-btn>

  <v-btn v-if="isAllowed('media')" icon size="small" @click="goToMedia()">
    <v-icon>mdi-camera</v-icon>
    <v-tooltip activator="parent" location="bottom"> Manage {{ module }} media </v-tooltip>
  </v-btn>

  <v-btn v-if="isAllowed('tag')" icon size="small" @click="goToTagger()">
    <v-icon>mdi-tag</v-icon>
    <v-tooltip activator="parent" location="bottom"> Manage {{ module }} tags </v-tooltip>
  </v-btn>

  <v-btn v-if="isAllowed('delete')" icon size="small" @click="itemDelete()">
    <v-icon>mdi-delete</v-icon>
    <v-tooltip activator="parent" location="bottom"> Delete {{ module }} </v-tooltip>
  </v-btn>

  <v-btn v-if="isAllowed('create')" icon size="small" @click="itemCreate()">
    <v-icon>mdi-note-plus-outline</v-icon>
    <v-tooltip activator="parent" location="bottom"> Create a new {{ module }} item </v-tooltip>
  </v-btn>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { useAuthStore } from '../../../../scripts/stores/auth'
import { useRoutesMainStore } from '../../../../scripts/stores/routes/routesMain'
import { useItemStore } from '../../../../scripts/stores/item'
import { useCollectionMediaStore } from '../../../../scripts/stores/collections/collectionMedia'
import { useTaggerStore } from '../../../../scripts/stores/trio/tagger'
import { useNotificationsStore } from '../../../../scripts/stores/notifications'

const { routerPush } = useRoutesMainStore()
const { current } = storeToRefs(useRoutesMainStore())
const { permissions } = storeToRefs(useAuthStore())
const { array } = storeToRefs(useCollectionMediaStore())
const { derived } = storeToRefs(useItemStore())
const { itemRemove } = useItemStore()
const { showSpinner, showSnackbar } = useNotificationsStore()

const module = computed(() => {
  return current.value.module
})

function isAllowed(action: string) {
  const term = current.value.module + '-' + action
  return permissions.value.includes(term)
}

function itemCreate() {
  console.log(`itemCreate`)
  routerPush('create')
}

function itemUpdate() {
  console.log(`itemUpdate`)
  routerPush('update', <string>derived.value.slug)
}

function goToMedia() {
  console.log(`goToMedia`)
  routerPush('media', <string>derived.value.slug)
}

function goToTagger() {
  console.log(`goToTagger`)
  const { prepareTagger } = useTaggerStore()
  prepareTagger()
  routerPush('tag', <string>derived.value.slug)
}

async function itemDelete() {
  if (array.value.length > 0) {
    alert(`Delete aborted. Please delete related media!`)
    return
  }

  if (!confirm('Are you sure you want to delete this item?')) {
    return
  }

  showSpinner('Deleting item...')
  let res = await itemRemove()
  showSpinner(false)

  if (!res.success) {
    showSnackbar(`Failed to delete item. ${res.message}`, 'red')
    return
  }

  if (res.slug === null) {
    showSnackbar('Item deleted successfully. Redirected to Welcome page')
    routerPush('welcome', 'none')
  } else {
    showSnackbar('Item deleted successfully.')
    routerPush('show', res.slug)
  }
}
</script>
