<template>
    <slot v-bind="{ idInfo }">
        <!-- <v-text-field v-model="idInfo.id" class="m1-2" min-width="140" @click="changeLabel" /> -->
        <v-text-field v-model="idInfo.id" label="tag" @click="changeLabel" />
    </slot>
    <v-dialog v-model="openIdSelectorModal" fullscreen>
        <v-container fluid>
            <v-card height="97vh">
                <v-card-title class="bg-blue-lighten-1"> Id Selector Form for a new {{ current.module }}</v-card-title>
                <v-card-text>
                    <v-row class="my-4">
                        <stone-Id-selector><template #cancel>
                                <!-- content for the header slot -->
                                <v-btn @click="cancel">Cancel</v-btn>
                            </template></stone-Id-selector>
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
import StoneIdSelector from '../modules/stones/StoneIdSelector.vue'


const { current } = storeToRefs(useRoutesMainStore())
const { id, openIdSelectorModal } = storeToRefs(useItemNewStore())
const { routerPush } = useRoutesMainStore()

const idInfo = computed(() => {
    return { id: id.value, tag: "Fake tag" }
})

function cancel() {
    openIdSelectorModal.value = false
    console.log(`IdSelector.cancel()`)
    routerPush('back1')
}

function changeLabel() {
    console.log(`IdSelector.change label()`)
    openIdSelectorModal.value = true
}
</script>