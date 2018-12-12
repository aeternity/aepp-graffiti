<template>
  <div>
    <div class="w-full pl-4 pr-4 flex">
      <h1 class="w-full text-center">Your Bid</h1>
    </div>
    <div class="w-full pl-4 pr-4 flex">
      <CanvasWithControlls></CanvasWithControlls>
    </div>
    <div class="w-full p-4">
      <h2 class="w-full text-center mb-4">Your Account</h2>
      <ae-identity :address="pub" :balance="balance"></ae-identity>
    </div>
    <div class="w-full p-4">
      <h2 class="w-full text-center mb-4">Your Bid</h2>
      <p class="text-center text-5xl" style="font-size: 3rem">{{ bid }} AE</p>
      <ae-input type="number" v-model="bidPerDronetime"></ae-input>
    </div>
    <div class="w-full p-4 flex justify-center">
      <ae-button class="mr-4" size="medium" type="normal" @click="back">Back</ae-button>
      <ae-button size="medium" type="dramatic" @click="next">Continue</ae-button>
    </div>
  </div>
</template>

<script>
  import CanvasWithControlls from './CanvasWithControlls.vue'
  import Aepp from 'AE_SDK_MODULES/ae/aepp'

  export default {
    name: 'Confirm',
    components: { CanvasWithControlls },
    data() {
      return {
        dronetime: 10,
        bidPerDronetime: 0,
        pub: '',
        balance: 0
      }
    },
    computed: {
      bid() {
        return this.bidPerDronetime * this.dronetime
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
      Aepp().then(ae => {
        console.log('client: ', ae)
        this.client = ae
        ae.address()
          .then(address => {
            this.pub = address
            ae.balance(address).then(balance => {
              // logs current balance of "A_PUB_ADDRESS"
              console.log('balance', balance)
            })
          })

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
