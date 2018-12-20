<template>
  <div>
    <div class="w-full pl-4 pb-4 pr-4 flex">
      <h1 class="w-full text-center">Put Your Artwork on the Map</h1>
    </div>
    <div class="w-full p-4">
      <div class="border border-grey-darker border-1">
        <CanvasWithControlls :show-navigation=true ref="canvas"></CanvasWithControlls>

      </div>
    </div>
    <div class="w-full p-4 flex justify-center">
      <ae-button face="round" fill="alternative" class="mr-4" @click="back">Back</ae-button>
      <ae-button face="round" fill="primary" @click="next">Continue</ae-button>
    </div>
  </div>
</template>

<script>
  import CanvasWithControlls from './CanvasWithControlls.vue'

  export default {
    name: 'Positioning',
    components: { CanvasWithControlls },
    methods: {
      back () {
        this.$router.push('render')
      },
      next () {
        const { x, y } = this.$refs.canvas.getCurrentCoords()
        console.log(x,y);
        this.$store.dispatch(`updatePosition`, { x, y })
        this.$router.push('confirm')
      }
    }
  }
</script>

<style scoped>

</style>
