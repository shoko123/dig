<template>
  <v-list-item @click="toFilter"> Filter </v-list-item>
  <v-list-item @click="toCollection"> Collection </v-list-item>
  <v-list-item @click="toItem"> Item </v-list-item>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useRoutesMainStore } from '../../../../scripts/stores/routes/routesMain'
import { useModuleStore } from '../../../../scripts/stores/module'

const { routerPush } = useRoutesMainStore()
const { firstSlug } = storeToRefs(useModuleStore())

async function toCollection() {
  await routerPush('index')
}

async function toItem() {
  await routerPush('show', firstSlug.value)
}

async function toFilter() {
  await routerPush('filter')
}
</script>
