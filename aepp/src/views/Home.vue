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
    <CriticalErrorOverlay
      :error="error"
      :errorClick="errorClick"
      :errorCTA="errorCTA"
    ></CriticalErrorOverlay>
  </div>
</template>

<script>
  import CanvasJS from '~/components/CanvasJS.vue'
  import WhiteHeader from '~/components/WhiteHeader'
  import { AeIcon } from '@aeternity/aepp-components/'
  import Aepp from '@aeternity/aepp-sdk/es/ae/aepp'
  import Util from '~/utils/blockchain_util'
  import axios from 'axios'
  import bugsnagClient from '~/utils/bugsnag'
  import CriticalErrorOverlay from '~/components/CriticalErrorOverlay'

  export default {
    name: 'Home',
    components: { CriticalErrorOverlay, AeIcon, WhiteHeader, CanvasJS },
    data () {
      return {
        height: window.innerHeight - 64,
        errorClick: () => {},
        error: null,
        errorCTA: null,
        ignoreErrors: (window.location.host.includes('localhost')),
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
      }
    },
    async mounted () {
      if (this.firstTimeOpened) return this.$router.push('onboarding')
      try {
        const client = await Aepp()
        const address = await client.address()
        const balance = await client.balance(address, {format: false}).then(Util.atomsToAe).catch(() => 0);
        console.log('balance', balance);
        if (balance <= 5) {
          await axios.post(`https://testnet.faucet.aepps.com/account/${address}`, {}, {headers: {'content-type': 'application/x-www-form-urlencoded'}})
        }
        try {
          this.$matomo.setUserId(address)
          bugsnagClient.user = { address }
        } catch (e) {
          console.error('Tracking failed')
          console.error(e)
        }

      } catch (e) {
        console.error(e)
        bugsnagClient.notify(e)
      }
    }
  }
</script>

<style scoped>
  .ae-icon-size {
    transform: scale(1.8)
  }

</style>
