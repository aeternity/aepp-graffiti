<template>
  <div class="mt-8 relative">
    <ae-loader class="ae-loader-scaling"></ae-loader>
    <div class="absolute ae-loader-progress w-full">{{progress}}%</div>
  </div>
</template>

<script>
  export default {
    name: "BiggerLoader",
    props: ['progress']
  }
</script>

<style scoped>
  .ae-loader-progress {
    font-size: 1em;
    top: 2em;
    left: 0;
    text-align: center;
  }

  .ae-loader-scaling {
    width: 5em;
    height: 5em;
    border-radius: 5em;
    border-width: 0.4em;
  }

</style>
