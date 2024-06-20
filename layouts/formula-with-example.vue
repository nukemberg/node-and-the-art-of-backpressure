<template>
<div class="slidev-layout container">
    <div class="header">
        <slot />
    </div>
    <div class="formula">
        <slot name="formula" />
    </div>
    <div class="example">
        <slot name="example" />
    </div>
</div>    
</template>

<style scoped>
.container {
    display: grid;
    grid-template-areas: 
    "header header"
    "formula example";
    grid-template-rows: auto 1fr;
    grid-template-columns: auto 1fr;
}

.header {
    grid-area: header;
}

.formula {
    grid-area: formula;
}

.example {
    border-left: 1px solid lightgray;
    padding-left: 10%;
    margin-left: 10%;
    grid-area: example;
}
</style>