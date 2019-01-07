<template>
  <div>
    <div class="w-full pl-4 pb-4 pr-4 flex">
      <h1 class="w-full text-center">THE DRONE ART</h1>
    </div>
    <div class="w-full pt-4 pb-4">
      <div class="border-grey-darker border-t border-b">
        <CanvasJS :draggable=true ></CanvasJS>
      </div>
    </div>
    <div class="w-full p-4 flex justify-center">
      <ae-button face="round" fill="primary" @click="$router.push(`contribute`)" >Contribute Art</ae-button>
    </div>
    <div class="w-full p-4 flex justify-center">
      <ae-button face="round" fill="primary" @click="$router.push(`overview`)" >My Bids Overview</ae-button>
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
  import InfoLayer from '@/components/InfoLayer'
  export default {
    name: 'Home',
    components: { InfoLayer, CanvasJS },

  }
</script>

<style scoped></style>
