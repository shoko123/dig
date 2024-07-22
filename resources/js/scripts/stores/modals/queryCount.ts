// stores/media.js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useQueryCountStore = defineStore('qcount', () => {
  const isOpen = ref<boolean>(false)

  const queryCountInfo = computed(() => {
    return { header: 'Query result header' }
  })
  return { isOpen, queryCountInfo }
})
