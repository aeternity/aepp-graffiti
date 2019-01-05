<template>
  <div>
    <div class="w-full pl-4 pr-4 flex">
      <h1 class="w-full text-center">Artwork Preview</h1>
    </div>
    <div class="w-full p-4 flex">
      <div class="w-full flex justify-center items-center">
        <div v-if="transformedImage.src">
          <div class="w-full">
            <img @load="updateMetaData" ref="previewImage" :src="transformedImage.src"/>
          </div>
          <div class="w-full mb-8">
            <form>
              <div>
                <ae-label class="no-margin">Color</ae-label>
                <div class="flex flex-row justify-around items-center mb-6 mt-2">
                  <template v-for="(color, index) in droneSettings.colors">
                    <ae-button  v-if="currentColor === index" :key="color" fill="primary" face="round">
                      <div :style="{backgroundColor: color}" class="h-8 w-8 rounded-full"></div>
                    </ae-button>
                    <ae-button v-else :key="color" shadow="false" fill="neutral" @click="changeColor(index)" face="round">
                      <div :style="{backgroundColor: color}" class="h-8 w-8 rounded-full"></div>
                    </ae-button>
                  </template>
                </div>
              </div>
              <div>
                <ae-label class="no-margin">Threshold</ae-label>
                <div class="flex flex-row justify-space items-center">
                  <div class="w-1/2">
                    <input type="range" step="0.1" min="0.1" max="1" v-model="threshold"/>
                  </div>
                  <div class="w-1/2">
                    <ae-input class="no-margin" type="number" v-model="threshold"></ae-input>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="mt-4 w-full flex justify-center">
            <ae-button face="round" fill="alternative" class="mr-4" @click="back">Back</ae-button>
            <ae-button v-if="isChanged" face="round" fill="primary" @click="updatePreview">Update Preview</ae-button>
            <ae-button v-else face="round" fill="primary" @click="submit">Continue</ae-button>
          </div>
        </div>
        <div v-else class="mt-8 relative">
          <ae-loader class="ae-loader-scaling"></ae-loader>
          <div class="absolute ae-loader-progress w-full">{{transformedImage.progress}}%</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

  export default {
    name: 'Render',
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
      updatePreview() {
        this.$store.dispatch(`updateSettings`, {
          color: this.currentColor,
          threshold: Number(this.threshold)
        });
      },
      changeColor(index) {
        this.currentColor = index;
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
</style>
