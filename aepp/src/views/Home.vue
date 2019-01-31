<template>
  <div>
    <WhiteHeader title="Drone Graffiti"></WhiteHeader>

    <div class="w-full h-full">
      <CanvasJS @error="showConnectionError" :height="height" :draggable=true :fill-scale=true ref="canvas"></CanvasJS>
    </div>
    <div @click="$router.push('contribute')" class="absolute pin-b pin-r p-8 ">
      <ae-icon name="plus" fill="primary" face="round"
               class="ae-icon-size shadow"></ae-icon>
    </div>
    <div @click="reloadCanvas" class="absolute pin-b p-8 ">
      <ae-icon name="reload" fill="primary" face="round"
               class="ae-icon-size shadow"></ae-icon>
    </div>
    <ae-backdrop class="p-6" v-show="error">
      <ae-card>
        <div class="w-full">
          <h1 class="font-mono text-red text-center pt-4">ERROR</h1>
          <p class="text-base text-red pt-4 text-center">
            {{error}}
          </p>
          <div class="flex justify-center mt-6">
            <ae-button fill="primary" face="round" @click="errorClick">{{errorCTA}}</ae-button>
          </div>
        </div>
      </ae-card>
    </ae-backdrop>
  </div>
</template>

<script>
  import CanvasJS from '@/components/CanvasJS.vue'
  import WhiteHeader from '@/components/WhiteHeader'
  import { AeBackdrop, AeButton, AeCard, AeIcon } from '@aeternity/aepp-components/'
  import Aepp from '@aeternity/aepp-sdk/es/ae/aepp'
  import Util from '@/utils/blockchain_util'
  import axios from 'axios'

  export default {
    name: 'Home',
    components: { AeButton, AeBackdrop, AeIcon, AeCard, WhiteHeader, CanvasJS },
    data () {
      return {
        height: window.innerHeight - 64,
        errorClick: () => {},
        error: null,
        errorCTA: null,
        ignoreErrors: true
      }
    },
    computed: {
      firstTimeOpened () {
        return this.$store.state.firstTimeOpened
      }
    },
    methods: {
      reloadCanvas () {
        this.$refs.canvas.updateBackgroundImage()
      },
      showConnectionError () {
        // ALREADY SHOWED AN ERROR?
        if(this.error || this.ignoreErrors) return

        // SET ERROR
        this.error = 'Could not connect to our server. Please make sure you are online.'
        this.errorCTA = 'Retry'
        this.errorClick = this.$router.go
      },
      showBaseAppError () {
        // ALREADY SHOWED AN ERROR?
        if(this.error || this.ignoreErrors) return

        // SET ERROR
        this.error = 'Could not connect to your wallet. Please make sure you run this application inside the base app.'
        this.errorCTA = 'Go to Base Aepp'
        this.errorClick = () => {
          window.location.href = 'https://base-aepp.dronegraffiti.com/'
        }
      }
    },
    async mounted () {
      if (this.firstTimeOpened) return this.$router.push('onboarding')
      try {
        if(window.parent !== window) {
          const client = await Aepp()
          console.log(await client.post('hello'))
          const address = await client.address()
          const balance = await client.balance(address, {format: false}).then(Util.atomsToAe).catch(() => 0);
          console.log('balance', balance);
          if (balance <= 5) {
            await axios.post(`https://testnet.faucet.aepps.com/account/${address}`, {}, {headers: {'content-type': 'application/x-www-form-urlencoded'}})
          }
          try {
            this.$matomo.setUserId(address)
          } catch (e) {
            console.error('Tracking failed')
            console.error(e)
          }
        } else {
          this.showBaseAppError();
        }
      } catch (e) {
        console.error(e)
        this.showBaseAppError();
      }
    }
  }
</script>

<style scoped>
  .ae-icon-size {
    transform: scale(1.8)
  }

</style>
