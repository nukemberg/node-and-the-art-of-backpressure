<template>
    <div>
        <RenderWhen context="main">
        <div class="asciinema" ref="playerElement"></div>
        </RenderWhen>
    </div>
</template>
  
<script setup lang="ts">
import RenderWhen from "@slidev/client/builtin/RenderWhen.vue";
import { onMounted, onUnmounted, ref } from "vue";
import * as AsciinemaPlayer from "asciinema-player";
import "asciinema-player/dist/bundle/asciinema-player.css";
import {useNav} from "@slidev/client";


const props = defineProps(["src", "options"]);
const playerElement = ref(null);
const player = ref(null);

onMounted(() => {
    const base = import.meta.env.BASE_URL + props.src;
    if (playerElement.value != null) {
        player.value = AsciinemaPlayer.create(
            base,
            playerElement.value,
            props.options
        );
        player.value.addEventListener('ended', () => {
            useNav().next();
        })
    }
});

onUnmounted(() => {
    if (player.value != null) {
        player.value.dispose();
    }
})
</script>
