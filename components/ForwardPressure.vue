<template>
    <div ref="container" class="animation" :id="'animation_' + props.id">
        <svg ref="svg" :height="height" :width="width">
            <defs>
                <!-- A marker to be used as an arrowhead -->
                <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="5"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" />
                </marker>
            </defs>
        </svg>
    </div>
</template>

<script setup lang="ts">
import {onUpdated, onMounted, ref, computed, watch, triggerRef, onBeforeUpdate, onRenderTriggered, onRenderTracked, watchEffect, shallowRef} from "vue";
import * as d3 from "d3";
import {useNav, useSlideContext} from "@slidev/client";

const nav = useNav();
const thisSlide = useSlideContext().$route.no;
let intervalHandler = null;

watch(nav.currentPage, (currentSlide) => {
    if (thisSlide == currentSlide) {
        intervalHandler = setInterval(() => animationTick(), 250);
    } else if (intervalHandler != null) {
        clearInterval(intervalHandler);
    }
});


const container = ref(null);
const svg = ref(null);

const props = defineProps({
    id: String,
    height: Number,
    width: Number
});

const data = shallowRef([
    {capacity: 0, id: "A", rate: 15},
    {capacity: 0, id: "B", rate: 10},
    {capacity: 0, id: "C", rate: 5}
]);

const MAX_CAPACITY = 50;


function draw(data) {
    const g = d3.select(svg.value).select("g");
    const _data = data.map((d, i) => {
        return {
            r: Math.max(Math.min(100, d.capacity*5), 40),
            x: 50 + i*200,
            ...d
        };
    });
    
    const nodes = g.selectAll("g.worker")
    .data(_data, d => d ? d.id : this.id)
    .join("g")
    .classed("worker", true)
    .attr("transform", (d) => `translate(${d.x}, ${100})`);
    
    nodes.append("circle")
    .attr("r", (d) => d.r)
    .attr("fill", (d) => d3.interpolate("lightblue", "red")(Math.min(d.capacity/MAX_CAPACITY, 1)));
    
    nodes.append("text")
    .text((d) => `Rate: ${d.rate}/sec`)
    .attr("dy", -50)
    .attr("dx", -50)
    nodes.append("text")
    .text((d) => d.id)
    .attr("dy", 0)
    .attr("dx", -5)
    .attr("font-size", "20px");
    
    nodes.append("text")
    .text((d) => `|${d.capacity}|`)
    .attr("dy", 20)
    .attr("dx", -10)
    .attr("font-size", "20px");
    
    g.selectAll("line.connector")
    .data(d3.pairs(_data), ([start, end]) => start ? `${start.id}->${end.id}` : this.id)
    .join("line")
    .classed("connector", true)
    .attr("x1", (d) => d[0].x + d[0].r)
    .attr("x2", (d) => d[1].x - d[1].r - 5)
    .attr("y1", 100)
    .attr("y2", 100)
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .attr("marker-end", "url(#arrow)");
    
}

function animationTick() {
    const _data = data.value;
    if (Math.random() < 0.9) {
        _data[0].capacity++;
    }

    for (let i=0; i<_data.length; i++) {
        if (Math.random()*_data[i].rate > 1) {
            _data[i].capacity = Math.max(0, _data[i].capacity - 1);
            if (i + 1 < _data.length) {
                _data[i+1].capacity++;
            }
        }
    }
    data.value = _data;
    triggerRef(data);
}

onMounted(() => {
    d3.select(svg.value).append("g");
    draw(data.value);
});
watchEffect(() => {
    draw(data.value);
});
</script>
