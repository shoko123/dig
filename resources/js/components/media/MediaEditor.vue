<template>
  <MediaUploader v-if="showUploader" />
  <v-container fluid class="pa-1">
    <CollectionForm v-bind="{ source: 'media' }" />
  </v-container>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import CollectionForm from '../collections/CollectionForm.vue'
import { useCollectionMediaStore } from '../../scripts/stores/collections/collectionMedia'
import { useMediaStore } from '../../scripts/stores/media'
import MediaUploader from './MediaUploader.vue'

onMounted(() => {
  let { array } = storeToRefs(useCollectionMediaStore())
  if (array.value.length === 0) {
    showUploader.value = true
  }
})

let { showUploader } = storeToRefs(useMediaStore())
</script>
