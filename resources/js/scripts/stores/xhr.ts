import axios from 'axios'
import { defineStore } from 'pinia'
import type { TXhrResult, TXhrMethod } from '@/types/xhrTypes'

export const useXhrStore = defineStore('xhr', () => {
  async function setAxios() {
    axios.defaults.baseURL = window.location.origin
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
    //axios.defaults.headers.common['Content-Type'] = 'application/json' <- disabled because of media upload
    axios.defaults.headers.common['Accept'] = 'application/json'
    axios.defaults.withCredentials = true
    console.log(`set axios.defaults.baseUrl: ${window.location.origin}`)

    try {
      await axios.get(`/sanctum/csrf-cookie`)
    } catch (err: unknown) {
      console.log(`failed to set csrf cookie. err: ${JSON.stringify(err, null, 2)}`)
      throw new Error('Failed to set csrf-token')
    }
  }

  async function send<T = null>(
    endpoint: string,
    method: TXhrMethod,
    data?: object,
  ): Promise<TXhrResult<T>> {
    const fullUrl =
      endpoint.substring(0, 8) === 'fortify/'
        ? `${axios.defaults.baseURL}/${endpoint}`
        : `${axios.defaults.baseURL}/api/${endpoint}`

    console.log(`xhr.send() endpoint: ${fullUrl}`)

    try {
      const res = await axios<T>({
        url: fullUrl,
        method,
        data: data === undefined ? null : data,
      })
      return { success: true, data: res.data, status: res.status, message: res.statusText }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.log(
          `** axios.err ** status: ${err.response?.status}. message: "${err.response?.data?.message}"`,
        )
        return {
          success: false,
          message: `The server responded with an error message: ${err.response?.data?.message.substring(0, 200)}`,
          status: err.response?.status ?? 999,
        }
      } else {
        console.log(`**** axios.err **** no-response or setup error`)
        return { success: false, status: 999, message: 'unexpected error' }
      }
    }
  }
  return { setAxios, send }
})
