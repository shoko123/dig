<template>
  <v-container fluid class="pa-1">
    <v-card class="elevation-12">
      <v-toolbar class="bg-grey text-black" density="compact" :height="50">
        <v-toolbar-title> {{ header }}</v-toolbar-title>
      </v-toolbar>

      <v-card-text>
        <v-container fluid class="pa-1">
          <v-row v-if="mediaReady">
            <v-container fluid class="pa-1">
              <v-card class="elevation-12">
                <v-card-title>Upload Preview</v-card-title>
                <v-card-text>
                  <v-row>
                    <v-col v-for="(item, index) in imagesAsBrowserReadable" :key="index" cols="2">
                      <v-img :src="item" height="30vh" />
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-container>
          </v-row>

          <v-row class="pt-2">
            <v-file-input id="fileInput" v-model="images" multiple :show-size="1000"
              accept="image/png, image/jpeg, image/bmp" placeholder="Select images" prepend-icon="mdi-camera"
              :label="fileInputLabel" @change="onInputChange" @click:clear="clear()" />
          </v-row>

          <v-row>
            <v-btn v-if="mediaReady">
              Type: {{ mediaCollection }}
              <v-menu activator="parent">
                <v-list>
                  <v-list-item v-for="(item, index) in mediaCollectionNames" :key="index" :value="item"
                    @click="setMediaCollectionName(item)">
                    <v-list-item-title>{{ item }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-btn>

            <v-btn v-if="mediaReady" class="ml-2" @click="upload"> Upload </v-btn>
            <v-btn v-if="mediaReady" class="ml-2" @click="openMultiItemSelector">
              Upload as multi item media
            </v-btn>
            <v-btn class="ml-2" @click="clear"> Cancel </v-btn>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useMainStore } from '../../scripts/stores/main'
import { useMediaStore } from '../../scripts/stores/media'
import { useNotificationsStore } from '../../scripts/stores/notifications'

onMounted(() => {
  document.getElementById('fileInput')?.click()
})
const m = useMediaStore()
const { showSpinner, showSnackbar } = useNotificationsStore()
const { mediaCollectionNames } = storeToRefs(useMainStore())
const mediaReady = computed(() => {
  return m.mediaReady
})

const header = computed(() => {
  return 'Media Uploader'
})

const fileInputLabel = computed(() => {
  return m.images.length === 0 ? `Add media` : `Selected to upload`
})

//load media to browser
const images = computed({
  get: () => {
    return m.images
  },
  set: (val) => {
    m.images = <File[]>val
  },
})

const imagesAsBrowserReadable = computed(() => {
  return m.imagesAsBrowserReadable
})

async function onInputChange() {
  m.onInputChange()
}

function clear() {
  m.clear()
}

//choose media collection
// const mediaCollectionNames = computed<string[]>(() => {
//   return m.mediaCollectionNames
// })

const mediaCollection = computed(() => {
  return m.mediaCollectionName
})

function setMediaCollectionName(val: string) {
  m.mediaCollectionName = val
}

function openMultiItemSelector() { }

async function upload() {
  showSpinner('Uploading media...')
  const res = await m.mediaUpload()
  showSpinner(false)

  if (res.success) {
    showSnackbar('Media uploaded successfully.')
  } else {
    showSnackbar(`Media upload failed. Error: ${res.message}`)
  }
}
</script>
