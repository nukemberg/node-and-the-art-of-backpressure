<script setup lang="ts">
const props = defineProps({
    svg: {
        type: String
    }
});
</script>

<style scoped>
object.svg {
    max-width: 100%;
    max-height: 100%;
}

div.svg-container {
    display: flex;
    align-items: center;
}
</style>

<template>
    <div class="slidev-layout two-columns w-full h-full grid grid-cols-2">
        <div class="col-left">
            <slot></slot>
        </div>
        <div class="col-right svg-container">
            <object class="svg" :data="props.svg" ></object>
        </div>
    </div>
</template>