<template>
  <v-card dense>
    <v-toolbar :height="35">
      <v-toolbar-title> {{ parts?.header }}</v-toolbar-title>
    </v-toolbar>
    <v-card-text class="pa-12 pb-8">
      <slot name="form">
        <component :is="parts?.form" />
      </slot>
    </v-card-text>
  </v-card>
  <v-dialog v-model="dialog.open" persistent width="500">
    <v-card>
      <v-card-text>
        {{ dialog.message }}
      </v-card-text>
      <v-card-actions>
        <component :is="parts?.dialogForm" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../../scripts/stores/auth'
import { useRoutesMainStore } from '../../scripts/stores/routes/routesMain'
import LoginForm from './LoginForm.vue'
import LoginDialog from './LoginDialog.vue'
import RegistrationForm from './RegistrationForm.vue'
import RegistrationDialog from './RegistrationDialog.vue'
import ForgotPasswordForm from './ForgotPasswordForm.vue'
import ForgotPasswordDialog from './ForgotPasswordDialog.vue'
import ResetPasswordForm from './ResetPasswordForm.vue'
import ResetPasswordDialog from './ResetPasswordDialog.vue'

const { resetAndGoTo } = useAuthStore()
const { dialog } = storeToRefs(useAuthStore())
const { current } = storeToRefs(useRoutesMainStore())

onMounted(() => {
  resetAndGoTo()
})

const parts = computed(() => {
  switch (current.value.name) {
    case 'login':
      return { form: LoginForm, header: `User Login Form`, dialogForm: LoginDialog }

    case 'register':
      return {
        form: RegistrationForm,
        header: `User Registration Form`,
        dialogForm: RegistrationDialog,
      }

    case 'forgot-password':
      return {
        form: ForgotPasswordForm,
        header: `Forgot Password Form`,
        dialogForm: ForgotPasswordDialog,
      }

    case 'reset-password':
      return {
        form: ResetPasswordForm,
        header: `Reset Password Form`,
        dialogForm: ResetPasswordDialog,
      }

    default:
      return null
  }
})
</script>
