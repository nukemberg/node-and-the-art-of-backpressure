<template>
    <div :style="{'height': height + 'px', 'width': width + 'px'}">
        <QRCodeVue3 :value="value" :height=height :width=width />
    </div>
</template>

<script setup lang="ts">
import QRCodeVue3 from "qrcode-vue3";

interface IProps {
    value: string,
    height: number,
    width: number
}

const props = withDefaults(defineProps<IProps>(),
    {
        height: 200,
        width: 200
    });
const value = props.value;
</script>