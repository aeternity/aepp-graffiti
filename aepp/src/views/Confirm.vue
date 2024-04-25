<template>
  <div>
    <div v-if="isLoading">
      <div class="w-full pl-4 pr-4 pt-8 flex">
        <h1 class="w-full text-center text-3xl">Processing Bid</h1>
      </div>
      <div class="w-full p-4 flex flex-col">
        <LoadingStep :currentStep="currentLoadingStep" :activeStep="0" :errorStep="errorStep">Processing Data
        </LoadingStep>
        <LoadingStep :currentStep="currentLoadingStep" :active-step="1" :errorStep="errorStep">Uploading to IPFS
        </LoadingStep>
        <LoadingStep :currentStep="currentLoadingStep" :active-step="2" :errorStep="errorStep">Running Smart Contract
        </LoadingStep>

        <div class="w-full p-4 text-center">
          <div v-if="currentLoadingStep === 3" class="font-mono text-lg text-grey-darkest">
            <span>Congratulations<br/>Bid placed successfully</span>
            <ae-button extend class="mt-8" face="round" fill="neutral" @click="$router.push('overview')">Continue to Bid
              Status
            </ae-button>
          </div>
          <div v-if="errorStep" class="font-mono text-lg text-red-600">
            <span>Oh no :(<br/>Bid placement failed</span>
            <ae-button extend class="mt-8" face="round" fill="neutral" @click="$router.push('amount')">Try again
            </ae-button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="isInitial">
      <div class="w-full pl-4 pr-4 flex">
        <h1 class="w-full text-center">Your Bid</h1>
      </div>
      <div class="w-full">
        <CanvasWithControlls :draggable="false"></CanvasWithControlls>
      </div>
      <div class="w-full p-4">
        <h2 class="w-full text-center mb-4">Required Time</h2>
        <ae-text face="mono-xl" class="text-center">{{transformedImage.dronetime}} Minutes</ae-text>
      </div>
      <div class="w-full p-4">
        <ae-list>
          <ae-list-item>
            <ae-button face="round" fill="primary" @click="next" extend>Place Bid</ae-button>
          </ae-list-item>
          <ae-list-item @click="back" class="justify-center">
            <ae-text face="uppercase-base" weight="bold">Back</ae-text>
          </ae-list-item>
        </ae-list>
      </div>
    </div>

  </div>
</template>

<script>
  import CanvasWithControlls from '../components/CanvasWithControlls.vue'
  import axios from 'axios'
  import LoadingStep from '~/components/LoadingStep'
  import Util from '~/utils/blockchainUtil'
  import { AeButton, AeList, AeListItem, AeText } from '@aeternity/aepp-components/src/components'
  import config from '~/config'
  import aeternity from '~/utils/aeternityNetwork'

  const STATUS_INITIAL = 1, STATUS_LOADING = 2
  const LOADING_DATA = 0, LOADING_IPFS = 1, LOADING_CONTRACT = 2, LOADING_FINISHED = 3

  export default {
    name: 'Confirm',
    components: { LoadingStep, CanvasWithControlls, AeText, AeList, AeListItem, AeButton },
    data () {
      return {
        balance: 0,
        client: null,
        ipfsAddr: null,
        currentStatus: STATUS_LOADING,
        currentLoadingStep: LOADING_DATA,
        errorStep: null
      }
    },
    computed: {
      transformedImage () {
        return this.$store.state.transformedImage
      },
      position () {
        return this.$store.state.position
      },
      blockchainSettings () {
        return config.blockchainSettings
      },
      isInitial () {
        return this.currentStatus === STATUS_INITIAL
      },
      isLoading () {
        return this.currentStatus === STATUS_LOADING
      },
      bid () {
        return this.$store.state.bid
      }
    },
    methods: {
      back () {
        this.$router.push('slots')
      },

      async resetView () {
        this.currentStatus = STATUS_LOADING
        this.currentLoadingStep = LOADING_DATA
        this.errorStep = null
        await this.next()
      },
      async next () {
        try {
          this.currentStatus = STATUS_LOADING

          this.currentLoadingStep = LOADING_DATA

          const data = new FormData()
          const file = this.dataURItoBlob(this.transformedImage.src)
          data.append('image', file)

          this.currentLoadingStep = LOADING_IPFS
          try {
            const response = await axios.post(`${config.apiUrl[aeternity.networkId]}/upload`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
            this.ipfsAddr = response.data.hash
          } catch (e) {
            console.error(e)
            return this.errorStep = LOADING_IPFS
          }

          this.currentLoadingStep = LOADING_CONTRACT
          try {
            await this.runBid()
            this.currentLoadingStep = LOADING_FINISHED
            this.$store.dispatch('resetState')
          } catch (e) {
            console.error(e)
            return this.errorStep = LOADING_CONTRACT
          }

        } catch (e) {
          this.errorStep = LOADING_DATA
          console.error(e)
        }

      },
      dataURItoBlob (dataURI) {
        // convert base64 to raw binary data held in a string
        // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
        const byteString = atob(dataURI.split(',')[1])

        // write the bytes of the string to an ArrayBuffer
        const ab = new ArrayBuffer(byteString.length)
        const ia = new Uint8Array(ab)
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i)
        }

        // write the ArrayBuffer to a blob, and you're done
        return new Blob([ab], { type: 'image/svg+xml' })
      },
      async runBid () {
        // args: hash, x, y, time
        // amount: ae to contract amount
        try {
          await aeternity.contract.place_bid(
            this.bid.slotId,
            Math.round(this.transformedImage.dronetime),
            this.ipfsAddr,
            this.position.x,
            this.position.y,
            { amount: Util.aeToAtoms(this.bid.amount).toFixed(), gas: 300000 })
        } catch (e) {
          console.error(e)
          throw Error(JSON.stringify(e.decodedResult))
        }
      }
    },
    async created () {
      await this.next()
    }
  }
</script>

<style scoped>

</style>
