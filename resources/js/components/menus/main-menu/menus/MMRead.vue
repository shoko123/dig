<template>
  <div class="hidden-sm-and-down">
    <v-btn icon="mdi-home-circle" :to="{ name: 'home' }" rounded="0" />
  </div>
  <v-divider inset vertical />
  <v-btn>{{ title }}</v-btn>
  <v-divider inset vertical />
  <div class="hidden-sm-and-down">
    <v-btn :disabled="disableLinks" :to="{ name: 'welcome', params: { module: 'loci' } }">
      Loci
    </v-btn>
    <v-btn :disabled="disableLinks" :to="{ name: 'welcome', params: { module: 'stones' } }">
      Stones
    </v-btn>
  </div>
  <v-spacer />
  <LoginOrUser />
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useMenusStore } from '../../../../scripts/stores/menus'
import { useAuthStore } from '../../../../scripts/stores/auth'
import LoginOrUser from '../elements/LoginOrUser.vue'

const { authenticated, accessibility } = storeToRefs(useAuthStore())
const { title } = storeToRefs(useMenusStore())

const disableLinks = computed(() => {
  return accessibility.value.authenticatedUsersOnly && !authenticated.value
})
</script>
