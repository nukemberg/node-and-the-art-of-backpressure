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
import {onMounted, ref, watch, triggerRef, watchEffect, shallowRef} from "vue";
import * as d3 from "d3";
import {useNav, useSlideContext} from "@slidev/client";

const nav = useNav();
const thisSlide = useSlideContext().$route.no;
let intervalHandler: NodeJS.Timeout | null = null;

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
    id: {type: String},
    height: {type: String, default: "400"},
    width: {type: String, default: "800"}
});

const data = shallowRef({
    workers: [
        {capacity: 0, id: "A", rate: 15},
        {capacity: 0, id: "B", rate: 10},
        {capacity: 0, id: "C", rate: 5}
    ],
    workItems: []
});

const MAX_CAPACITY = 50;

const sectionWidth = Number.parseInt(props.width) / data.value.workers.length;
const spacing = sectionWidth / data.value.workers.length;

function draw(data) {
    const g = d3.select(svg.value).select("g");
    const workers = data.workers.map((d, i) => {
        return {
            r: Math.max(Math.min(sectionWidth, d.capacity*5), 40),
            x: spacing + i*sectionWidth,
            ...d
        };
    });
    
    const nodes = g.selectAll("g.worker")
    .data(workers, d => d ? d.id : this.id);

    nodes.enter().append("g")
    .classed("worker", true)
    .attr("transform", (d) => `translate(${d.x}, ${100})`)
    .call(s => {
        s.append("circle");
        s.append("text")
        .text((d) => `Rate: ${d.rate}/sec`)
        .attr("dy", -50)
        .attr("dx", -50);
        s.append("text")
        .text((d) => d.id)
        .attr("dy", 0)
        .attr("dx", -7)
        .attr("font-size", "20px");
        s.append("text")
        .classed("capacity", true)
        .attr("dy", 70)
        .attr("dx", -50)
        .attr("font-size", "20px")
        .text((d) => `Buffered: ${d.capacity}`);
    });
    
    nodes.select("circle")
    .attr("r", (d) => d.r)
    .attr("fill", (d) => d3.interpolate("lightblue", "red")(Math.min(d.capacity/MAX_CAPACITY, 1)));
    
    nodes.select("text.capacity")
        .text((d) => `Buffered: ${d.capacity}`);

    g.selectAll("line.connector")
    .data(d3.pairs(workers), ([start, end]) => start ? `${start.id}->${end.id}` : this.id)
    .join("line")
    .classed("connector", true)
    .attr("x1", (d) => d[0].x + d[0].r)
    .attr("x2", (d) => d[1].x - d[1].r - 5)
    .attr("y1", 100)
    .attr("y2", 100)
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .attr("marker-end", "url(#arrow)");
    
    function animateWorkitem(node) {
        node
        .classed("workitem", true)
        .attr("r", 0)
        .attr("fill", "gray")
        .attr("fill-opacity", "0.8")
        .attr("cx", (d) => {
        const origin = workers.find((w) => w.id == d[0]);
        return origin.r + origin.x;
        })
        .attr("cy", 100)
        .transition()
        .duration(100)
        .attr("r", 10)
        .transition()
        .duration(500)
        .attr("cx", (d) => {
        const dest = workers.find((w) => w.id == d[1]);
        return dest.x - dest.r;
        })
        .transition()
        .duration(100)
        .attr("r", 0)
        .remove();
    }

    g.selectAll("circle.workitem")
        .data(data.workItems)
        .join(enter => enter
            .append("circle")
            .call(animateWorkitem), 
        update => update,
        exit => exit.remove());
}

function animationTick() {
    const {workers} = data.value;
    const workItems = [];
    if (Math.random() < 0.9) {
        workers[0].capacity++;
    }

    for (let i=0; i<workers.length; i++) {
        if (Math.random()*workers[i].rate > 1) {
            workers[i].capacity = Math.max(0, workers[i].capacity - 1);
            if (i + 1 < workers.length) {
                workItems.push([workers[i].id, workers[i+1].id]);
                workers[i+1].capacity += 1;
            }
        }
    }
    data.value = {workers, workItems};
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
