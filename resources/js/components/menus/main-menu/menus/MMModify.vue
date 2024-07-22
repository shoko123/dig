<template>
  <v-btn>{{ title }}</v-btn>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useMenusStore } from '../../../../scripts/stores/menus'

const { title } = storeToRefs(useMenusStore())
</script>
