<template>
  <div>
    <div class="w-full pl-4 pb-4 pr-4 flex">
      <h1 class="w-full text-center">THE DRONE ART</h1>
    </div>
    <div class="w-full p-4">
      <div class="border border-grey-darker border-1">
        <CanvasJS :draggable=true ></CanvasJS>
      </div>
    </div>
    <div class="w-full p-4 flex justify-center">
      <ae-button face="round" fill="primary" @click="$router.push(`contribute`)" >Contribute Art</ae-button>
    </div>
    <div class="w-full p-4 flex justify-center">
      <ae-button face="round" fill="secondary">Learn More</ae-button>
    </div>
    <div class="w-full p-4 flex justify-center">
      <ae-button face="round" fill="alternative" @click="$router.push('test')" type="exciting" >TEST</ae-button>
    </div>
  </div>
</template>

<script>
  import CanvasJS from './CanvasJS.vue'
  export default {
    name: 'Home',
    components: { CanvasJS }
  }
</script>

<style scoped></style>
