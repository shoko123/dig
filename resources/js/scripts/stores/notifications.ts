// notifications.ts
//handles spinner and snackbar
import { defineStore } from 'pinia'
import { ref } from 'vue'

type TSnackbar = {
  model: boolean
  message: string
  color: string
  timeout: number
}

type TSpinner = {
  model: boolean
  message: string
}

export const useNotificationsStore = defineStore('notifications', () => {
  const snackbar = ref<TSnackbar>({
    model: false,
    message: '',
    color: 'blue',
    timeout: 5000,
  })

  const spinner = ref<TSpinner>({
    model: false,
    message: '',
  })

  function showSnackbar(message: string, color = 'blue', timeout = 5) {
    snackbar.value.message = message
    snackbar.value.color = color
    snackbar.value.timeout = timeout * 1000
    snackbar.value.model = true
  }

  //call with a message to show; call with false to hide
  function showSpinner(param: boolean | string) {
    if (param === false) {
      spinner.value.message = ''
      spinner.value.model = false
    } else {
      spinner.value.message = <string>param
      spinner.value.model = true
    }
  }

  return { snackbar, spinner, showSnackbar, showSpinner }
})
