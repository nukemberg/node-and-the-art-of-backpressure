# The Cheatsheet

## Node specific
- Use [`streams`](https://nodejs.org/en/learn/modules/backpressuring-in-streams) where possible, prefer `pipe`/`drain` and `pipeline` to calling `write` directly. If you do use `write` note that the return value provides backpressure.
- Always await for promises or limit pending async tasks. Consider using [p-limit](https://www.npmjs.com/package/p-limit) or similar if using `Promise.all`/`Promise.each`
- Limit all queues/buffers
- Beware of connection pools - pool sizes must be >= concurrency; Pools behave like queues and should be treated accordingly 
- Use express/fastify/koa middleware to limit HTTP request concurrency (see [this](https://www.npmjs.com/package/koa-limit-connections) example)
- Monitor [event loop utilization](https://nodejs.org/api/perf_hooks.html#performanceeventlooputilizationutilization1-utilization2) and event loop lag

## Service level
- Calculate max requests concurrency for servers, use reverse proxy/API gw/LB/service mesh to limit
- Always backpressure between services
- Load shed at the edge of the system

## Go deeper

- [Queue Theory for Node.js engineers](https://youtu.be/9yWjnzWZP2Q?si=0WqTzvufcHVJM348) (Avishai Ish-Shalom)
- [Everything Will Flow](https://youtu.be/1bNOO3xxMc0?si=sDLvgDOUpABOBdE6) (Zach Tellman) 
- [What's the cost of a millisecond?](https://youtu.be/JgrcaK0WQCQ?si=2-iNMHYI76m2UIQj) (Avishai Ish-Shalom)
- [Awesome Architecture](https://awesome-architecture.com/back-pressure/) page on backpressure
