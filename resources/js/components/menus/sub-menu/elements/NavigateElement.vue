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
import { useModuleStore } from '../../../../scripts/stores/module'
import { useItemStore } from '../../../../scripts/stores/item'
import { useElementAndCollectionStore } from '../../../../scripts/stores/collections/elementAndCollection'

const { derived, itemIndex } = storeToRefs(useItemStore())
const { routerPush } = useRoutesMainStore()
const { inTransition, current } = storeToRefs(useRoutesMainStore())
const { getCollectionStore } = useCollectionsStore()
const { tagAndSlugFromId } = useModuleStore()
const mcs = getCollectionStore('main')
const tag = computed(() => {
  return derived.value.tag ? `${derived.value.tag} (${itemIndex.value + 1}/${mcs.array.length})` : `...`
})

async function next(isRight: boolean) {
  const { nextArrayElement } = useElementAndCollectionStore()
  const nextItem = nextArrayElement('main', itemIndex.value, isRight)
  const tagAndSlug = tagAndSlugFromId(<string>nextItem.item, current.value.module)
  await routerPush('show', tagAndSlug.slug)
}
</script>
