<template>
  <div class="hidden-sm-and-down">
    <v-btn icon="mdi-home-circle" :to="{ name: 'home' }" rounded="0" />
  </div>

  <v-divider inset vertical />

  <div v-for="(item, index) in moduleBtnsInfo" :key='index' class="hidden-sm-and-down">
    <v-btn :disabled="disableLinks" :class="selectedModuleIndex === index ? 'bg-light-blue-darken-2' : ''"
      :to="{ name: 'welcome', params: { url_module: item.url_module } }">
      {{ item.title }}
    </v-btn>
  </div>

  <v-spacer />

  <LoginOrUser />
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../../../../scripts/stores/auth'
import { useModuleStore } from '../../../../scripts/stores/module'
import { useRoutesMainStore } from '../../../../scripts/stores/routes/routesMain'
import LoginOrUser from '../elements/LoginOrUser.vue'

const { authenticated, accessibility } = storeToRefs(useAuthStore())
const { current } = storeToRefs(useRoutesMainStore())
const { moduleBtnsInfo } = storeToRefs(useModuleStore())

const disableLinks = computed(() => {
  return accessibility.value.authenticatedUsersOnly && !authenticated.value
})

const selectedModuleIndex = computed(() => {
  return moduleBtnsInfo.value.findIndex(x => current.value.module === x.module)
})
</script>
