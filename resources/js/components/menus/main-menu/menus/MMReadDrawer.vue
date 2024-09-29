<template>
  <v-list>
    <v-list-item :to="{ name: 'home' }"> Home </v-list-item>

    <v-divider />

    <v-list-item v-for="(item, index) in moduleBtnsInfo" :key="index" :value="index" @click="goTo(item.url_module)">
      <v-list-item-title :disabled="disableLinks" :to="{ name: 'welcome', params: { url_module: item.url_module } }">{{
        item.title }}</v-list-item-title>
    </v-list-item>

    <v-divider />

    <div v-if="!authenticated">
      <v-list-item :to="{ name: 'login' }"> Login </v-list-item>
    </div>
    <div v-else>
      <v-list-item @click="logoutClicked"> Logout </v-list-item>
    </div>
  </v-list>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import type { TUrlModule } from '@/types/moduleTypes'
import { useAuthStore } from '../../../../scripts/stores/auth'
import { useModuleStore } from '../../../../scripts/stores/module'
import { useNotificationsStore } from '../../../../scripts/stores/notifications'

const { authenticated, accessibility } = storeToRefs(useAuthStore())
const { logout } = useAuthStore()
const { showSnackbar } = useNotificationsStore()
const { moduleBtnsInfo } = storeToRefs(useModuleStore())

const router = useRouter()
async function logoutClicked() {
  const res = await logout()
  showSnackbar(res.success ? 'You have successfully logged out.' : 'Logout Failed!')
}
async function goTo(urlModule: TUrlModule) {
  router.push({ name: 'welcome', params: { url_module: urlModule } })
  console.log(`goTo(${urlModule})`)
}
const disableLinks = computed(() => {
  return accessibility.value.authenticatedUsersOnly && !authenticated.value
})
</script>
