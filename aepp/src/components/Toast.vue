<template>
  <div class="toaster rounded-full py-2 px-4">
    <slot></slot>
  </div>
</template>

<script>
  export default {
    name: 'Toast'
  }
</script>

<style scoped>
  .toaster {
    color: white;
    background: rgba(0, 0, 0, 0.8)
  }
</style>
