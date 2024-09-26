<template>
    <slot v-bind="{ idInfo }">
        <v-text-field v-model="idInfo.id" label="tag" @click="changeLabel" />
    </slot>
    <v-dialog v-model="openIdSelectorModal" fullscreen>
        <v-container fluid>
            <v-card height="97vh">
                <v-card-title class="bg-blue-lighten-1"> Id Selector Form for a new {{ current.module }}</v-card-title>
                <v-card-text>
                    <v-row class="my-4">
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
    return { id: id.value, tag: "Fake tag" }
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