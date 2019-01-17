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
      <div v-show="isReady">
        <div class="w-full">
          <img ref="previewImage" :src="transformedImage.src"/>
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
              <div class="flex flex-row mb-4">
                <ae-switch
                  class="w-full"
                  @input="updateValue"
                  name="example"
                  :choices="[
                    { label: 'Photo', value: 'photo' },
                    { label: 'Illustration', value: 'illustration' },
                  ]"
                  :default="this.centerline ? 'illustration' : 'photo'"
                />
              </div>
            </div>
            <div v-if="showIllustration">
              <div>
                <ae-label class="no-margin">Color threshold</ae-label>
                <div class="flex flex-row justify-space items-center">
                  <div class="w-2/3">
                    <input class="max-w-full" type="range" step="1" min="0" max="100" v-model="binaryThreshold"/>
                  </div>
                  <div class="w-1/3">
                    <ae-input class="no-margin" type="number" v-model="binaryThreshold"></ae-input>
                  </div>
                </div>
              </div>
              <div>
                <ae-label class="no-margin">Stroke weight</ae-label>
                <div class="flex flex-row justify-space items-center">
                  <div class="w-2/3">
                    <input class="max-w-full" type="range" step="1" min="1" max="20" v-model="dilationRadius"/>
                  </div>
                  <div class="w-1/3">
                    <ae-input class="no-margin" type="number" v-model="dilationRadius"></ae-input>
                  </div>
                </div>
              </div>
            </div>
            <div v-else>
              <div>
                <ae-label class="no-margin">Blur Radius</ae-label>
                <div class="flex flex-row justify-space items-center">
                  <div class="w-2/3">
                    <input class="max-w-full" type="range" step="1" min="1" max="10" v-model="blurKernel"/>
                  </div>
                  <div class="w-1/3">
                    <ae-input class="no-margin" type="number" v-model="blurKernel"></ae-input>
                  </div>
                </div>
              </div>
              <div>
                <ae-label class="no-margin">Threshold</ae-label>
                <div class="flex flex-row justify-space items-center">
                  <div class="w-2/3">
                    <input class="max-w-full" type="range" step="1" min="1" max="100"
                           v-model="hysteresisHighThreshold"/>
                  </div>
                  <div class="w-1/3">
                    <ae-input class="no-margin" type="number" v-model="hysteresisHighThreshold"></ae-input>
                  </div>
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
              <ae-text face="uppercase-base" weight="bold">Upload new Image</ae-text>
            </ae-list-item>
          </ae-list>
        </div>
      </div>
      <div v-show="isLoading">
        <BiggerLoader></BiggerLoader>
      </div>
    </div>
  </div>
</template>

<script>

  import InfoLayer from '@/components/InfoLayer'
  import BiggerLoader from "../components/BiggerLoader";

  const STATUS_LOADING = 1, STATUS_READY = 2

  export default {
    name: 'Render',
    components: {BiggerLoader, InfoLayer},
    data() {
      return {
        hysteresisHighThreshold: 50,
        currentColor: 0,
        centerline: true,
        blurKernel: 4,
        binaryThreshold: 45,
        dilationRadius: 4,
        status: STATUS_LOADING,
        progress: -1
      }
    },
    computed: {
      isChanged() {
        return Number(this.threshold) !== this.settings.threshold ||
          Number(this.currentColor) !== this.settings.color ||
          Number(this.hysteresisHighThreshold) !== this.settings.hysteresisHighThreshold ||
          Number(this.centerline) !== this.settings.centerline ||
          Number(this.blurKernel) !== this.settings.blurKernel ||
          Number(this.binaryThreshold) !== this.settings.binaryThreshold ||
          Number(this.dilationRadius) !== this.settings.dilationRadius
      },
      transformedImage() {
        return this.$store.state.transformedImage
      },
      originalImage() {
        return this.$store.state.originalImage
      },
      settings() {
        return this.$store.state.settings
      },
      droneSettings() {
        return this.$store.state.droneSettings
      },
      showIllustration() {
        return this.centerline
      },
      isLoading() {
        return this.status === STATUS_LOADING
      },
      isReady() {
        return this.status === STATUS_READY
      }
    },
    methods: {
      back() {
        this.$router.push('contribute')
      },
      submit() {
        this.$router.push('positioning')
      },
      updateValue(val) {
        this.centerline = (val !== 'photo');
      },
      async updatePreview() {
        this.status = STATUS_LOADING
        console.log("loading");
        await this.$store.dispatch(`updateSettings`, {
            color: Number(this.currentColor),
            threshold: Number(this.threshold),
            hysteresisHighThreshold: Number(this.hysteresisHighThreshold),
            centerline: Number(this.centerline),
            blurKernel: Number(this.blurKernel),
            binaryThreshold: Number(this.binaryThreshold),
            dilationRadius: Number(this.dilationRadius)
          })
        this.status = STATUS_READY
      },
      changeColor(index) {
        this.currentColor = index
      },
      progressCallback(progress) {
        const progress100 = Math.round(progress * 100);
        if (this.progress !== progress100) {
          console.log("UPDATING", progress100)
        }
      }
    },
    created() {
      this.threshold = this.settings.threshold
      this.currentColor = this.settings.color
      this.hysteresisHighThreshold = this.settings.hysteresisHighThreshold
      this.centerline = this.settings.centerline
      this.blurKernel = this.settings.blurKernel
      this.binaryThreshold = this.settings.binaryThreshold
      this.dilationRadius = this.settings.dilationRadius
      this.$store.dispatch('registerProgressCallback', this.progressCallback)
    },
    async mounted() {
      await this.$store.dispatch(`transformImage`)
      this.status = STATUS_READY
    },
    beforeDestroy() {
      this.$store.dispatch('removeProgressCallback')
    }
  }
</script>

<style scoped>
  .no-margin {
    margin: 0 !important;
  }

  .ae-color-active {
    border: 3px solid #ff0d6a;
    box-shadow: 0px 0px 10px;
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
