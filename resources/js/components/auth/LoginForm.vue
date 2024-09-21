<template>
  <div class="text-subtitle-1 text-medium-emphasis">Email</div>

  <v-text-field v-model="data.email" :error-messages="emailErrors" density="compact" placeholder="Email address"
    prepend-inner-icon="mdi-email-outline" variant="outlined" />

  <div class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
    Password

    <a class="text-caption text-decoration-none text-blue" @click="goTo('forgot-password')">
      Forgot password?</a>
  </div>

  <v-text-field v-model="data.password" :error-messages="passwordErrors"
    :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'" :type="visible ? 'text' : 'password'" density="compact"
    placeholder="Enter your password" prepend-inner-icon="mdi-lock-outline" variant="outlined"
    @click:append-inner="visible = !visible" />

  <v-btn block class="mb-8" color="blue" size="large" variant="tonal" @click="login">
    Log In
  </v-btn>

  <div class="d-flex justify-center">
    <a class="text-blue text-decoration-none" @click="goTo('register')">
      Not Registered?<v-icon icon="mdi-chevron-right" />
    </a>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
import { storeToRefs } from 'pinia'
import type { TPageName } from '@/js/types/routesTypes'
import { useAuthStore } from '../../scripts/stores/auth'
import { useNotificationsStore } from '../../scripts/stores/notifications'
import { useRoutesMainStore } from '../../scripts/stores/routes/routesMain'
import { router } from '../../scripts/setups/vue-router'
import { useVuelidate } from '@vuelidate/core'
import { required, email, minLength, helpers } from '@vuelidate/validators'

const { showSnackbar } = useNotificationsStore()
const { loginGetUser } = useAuthStore()
const { user } = storeToRefs(useAuthStore())
const { current } = storeToRefs(useRoutesMainStore())
const { routerPush, pushHome } = useRoutesMainStore()

const data = reactive({
  email: '',
  password: '',
})

const rules = computed(() => {
  return {
    email: { required, email },
    password: {
      required,
      minLength: minLength(8),
      containsPasswordRequirement: helpers.withMessage(
        () => `The password requires an uppercase, lowercase, and a number`,
        (value) => /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(<string>value),
      ),
    },
  }
})

const v$ = useVuelidate(rules, data)

const emailErrors = computed(() => {
  return <string>(v$.value.email.$error ? v$.value.email.$errors[0].$message : undefined)
})

const passwordErrors = computed(() => {
  return <string>(v$.value.password.$error ? v$.value.password.$errors[0].$message : undefined)
})

const visible = ref(false)

async function login() {
  await v$.value.$validate()
  if (v$.value.$error || v$.value.$silentErrors.length > 0) {
    showSnackbar('Please correct the marked errors!', 'orange')
    console.log(
      `validation errors: ${JSON.stringify(v$.value.$errors, null, 2)} silent: ${JSON.stringify(v$.value.$silentErrors, null, 2)}`,
    )
    return
  }

  let res = await loginGetUser(data)
  if (res.success) {
    showSnackbar('You have successfully logged in')
    user.value = res.data
    if (
      ['/auth/register', '/auth/forgot-password'].includes(<string>current.value.preLoginFullPath)
    ) {
      await routerPush('home')
    } else {
      router.push(<string>current.value.preLoginFullPath)
    }
  } else {
    if (res.status === 422) {
      showSnackbar(res.message)
    } else {
      await pushHome(`Error! ${res.message}. Redirected to home page`)
    }
  }
}

async function goTo(routeName: TPageName) {
  await routerPush(routeName)
}
</script>
