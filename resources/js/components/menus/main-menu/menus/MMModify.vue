<template>
  <div class="ml-4 font-weight-bold">{{ title }}</div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useMainStore } from '../../../../scripts/stores/main'
import { useItemStore } from '../../../../scripts/stores/item'
import { useRoutesMainStore } from '../../../../scripts/stores/routes/routesMain'

const { current } = storeToRefs(useRoutesMainStore())
const { tag } = storeToRefs(useItemStore())
const { appName } = storeToRefs(useMainStore())

const modifyText = computed(() => {
  switch (current.value.name) {
    case 'create':
      return `Create a new ${current.value.module} item`

    case 'update':
      return `Update item "${current.value.module} ${tag.value}"`

    case 'media':
      return `Manipulate media of item "${current.value.module} ${tag.value}"`

    case 'tag':
      return `Edit tags of item "${current.value.module} ${tag.value}"`

    default:
      return ``
  }
})

const title = computed(() => {
  return `${appName.value}: ${modifyText.value}`
})
</script>
