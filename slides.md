---
# try also 'default' to start simple
theme: default
title: Node and the art of Backpressure
info: |
  Backpressure and flow management are fundamental required for reliable integration of your Node servers with the rest of the system. Backpressure is relatively natural in synchronous runtimes but Node's async nature requires us to be mindful of it in our code.
  This talk explains backpressure, why it is important and how to properly implement it in Node.js.
class: text-center
# https://sli.dev/custom/highlighters.html
highlighter: shiki
# https://sli.dev/guide/drawing
drawings:
  persist: false
# slide transition: https://sli.dev/guide/animations#slide-transitions
transition: slide-left
# enable MDC Syntax: https://sli.dev/guide/syntax#mdc-syntax
mdc: true
---
# Node and the art of Backpressure
## Avishai Ish-Shalom

<div class="absolute flex flex-row bottom-4 left-2">
<img class="object-contain max-w-8 max-h-8" src="/images/twitter.svg" >
<span>@nukemberg</span>
</div>
---

# What's wrong with this code?

```javascript
const gzip = require('node:zlib').createGzip();
const fs = require('node:fs');

const inp = fs.createReadStream('input.file');
const out = fs.createWriteStream('output.gz');
gzip.on('data', (chunk) => {
    out.write(chunk);
})
inp.on('data', (chunk) => {
    gzip.write(chunk);
})
inp.on('end', () => out.close());
inp.on('close', () => out.close);
```

<v-click>

# 💩 

```shell
kernel: Memory cgroup out of memory: Killed process 133842 (node)
```
</v-click>

---

# But why???

- Fast reader
- Slow writer
- Writes buffered in memory

```mermaid
flowchart LR
Reader -->|1GB/s| BufferGzip((Buffer)) --> Gzip -->|500MB/s| Buffer((Buffer)) -->|100MB/s| Writer[File writer]
```

---

# Oh fuck

<img src="/images/picard-facepalm.webp" class="h-100" />


---

# What's happening here?

<ForwardPressure id="forward1" :width="800" :height="200" />
---

# It's everywhere!!

```mermaid
flowchart LR
Consumer(Consumer) --> Buffer((Buffer)) --> Producer(Producer)
```

```mermaid
flowchart LR
ServiceA(Service A) -->|HTTP| ServiceB(Service B)--> DB[(Database)]
```

---

# Wait, wat?

<v-switch>
<template #1>
```mermaid
flowchart LR
ServiceA(Service A) -->|HTTP| ServiceB(Service B)--> DB[(Database)]
```
</template>

<template #2>
```mermaid
flowchart LR
ServiceA(Service A) -->|HTTP| ServiceB(Service B)--> Handler(Handler function)--> DB[(Database)]
```
</template>

<template #3>
```mermaid
flowchart LR
ServiceA(Service A) -->|HTTP| ServiceB(Service B)--> Buffer((Some buffer?)) --> Handler(Handler function)--> DB[(Database)]
```
</template>

</v-switch>

---

# The event loop IS the buffer

<img src="/images/node-queues.svg" />


---
layout: section
---

# Buffers are Queues

---
layout: image-right
image: images/queueing.png
backgroundSize: contain
---

# Queue theory 101
- Queueing is non-linear
- Approaches infinity on heavy load
- Effects memory usage and latency
- Unlimited queue == outage

---

# Pull based system
Workers control load, overload not possible

```mermaid
sequenceDiagram
  participant Producer
  participant Worker
  Worker->>Producer: gimme work!
  Producer->>Worker: here's a job
```
---

# Use the ack, Luke
Workers use _tickets_ to signal they are ready for more work
```mermaid
sequenceDiagram
  participant Producer
  participant Worker
  Producer->>Worker: Here's a job
  Worker->>Producer: Done! gimme more!
  Producer->>Worker: Here's another job
```

---

# Backpressure

<img src="/images/backpressure.svg" />

---

# Once more, with backpressure

Node.js streams support backpressure!

```javascript
const gzip = require('node:zlib').createGzip();
const fs = require('node:fs');

const inp = fs.createReadStream('input.file');
const out = fs.createWriteStream('output.gz');
inp.pipe(gzip).pipe(out);
```

---

# What about async promises?

```javascript
const asyncJob = readFromDB(query);

```

---

# Services need limits too

$$
\begin{align*}
&Concurrency = N_{cores} (1+ \frac {W}{C}) = N_{cores} \frac {\lambda}{C}
\\
&C := \textrm{Average CPU time} \\
&W := \textrm{Average I/O wait time} \\
&\lambda = W + C := \textrm{Average latency}
\end{align*}
$$

## Example:

- Node.js server ($N_{cores} = 1$)
- Avg req latency: 50ms
- Avg cpu/req: 1ms

Concurrency = 50<br>
Throughput = 1000 req/sec