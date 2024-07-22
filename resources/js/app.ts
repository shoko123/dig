import './bootstrap'
import { createApp } from 'vue'
import pinia from './scripts/setups/pinia'
import router from './scripts/setups/vue-router'
import vuetify from './scripts/setups/vuetify'
import App from './components/App.vue'
import { useXhrStore } from './scripts/stores/xhr'

const app = createApp(App).use(pinia).use(router).use(vuetify)

const { setAxios } = useXhrStore()

setAxios()

router.isReady().then(() => {
  app.mount('#app')
})
