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

function toCollection() {
  routerPush('index')
}

async function toItem() {
  routerPush('show', firstSlug.value)
}

function toFilter() {
  routerPush('filter')
}
</script>
