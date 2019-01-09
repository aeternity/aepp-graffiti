<template>
  <div>

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
      <h2 class="w-full text-center mb-4">Your Account</h2>
      <ae-card fill="primary">
        <ae-address copyToClipboard="" :value=pub length="medium" gap=0></ae-address>
      </ae-card>
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
</template>

<script>
  // TODO switch to mono-l typeface if available
  import CanvasWithControlls from './CanvasWithControlls.vue'
  import Aepp from 'AE_SDK_MODULES/ae/aepp'
  import axios from 'axios'
  import InfoLayer from '@/components/InfoLayer'

  export default {
    name: 'Confirm',
    components: { InfoLayer, CanvasWithControlls },
    data () {
      return {
        bidPerDronetime: 0,
        pub: 'ak_QY8VNEkhj7omMUjAvfVBq2NjTDy895LBYbk7qVxQo1qT8VqfE',
        balance: 0,
        client: null,
        ipfsAddr: null
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
      }
    },
    methods: {
      back () {
        this.$router.push('positioning')
      },
      async next () {
        // TODO do smart contract stuff
        try {
          const data = new FormData()
          const file = this.dataURItoBlob(this.transformedImage.src)
          console.log(file)
          data.append('image', file)
          const response = await axios.post('https://ae-art-server.piwo.app/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } })
          this.ipfsAddr = response.data.hash
          console.log(this.ipfsAddr)

          await this.runBid()

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
        // args: hash, x, y, time
        // amount: ae to contract amount
        const calledBid = await this.client.contractCall(this.blockchainSettings.contractAddress, 'sophia-address', this.blockchainSettings.contractAddress, 'bid', {
          args: `("${this.ipfsAddr}", ${this.position.x}, ${this.position.y}, ${Math.round(this.transformedImage.dronetime / 1000)})`,
          options: { amount: this.bid }
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
