<template>{{ module }} - Modify</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useModuleStore } from '../../../../scripts/stores/module'

let { module } = storeToRefs(useModuleStore())
</script>
