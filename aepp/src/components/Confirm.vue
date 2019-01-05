<template>
  <div>
    <div class="w-full pl-4 pr-4 flex">
      <h1 class="w-full text-center">Your Bid</h1>
    </div>
    <div class="w-full pl-4 pr-4 flex">
      <CanvasWithControlls :draggable="false"></CanvasWithControlls>
    </div>
    <div class="w-full p-4">
      <h2 class="w-full text-center mb-4">Required Time</h2>
      <ae-text face="mono-xl" class="text-center">{{transformedImage.dronetime / 1000}} Seconds</ae-text>
    </div>
    <div class="w-full p-4">
      <h2 class="w-full text-center mb-4">Your Account</h2>
      <ae-card fill="primary">
        <template slot="avatar">
          <ae-identicon :address=pub />
        </template>
        <ae-address :value=pub length="medium" gap=0 />
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
    <div class="w-full p-4 flex justify-center">
      <ae-button class="mr-4" face="round" fill="neutral" @click="back">Back</ae-button>
      <ae-button face="round" fill="primary" @click="next">Continue</ae-button>
    </div>
  </div>
</template>

<script>
  // TODO switch to mono-l typeface if available
  import CanvasWithControlls from './CanvasWithControlls.vue'
  import Aepp from 'AE_SDK_MODULES/ae/aepp'
  //import IPFS from 'ipfs'

  export default {
    name: 'Confirm',
    components: { CanvasWithControlls },
    data () {
      return {
        bidPerDronetime: 0,
        pub: "ak_QY8VNEkhj7omMUjAvfVBq2NjTDy895LBYbk7qVxQo1qT8VqfE",
        balance: 0,
        client: null
      }
    },
    computed: {
      bid () {
        return this.bidPerDronetime * this.transformedImage.dronetime / 1000
      },
      transformedImage() {
        return this.$store.state.transformedImage
      }
    },
    methods: {
      back () {
        this.$router.push('positioning')
      },
      next () {
        // TODO do smart contract stuff

      }
    },
    created () {
      Aepp().then(async ae => {
        console.log('client: ', ae)
        this.client = ae
        ae.address()
          .then(address => {
            this.pub = address
            ae.balance(address).then(balance => {
              // logs current balance of "A_PUB_ADDRESS"
              console.log('balance', balance)
              this.balance = Number(balance);
            })
          })

        const contractAddress = 'ct_XPuc7U9qiccPn33uvNSeDaRpjJZ7i6XMsyWyp5bXdLsngUAVs';
        const calledMyBids = await this.client.contractCall(contractAddress, 'sophia-address', contractAddress, 'all_bids', {args: '()'}).catch(e => console.error(e));
        console.log('calledMyBids', calledMyBids);

        const decodedMyBids = await this.client.contractDecodeData('list((address, string, (int, int), int, int))', calledMyBids.result.returnValue).catch(e => console.error(e));
        console.log('decodedMyBids', decodedMyBids);

      })
    },
    mounted () {

    }
  }
</script>

<style scoped>
  .text-5xl {
    font-size: 3em;
  }
</style>
