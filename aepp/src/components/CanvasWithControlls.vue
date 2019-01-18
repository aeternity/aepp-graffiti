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
          <div class="flex flex-col">
            <div class="flex flex-row" v-if="draggable">
              <ae-input label="X" type="number" :value=x class="mr-3 text-center"></ae-input>
              <ae-input label="Y" type="number" :value=y class="text-center"></ae-input>
            </div>
            <div class="flex flex-row" v-else>
              <ae-input label="X" :value=x disabled class="mr-3 text-center"></ae-input>
              <ae-input label="Y" :value=y disabled class="text-center"></ae-input>
            </div>
            <div class="pt-4 w-full" v-if="showScale">
              <ae-label class="no-margin">Scale</ae-label>
              <ae-button-group extend>
                <ae-button fill="primary" @click="minus">-</ae-button>
                <ae-button fill="primary" @click="plus">+</ae-button>
              </ae-button-group>
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
    components: {CanvasJS},
    data() {
      return {
        x: this.$store.state.position.x,
        y: this.$store.state.position.y,
        scale: 1,
        controlsVisible: !this.showToggle
      }
    },
    props: ['showScale', 'showToggle', 'draggable'],
    computed: {
      transformedImage() {
        return this.$store.state.transformedImage
      },
      position() {
        return this.$store.state.position
      },
      settings() {
        return this.$store.state.settings
      },
      canvasSettings() {
        return this.$store.state.canvas
      },
    },
    methods: {
      minus() {
        this.scale -= 0.1
        this.changeOverlayScale()
      },
      plus() {
        this.scale += 0.1
        this.changeOverlayScale()
      },
      toggleVisibility() {
        this.controlsVisible = !this.controlsVisible
      },
      updateVisualPosition({x, y}) {
        this.x = Math.round(x)
        this.y = Math.round(y)
      },
      moveCanvas(xDiff, yDiff) {
        this.$refs.canvas.moveCanvas({xDiff, yDiff})
      },
      getOverlayPosition() {
        return this.$refs.canvas.getOverlayPosition()
      },
      getScale() {
        return this.scale
      },

      async changeOverlayScale() {
        await this.$store.dispatch('updateSettings', {
          scaleFactor: this.scale
        })
        this.updateOverlayImage()
      },

      updateOverlayImage() {
        this.$refs.canvas.updateOverlayImageSource({
          src: this.transformedImage.src,
          width: this.transformedImage.width,
          height: this.transformedImage.height
        })
      }
    },
    mounted() {

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

      if (this.transformedImage.width > this.transformedImage.height) {
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
