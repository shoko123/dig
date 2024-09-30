<template>
    <slot name='id-selector-activator'>
    </slot>
    <v-dialog v-model="openIdSelectorModal" fullscreen>
        <v-container fluid>
            <v-card height="97vh">
                <v-card-title class="bg-grey text-black py-0 mb-4"> Id Selector Form for a new {{ current.module
                    }}</v-card-title>
                <v-card-text>
                    <v-row class="my-4 mr-2">
                        <slot name='id-selector-form'>
                        </slot>
                    </v-row>
                </v-card-text>
            </v-card>
        </v-container>
    </v-dialog>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useItemNewStore } from '../../scripts/stores/itemNew'
import { useRoutesMainStore } from '../../scripts/stores/routes/routesMain'

const { current } = storeToRefs(useRoutesMainStore())
const { openIdSelectorModal } = storeToRefs(useItemNewStore())

</script>