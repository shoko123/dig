<template>
  <v-list-item :to="{ name: 'home' }"> Home </v-list-item>
  <v-divider />
  <v-list-item :disabled="disableLinks" :to="{ name: 'welcome', params: { module: 'loci' } }">
    Loci
  </v-list-item>
  <v-list-item :disabled="disableLinks" :to="{ name: 'welcome', params: { module: 'stones' } }">
    Stones
  </v-list-item>
  <v-divider />
  <div v-if="!authenticated">
    <v-list-item :to="{ name: 'login' }"> Login </v-list-item>
  </div>
  <div v-else>
    <v-list-item @click="logoutClicked"> Logout </v-list-item>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../../../../scripts/stores/auth'
import { useNotificationsStore } from '../../../../scripts/stores/notifications'
const { authenticated, accessibility } = storeToRefs(useAuthStore())
const { logout } = useAuthStore()
const { showSnackbar } = useNotificationsStore()

async function logoutClicked() {
  const res = await logout()
  showSnackbar(res.success ? 'You have successfully logged out.' : 'Logout Failed!')
}

const disableLinks = computed(() => {
  return accessibility.value.authenticatedUsersOnly && !authenticated.value
})
</script>
