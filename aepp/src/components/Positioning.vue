<template>
  <div>
    <div class="w-full pl-4 pb-4 pr-4 flex">
      <h1 class="w-full text-center">Put Your Artwork on the Map</h1>
    </div>
    <div class="w-full p-4">
      <div class="border border-grey-darker border-1">
        <CanvasWithControlls></CanvasWithControlls>

      </div>
    </div>
    <div class="w-full p-4 flex justify-center">
      <ae-button size="large" type="dramatic" @click="moveCanvas(0,10)" >Contribute Art</ae-button>
    </div>
    <div class="w-full p-4 flex justify-center">
      <ae-button size="medium" type="exciting" >Learn More</ae-button>
    </div>
  </div>
</template>

<script>
  import CanvasWithControlls from './CanvasWithControlls.vue'
  export default {
    name: 'Positioning',
    components: { CanvasWithControlls },
  }
</script>

<style scoped>

</style>
