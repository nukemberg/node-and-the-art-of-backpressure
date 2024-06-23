<template>
    <div class="slidev-layout end">
      <slot>END</slot>
    </div>
    <div class="contact-details">
      <div>
        <img class="inline-block object-contain max-w-8 max-h-8 invert" src="/images/twitter.svg" >
        <span>@nukemberg</span>
      </div>
      <div class="">
        <img class="inline-block object-contain max-h-8 invert" src="/images/linkedin.svg" >
        <span>linkedin.com/in/nukemberg</span>
      </div>
      <div>
        <span class="mx-1">
          <mdi-gmail />
        </span>
        <span>avishai@fewbytes.com</span>
      </div>
    </div>
  </template>
  
  <style scoped lang="postcss">
  .slidev-layout.end {
    @apply text-white text-opacity-85 text-4xl tracking-widest bg-black h-full text-center place-content-center select-none;
  }
  .contact-details {
    @apply text-white text-xl absolute bottom-4 p-4 flex flex-row w-full justify-around;
  }
  .contact-details img {
    @apply mx-2;
  }
  </style>