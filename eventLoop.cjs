'use strict';
const { eventLoopUtilization } = require('node:perf_hooks').performance;
const { writeFileSync } = require('node:fs');

function busyWait() {
    let res = 0;
    while (eventLoopUtilization().utilization < pct) {
        res = Math.sqrt(28318233**139 + Math.E**133);
    }
    writeFileSync("/dev/null", String(res));
}

setInterval(() => {
    const elu = eventLoopUtilization();
    console.log(`Event loop utilization: ${elu.utilization}`);
}, 1000);

let lastCheckpoint = Date.now(); 
const lagInterval = 1000; // ms
setInterval(() => {
    const now = Date.now();
    const lag = now - lastCheckpoint - lagInterval;
    lastCheckpoint = now;
    console.log(`Event loop lag: ${lag}ms`);
}, lagInterval);

function keepBusy(pct) {
    const elu = eventLoopUtilization();
    if (elu.utilization < pct) {
        busyWait();
    }
    setTimeout(keepBusy, 20, pct);
}

const pct = Number.parseFloat(process.argv[2]);
if (pct >= 1 || isNaN(pct)) {
    console.error("Invalid target utilization");
    process.exit(1);
}

console.log(`Keeping event loop at ${pct} utilization`);
setImmediate(keepBusy, pct);