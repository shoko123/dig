<template>
  <v-container fluid>
    <component :is="view" />
  </v-container>
</template>

<script lang="ts" setup>
import type { Component } from 'vue'
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { useModuleStore } from '../../scripts/stores/module'
import ShowMainView from '../item/layouts/ShowMainView.vue'
import ShowMediaView from '../item/layouts/ShowMediaView.vue'
import ShowRelatedView from '../item/layouts/ShowRelatedView.vue'

const { itemView } = storeToRefs(useModuleStore())

const view = computed<Component>(() => {
  switch (itemView.value) {
    case 'Main':
      return ShowMainView
    case 'Media':
      return ShowMediaView
    case 'Related':
      return ShowRelatedView
    default:
      console.log(`Show.vue invalid itemView: "${itemView.value}"`)
      return ShowMainView
  }
})
</script>
