<template>
  <div class="w-full h-full">
    <div class="border-b border-t border-grey-darker">
      <CanvasJS @positionUpdate="updateVisualPosition" ref="canvas" :draggable=draggable></CanvasJS>
    </div>
    <div class="p-8 pt-6 pb-0" v-if="showToggle">
      <div class="w-full flex justify-center cursor-pointer mb-4" @click="toggleVisibility">
        <ae-text face="uppercase-base" weight="bold" v-show="!controlsVisible">Show advanced controls</ae-text>
        <ae-text face="uppercase-base" weight="bold" v-show="controlsVisible">Hide advanced controls</ae-text>
      </div>
      <ae-divider class="mt-4" v-if="!controlsVisible"></ae-divider>
    </div>
    <transition name="slide-fade">
      <div class="ml-8 mr-8" v-show="controlsVisible">
        <ae-card>
          <div class="flex flex-col" >
            <div class="flex flex-row" v-if="draggable">
              <ae-input label="X" type="number" :value=x class="mr-3 text-center"></ae-input>
              <ae-input label="Y" type="number" :value=y class="text-center"></ae-input>
            </div>
            <div class="flex flex-row" v-else>
              <ae-input label="X" :value=x disabled class="mr-3 text-center"></ae-input>
              <ae-input label="Y" :value=y disabled class="text-center"></ae-input>
            </div>
            <div class="pt-4 flex flex-row" v-if="showScale">
              <form>
                <div>
                  <ae-label class="no-margin">Scale</ae-label>
                  <div class="flex flex-row justify-space items-center">
                    <div class="w-2/3">
                      <input class="max-w-full" type="range" step="0.1" min="1" :max="this.settings.MAX_SCALING" v-model="scale"/>
                    </div>
                    <div class="w-1/3">
                      <ae-input class="no-margin" type="number" v-model="scale"></ae-input>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </ae-card>
      </div>

    </transition>

  </div>

</template>

<script>
  //TODO disable ae-inputs (not yet possible)
  //TODO add listener for blur / change to ae-inputs not possible yet
  import CanvasJS from './CanvasJS.vue'

  export default {
    name: 'CanvasWithControlls',
    components: { CanvasJS },
    data () {
      return {
        x: this.$store.state.position.x,
        y: this.$store.state.position.y,
        scale: 1,
        controlsVisible: !this.showToggle
      }
    },
    props: ['showScale', 'showToggle', 'draggable'],
    computed: {
      transformedImage () {
        return this.$store.state.transformedImage
      },
      position () {
        return this.$store.state.position
      },
      settings () {
        return this.$store.state.settings
      },
      canvasSettings () {
        return this.$store.state.canvas
      },
    },
    methods: {

      // OTHER METHODS
      toggleVisibility () {
        this.controlsVisible = !this.controlsVisible
      },
      updateVisualPosition ({ x, y }) {
        this.x = Math.round(x)
        this.y = Math.round(y)
      },
      moveCanvas (xDiff, yDiff) {
        this.$refs.canvas.moveCanvas({ xDiff, yDiff })
      },
      getOverlayPosition () {
        return this.$refs.canvas.getOverlayPosition()
      },
      getScale() {
        return this.scale
      }
    },
    watch: {
      scale () {
        this.$refs.canvas.setOverlayImageSize(
          this.transformedImage.width * this.scale,
          this.transformedImage.height * this.scale
        )
      }
    },
    mounted () {

    this.scale = this.settings.scaleFactor

      this.$refs.canvas.addOverlayImage({
        src: this.transformedImage.src,
        position: this.position,
        width: this.transformedImage.width,
        height: this.transformedImage.height
      })

      const canvasSize = this.$refs.canvas.getStageDimensions()

      this.moveCanvas(
        -1 * this.position.x + canvasSize.width / 2 - this.transformedImage.width / 2,
        -1 * this.position.y + canvasSize.height / 2 - this.transformedImage.height / 2,
      )

      if(this.transformedImage.width > this.transformedImage.height) {
        this.$refs.canvas.setStageScale(canvasSize.width / (this.transformedImage.width + 100))
      } else {
        this.$refs.canvas.setStageScale(canvasSize.height / (this.transformedImage.height + 100))
      }


    }
  }
</script>

<style scoped type="text/scss">
  .slide-fade-enter-active,
  .slide-fade-leave-active {
    transition-duration: 0.3s;
    transition-property: height, opacity;
    transition-timing-function: ease;
    overflow: hidden;
  }

  .slide-fade-enter,
  .slide-fade-leave-active {
    opacity: 0
  }
  
  .ae-toggle-link {
    color: inherit;
    text-align: center;
    display: block;
    text-decoration: none;
    outline: none;
  }

  .ae-toggle-link span {
    padding: 1em;
    border: 1px solid #ccc;
    border-radius: 20px;
  }


</style>
