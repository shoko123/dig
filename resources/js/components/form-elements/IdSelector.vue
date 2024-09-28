<template>
    <slot v-bind="{ idInfo }">
        <v-btn v-model="idInfo.id" label="tag" class="bg-grey text-black my-5" @click="changeLabel">{{ idInfo.tag
            }}</v-btn>
    </slot>
    <v-dialog v-model="openIdSelectorModal" fullscreen>
        <v-container fluid>
            <v-card height="97vh">
                <v-card-title class="bg-grey text-black py-0 mb-4"> Id Selector Form for a new {{ current.module
                    }}</v-card-title>
                <v-card-text>
                    <v-row class="my-4 mr-2">
                        <slot name='specific-id-selctor'>
                        </slot>
                    </v-row>
                </v-card-text>
            </v-card>
        </v-container>
    </v-dialog>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useItemNewStore } from '../../scripts/stores/itemNew'
import { useRoutesMainStore } from '../../scripts/stores/routes/routesMain'

const { current } = storeToRefs(useRoutesMainStore())
const { id, openIdSelectorModal } = storeToRefs(useItemNewStore())
// const { routerPush } = useRoutesMainStore()

const idInfo = computed(() => {
    return { id: id.value, tag: `${current.value.module} ${id.value}` }
})

// async function cancel() {
//     openIdSelectorModal.value = false
//     console.log(`IdSelector.cancel()`)
//     await routerPush('back1')
// }

function changeLabel() {
    console.log(`IdSelector.change label()`)
    openIdSelectorModal.value = true
}
</script>