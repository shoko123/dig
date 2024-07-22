<!-- App.vue -->
<template>
  <v-app>
    <SnackBar />
    <LoadingSpinner />
    <MenusBoth />
    <v-main>
      <router-view />
    </v-main>
    <v-footer />
  </v-app>
  <ModalCarousel />
</template>

<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import MenusBoth from './menus/MenusBoth.vue'
import SnackBar from './notifications/SnackBar.vue'
import LoadingSpinner from './notifications/loadingSpinner.vue'
import ModalCarousel from './modals/ModalCarousel.vue'
import { useAuthStore } from '../scripts/stores/auth'

const { logout } = useAuthStore()
onBeforeUnmount(() => {
  logout()
})
</script>
