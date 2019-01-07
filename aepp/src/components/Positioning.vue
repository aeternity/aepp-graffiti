<template>
  <div>
    <InfoLayer>
      <h2>Positioning</h2>
      <p class="p-4 pb-0">
        Drag and drop the artwork to your desired position on the wall. You can pinch to zoom and drag to move.
      </p>
      <p class="p-4 pb-0">
        To adjust the size of your artwork use the scale slider down below. For more detailed positioning you can enter the X and Y coordinates in the in put fields below.
      </p>
    </InfoLayer>

    <div class="w-full pl-4 pb-4 pr-4 flex">
      <h1 class="w-full text-center">Put Your Artwork on the Map</h1>
    </div>
    <div class="w-full pt-4">
        <CanvasWithControlls :draggable=true :scale="scale" ref="canvas"></CanvasWithControlls>
    </div>
    <div class="p-4 w-full">
      <div class="w-full mb-8">
        <form>
          <div>
            <ae-label class="no-margin">Scale</ae-label>
            <div class="flex flex-row justify-space items-center">
              <div class="w-1/2">
                <input type="range" step="0.1" min="1" :max="this.settings.MAX_SCALING" v-model="scale"/>
              </div>
              <div class="w-1/2">
                <ae-input class="no-margin" type="number" v-model="scale"></ae-input>
              </div>
            </div>
          </div>
        </form>
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
  import InfoLayer from '@/components/InfoLayer'

  export default {
    name: 'Positioning',
    components: { InfoLayer, CanvasWithControlls },
    data () {
      return {
        scale: 1
      }
    },
    computed: {
      settings () {
        return this.$store.state.settings
      },
    },
    methods: {
      back () {
        this.$router.push('render')
      },
      next () {
        const { x, y } = this.$refs.canvas.getOverlayPosition()
        console.log(x, y)
        this.$store.dispatch(`updatePosition`, { x: Math.round(x), y: Math.round(y) })
        this.$store.dispatch(`updateSettings`, { scaleFactor: Number(this.scale)})
        this.$router.push('confirm')
      }
    },
    mounted () {
      this.scale = this.settings.scaleFactor
    }
  }
</script>

<style scoped>

</style>
