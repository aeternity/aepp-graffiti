<template>
  <div>

    <InfoLayer>
      <h2>Rendering</h2>
      <p class="p-4 pb-0">
        The rendering step shows a SVG version of the image you uploaded in the previous step. Below the preview there
        are several options to adapt the SVG to your liking.
      </p>
      <p class="p-4 pb-0">
        <!-- TODO Describe what the options do-->
      </p>
    </InfoLayer>

    <div class="w-full pl-8 pr-8 flex">
      <h1 class="w-full text-center">Artwork Preview</h1>
    </div>
    <div class="w-full p-8 flex justify-center items-center">
      <div v-if="transformedImage.src">
        <div class="w-full">
          <img @load="updateMetaData" ref="previewImage" :src="transformedImage.src"/>
        </div>
        <div class="w-full">
          <form>
            <div>
              <ae-label class="no-margin">Color</ae-label>
              <div class="flex flex-row justify-around items-center mb-6 mt-2">
                <template v-for="(color, index) in droneSettings.colors">
                  <div :key="color" @click="changeColor(index)" class="w-full flex justify-center">
                    <div v-if="currentColor === index" :style="{backgroundColor: color}"
                         class="h-8 w-8 rounded-full ae-color-active"></div>
                    <div v-else :style="{backgroundColor: color}" class="h-8 w-8 rounded-full"></div>
                  </div>
                </template>
              </div>
            </div>
            <div>
              <ae-label class="no-margin">Threshold</ae-label>
              <div class="flex flex-row justify-space items-center">
                <div class="w-2/3">
                  <input class="max-w-full" type="range" step="0.1" min="0.1" max="1" v-model="threshold"/>
                </div>
                <div class="w-1/3">
                  <ae-input class="no-margin" type="number" v-model="threshold"></ae-input>
                </div>
              </div>
            </div>
          </form>
        </div>
        <div class="w-full">
          <ae-list>
            <ae-list-item class="justify-center">
              <ae-button v-if="isChanged" face="round" fill="primary" @click="updatePreview" extend>Update Preview
              </ae-button>
              <ae-button v-else face="round" fill="primary" @click="submit" extend>Continue</ae-button>
            </ae-list-item>
            <ae-list-item @click="back" class="justify-center">
              <ae-text face="uppercase-base" weight="bold">Back</ae-text>
            </ae-list-item>
          </ae-list>
        </div>
      </div>
      <div v-else class="mt-8 relative">
        <ae-loader class="ae-loader-scaling"></ae-loader>
        <div class="absolute ae-loader-progress w-full">{{transformedImage.progress}}%</div>
      </div>
    </div>
  </div>
</template>

<script>

  import InfoLayer from '@/components/InfoLayer'

  export default {
    name: 'Render',
    components: { InfoLayer },
    data () {
      return {
        threshold: 0.1,
        currentColor: 0,
      }
    },
    computed: {
      isChanged () {
        return Number(this.threshold) !== this.settings.threshold || this.currentColor !== this.settings.color
      },
      transformedImage () {
        return this.$store.state.transformedImage
      },
      settings () {
        return this.$store.state.settings
      },
      droneSettings () {
        return this.$store.state.droneSettings
      },
    },
    methods: {
      back () {
        this.$router.push('contribute')
      },
      submit () {
        this.$router.push('positioning')
      },
      updateMetaData () {
        console.log('Updating Meta Data')
        this.$store.dispatch(`updateTransformedImage`, {
          width: this.$refs.previewImage.naturalWidth,
          height: this.$refs.previewImage.naturalHeight
        })
      },
      updatePreview () {
        this.$store.dispatch(`updateSettings`, {
          color: this.currentColor,
          threshold: Number(this.threshold)
        })
      },
      changeColor (index) {
        this.currentColor = index
      },
    },
    mounted () {
      if (this.settings.scaleFactor !== null) {
        this.threshold = this.settings.threshold
        this.currentColor = this.settings.color
      }
    }
  }
</script>

<style scoped>
  .no-margin {
    margin: 0 !important;
  }

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

  .ae-color-active {
    border: 3px solid #ff0d6a;
    box-shadow: 0px 0px 10px;
  }
</style>
