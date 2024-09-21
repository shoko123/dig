<template>
  <div class="hidden-sm-and-down">
    <v-btn v-if="showLoginButton" class="pa-2 bg-light-blue-darken-2" tonal @click="loginClick()"> Login </v-btn>
    <v-btn v-if="auth.authenticated">
      <v-icon left dark> mdi-account </v-icon>
      {{ auth.user?.name }}
      <v-menu activator="parent">
        <v-list>
          <v-list-item v-for="(item, index) in options" :key="index" :value="index" @click="userOptionsClicked(item)">
            <v-list-item-title>{{ item }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-btn>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useAuthStore } from '../../../../scripts/stores/auth'
import { useRoutesMainStore } from '../../../../scripts/stores/routes/routesMain'
import { useNotificationsStore } from '../../../../scripts/stores/notifications'
import { storeToRefs } from 'pinia'

type TUserOption = 'Dashboard' | 'Logout'

let auth = useAuthStore()
let { routerPush } = useRoutesMainStore()
let { current } = storeToRefs(useRoutesMainStore())
const { showSnackbar } = useNotificationsStore()
let options: TUserOption[] = ['Dashboard', 'Logout']

const showLoginButton = computed(() => {
  return !auth.authenticated && !['login', 'register'].includes(current.value.name)
})

async function loginClick() {
  await routerPush('login')
}

async function userOptionsClicked(item: TUserOption) {
  switch (item) {
    case 'Logout':
      {
        const res = await auth.logout()
        showSnackbar(res.success ? 'You have successfully logged out.' : 'Logout Failed!')
      }
      break
    case 'Dashboard':
      console.log('Dashboard clicked')
      break
  }
}
</script>
