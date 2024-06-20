<template>
    <div class="slidev-layout end">
      <slot>END</slot>
    </div>
    <div class="contact-details">
      <div>
        <img class="object-contain max-w-8 max-h-8" src="/images/twitter.svg" >
        <span>@nukemberg</span>
      </div>
    </div>
  </template>
  
  <style scoped lang="postcss">
  .slidev-layout.end {
    @apply text-white text-opacity-85 text-4xl tracking-widest bg-black h-full text-center grid place-content-center select-none;
  }
  .contact-details {
    @apply text-white text-xl absolute bottom-4 left-2 flex flex-row;
  }
  </style>