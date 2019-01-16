<template>
  <div>
    <div v-if="isLoading">
      <div class="w-full pl-4 pr-4 flex">
        <h1 class="w-full text-center">Processing Bid</h1>
      </div>
      <div class="w-full p-4 flex flex-col">
        <LoadingStep :currentStep="currentLoadingStep" :activeStep="0">Processing Data</LoadingStep>
        <LoadingStep :currentStep="currentLoadingStep" :active-step="1">Uploading to IPFS</LoadingStep>
        <LoadingStep :currentStep="currentLoadingStep" :active-step="2">Running Smart Contract</LoadingStep>

        <div class="w-full p-4 text-center">
          <div v-if="currentLoadingStep === 3" class="font-mono text-lg text-grey-darkest">
            <span>Congratulations<br />Bid Successful</span>
            <ae-button extend class="mt-8" face="round" fill="primary" @click="$router.push('overview')">Continue to Bid Status</ae-button>
          </div>
        </div>
        <div>

        </div>
      </div>
    </div>
    <div v-if="isInitial">
      <InfoLayer>
        <h2>Bidding</h2>
        <p class="p-4 pb-0">
          On the bottom you can enter the AE you wish to spend per second for this image. Once you tap continue the bid will be placed and you will be forwarded to your bidding overview.
        </p>
        <p class="p-4 pb-0">
          First there is the final image and its position on the wall. Then we display the time in seconds it takes to paint the image and the account you are bidding from.
        </p>
        <p class="p-4 pb-0">
          On the bottom you can enter the AE you wish to spend per second for this image. Once you tap continue the bid will be placed and you will be forwarded to your bidding overview.
        </p>
        <p class="p-4 pb-0">
          The 0.45 AE are always added to your bid as this is an estimate of the fee you have to pay for the smart contract to execute.
        </p>
      </InfoLayer>

      <div class="w-full pl-4 pr-4 flex">
        <h1 class="w-full text-center">Your Bid</h1>
      </div>
      <div class="w-full">
        <CanvasWithControlls :draggable="false"></CanvasWithControlls>
      </div>
      <div class="w-full p-4">
        <h2 class="w-full text-center mb-4">Required Time</h2>
        <ae-text face="mono-xl" class="text-center">{{transformedImage.dronetime / 1000}} Seconds</ae-text>
      </div>
      <div class="w-full p-4">
        <h2 class="w-full text-center mb-4">AE per Second</h2>
        <ae-input type="number" aemount v-model="bidPerDronetime" label="AE"></ae-input>
      </div>
      <div class="w-full p-4">
        <h2 class="w-full text-center mb-4">Your Total</h2>
        <ae-text face="mono-xl" class="text-center">{{bid}} AE</ae-text>
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
  // TODO switch to mono-l typeface if available
  import CanvasWithControlls from './CanvasWithControlls.vue'
  import Aepp from 'AE_SDK_MODULES/ae/aepp'
  import axios from 'axios'
  import InfoLayer from '@/components/InfoLayer'
  import LoadingStep from '@/components/LoadingStep'

  const STATUS_INITIAL = 1, STATUS_LOADING = 2;
  const LOADING_DATA = 0, LOADING_IPFS = 1, LOADING_CONTRACT = 2, LOADING_FINISHED = 3;

  export default {
    name: 'Confirm',
    components: { LoadingStep, InfoLayer, CanvasWithControlls },
    data () {
      return {
        bidPerDronetime: 0,
        pub: 'ak_QY8VNEkhj7omMUjAvfVBq2NjTDy895LBYbk7qVxQo1qT8VqfE',
        balance: 0,
        client: null,
        ipfsAddr: null,
        currentStatus: STATUS_INITIAL,
        currentLoadingStep: LOADING_DATA
      }
    },
    computed: {
      bid () {
        // Last part is the fee, estimate is stolen from aepp-sdk-js
        return this.bidPerDronetime * this.transformedImage.dronetime / 1000 + 0.45
      },
      transformedImage () {
        return this.$store.state.transformedImage
      },
      position () {
        return this.$store.state.position
      },
      blockchainSettings () {
        return this.$store.state.blockchainSettings
      },
      isInitial() {
        return this.currentStatus === STATUS_INITIAL
      },
      isLoading () {
        return this.currentStatus === STATUS_LOADING
      }
    },
    methods: {
      back () {
        this.$router.push('positioning')
      },
      async next () {
        try {
          this.currentStatus = STATUS_LOADING
          this.currentLoadingStep = LOADING_DATA
          const data = new FormData()
          const file = this.dataURItoBlob(this.transformedImage.src)
          console.log(file)
          data.append('image', file)
          this.currentLoadingStep = LOADING_IPFS
          const response = await axios.post(`${this.$store.state.apiUrl}/upload`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
          this.ipfsAddr = response.data.hash

          this.currentLoadingStep = LOADING_CONTRACT
          await this.runBid()
          this.currentLoadingStep = LOADING_FINISHED
        } catch (e) {
          console.log(e)
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
        const bb = new Blob([ab], { type: 'image/svg' })
        return bb
      },
      async runBid () {
        const auctionSlotId = 1;
        // args: hash, x, y, time
        // amount: ae to contract amount
        const calledBid = await this.client.contractCall(this.blockchainSettings.contractAddress, 'sophia-address', this.blockchainSettings.contractAddress, 'place_bid', {
          args: `(${auctionSlotId}, ${Math.round(this.transformedImage.dronetime / 1000)}, "${this.ipfsAddr}", ${this.position.x}, ${this.position.y})`,
          options: { amount: this.bid * 1000000000000000000 }
        }).catch(async e => {
          console.error(e)
          const decodedError = await this.client.contractDecodeData('string', e.returnValue).catch(e => console.error(e))
          console.log('decodedError', decodedError)
        })

        console.log('calledBid', calledBid)
      }
    },
    created () {
      Aepp().then(async ae => {
        console.log('client: ', ae)
        console.log(ae.Ae, ae.Chain, ae.post, ae.Tx)
        this.client = ae
        ae.address()
          .then(address => {
            this.pub = address
            ae.balance(address).then(balance => {
              // logs current balance of "A_PUB_ADDRESS"
              console.log('balance', balance)
              this.balance = Number(balance)
            })
          })
      })
    }
  }
</script>

<style scoped>

</style>
