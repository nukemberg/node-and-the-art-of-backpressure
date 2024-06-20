'use strict';
const { eventLoopUtilization } = require('node:perf_hooks').performance;
const { writeFileSync } = require('node:fs');


async function busyWait(pct, interval) {
    let res = 0;
    const quantum = 10; // ms
    let c = quantum*pct; // cpu ms to consume
    let w = (1 - pct)*quantum; // ms to sleep 
    await new Promise(resolve => setImmediate(resolve));
    let start = Date.now();
    let elapsed = Date.now() - start;
    while (elapsed < interval) {
        const c_start = Date.now();
        let i = 1;
        while (Date.now() - c_start < c) { 
            i++;
            res = Math.sqrt(28318233**139 + i + Math.E**133);
        }
        writeFileSync("/dev/null", String(res));
        await new Promise(resolve => setTimeout(resolve, Math.max(0.1, w)))
        const now = Date.now();
        elapsed = now - start;
        if (eventLoopUtilization().utilization < pct) {
            c *= 1.3;
            w *= 0.7;
        } else {
            c *= 0.8;
            w *= 1.1;
        }
    }
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

async function keepBusy(cb, pct, interval) {
    const start = Date.now();
    const elu = eventLoopUtilization();
    if (elu.utilization < pct) {
        await busyWait(pct, interval);
    }
    const worked = Date.now() - start;
    if (interval > worked) {
        setTimeout(keepBusy, 1, cb, pct, interval - worked);
    } else {
        cb();
    }
}

// const pct = Number.parseFloat(process.argv[2]);
// if (pct >= 1 || isNaN(pct)) {
//     console.error("Invalid target utilization");
//     process.exit(1);
// }
async function main() {
    for (const [pct, seconds] of [[0.8, 5], [0.85, 5], [0.9, 5], [0.95, 5], [0.99, 5]]) {
        console.log(`Keeping event loop at ${pct} utilization for ${seconds} seconds`);
        await new Promise(resolve => setImmediate(keepBusy, resolve, pct, seconds*1000));
    }
    console.log("Done!");
    process.exit(0);
}
main();