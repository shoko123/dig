<template>
  <v-btn :disabled="inTransition" icon="mdi-arrow-left" color="blue-lighten-4" large rounded="0" variant="flat"
    @click="next(false)" />
  <v-btn color="blue-lighten-2" large rounded="0" variant="flat" class="text-none">
    {{ tag }}
  </v-btn>
  <v-btn :disabled="inTransition" icon="mdi-arrow-right" color="blue-lighten-4" large rounded="0" variant="flat"
    @click="next(true)" />
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoutesMainStore } from '../../../../scripts/stores/routes/routesMain'
import { useCollectionsStore } from '../../../../scripts/stores/collections/collections'
import { useItemStore } from '../../../../scripts/stores/item'

const { nextSlug } = useItemStore()
const { derived, itemIndex } = storeToRefs(useItemStore())
const { routerPush } = useRoutesMainStore()
const { inTransition } = storeToRefs(useRoutesMainStore())
const { getCollectionStore } = useCollectionsStore()
const mcs = getCollectionStore('main')
const tag = computed(() => {
  return derived.value.tag ? `${derived.value.tag} (${itemIndex.value + 1}/${mcs.array.length})` : `...`
})

function next(isRight: boolean) {
  routerPush('show', nextSlug(isRight))
}
</script>
