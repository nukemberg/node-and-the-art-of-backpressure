<script setup>
import { Line } from 'vue-chartjs';
import { LinearScale, Chart, PointElement, LineElement } from 'chart.js';
import { ref, computed } from 'vue';
Chart.register(LinearScale, PointElement, LineElement);
// Chart.defaults.backgroundColor = '#080000';
// Chart.defaults.borderColor = '#AAAAAA';
Chart.defaults.color = '#000000';

const props = defineProps({
    model: {type: String, default: 'mm1'},
    height: {type: String, default: "250"},
    width: {type: String, default: "250"}
});

function mm1(rho) {
    return rho / (1-rho);
}
function factorial(num) {
    let rval = 1;
    for (let i = 2; i <= num; i++)
        rval = rval * i;
    return rval;
}

function sumSeries(from, to, func) {
    let s = 0;
    for (let i = from; i <= to; i++) {
        s += func(i);
    }
    return s
}

function erlangC(c, r) {
    let X = r ** c * c / (factorial(c) * (c - r));
    let Y = sumSeries(0, c - 1, i => r ** i / factorial(i));
    return X / (X + Y)
}

function mmc(rho, mu, c) {
    let lambda = rho * mu * c;
    return erlangC(c, rho * c) / (c * mu - lambda);
}

function kingman(rho, c_s, c_a) {
    return (Math.pow(c_a, 2) + Math.pow(c_s, 2))*mm1(rho)/2;
}

const start = 0;
const end = 1;
const steps = 100;
const delta = (end - start)/steps;

const x = Array.from({length: steps}, (_, i) => i*delta + start);
const variance = ref(1);
const workers = ref(1);

const data = computed(function() {
    let y;
    switch(props.model) {
        case "mm1":
            y = x.map(mm1);
            break;
        case "kingman":
            y = x.map((x) => kingman(x, variance.value, 1));
            break;
        case "mmc":
            y = x.map(x => mmc(x, 1, workers.value));
            if (y[y.length - 1] < 100) {
                const extra = [0.995, 0.998, 0.999];
                x.push(...extra);
                y.push(...extra.map(x => mmc(x, 1, workers.value)));
            }
            break;
    }
    return {
        labels: x,
        datasets: [{label: props.model, data: y, borderColor: '#5656FF'}]
    }
});
const options = {
    title: 'Queue latency',
    responsive: false,
    // aspectRatio: 1,
    elements: {
        point: {pointStyle: false}
    },
    scales: {
        y: {
            title: {text: 'Latency/Queue size', display: true},
            ticks: {display: false},
            min: 0,
            max: 100
        },
        x: {
            title: {text: 'Utilization', display: true},
            type: 'linear',
            min: start,
            max: end
        },
    }
}

</script>

<style scoped>
.chart {
    margin: auto;
    display: inline-block;
    position: relative;
}
.chart-container {
    height: fit-content;
    width: fit-content;
    display: block;
}
</style>

<template>
    <div class="grid grid-rows-2 box chart-container">
        <div class="chart">
            <Line :height="`${height}px`" :width="`${width}px`" :data="data" :options="options"></Line>
        </div>
        <div class="box row-span-2 row-start-2">
            <template v-if="model == 'kingman'">
                <label for="variance">Variance<input class="ml-4" label="Variance" type="range" name="variance" id="" min="1" max="10" v-model="variance"></label>
            </template>
            <template v-else-if="model == 'mmc'">
                <label for="workers">Workers<input class="ml-4" label="Workers" type="range" name="workers" id="" min="1" max="10" v-model="workers"></label>    
            </template>
        </div>
    </div>
</template>

