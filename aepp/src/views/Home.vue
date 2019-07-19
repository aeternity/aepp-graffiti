<template>
  <div>
    <WhiteHeader title="Drone Graffiti"></WhiteHeader>

    <div class="w-full h-full">
      <NativeCanvas
        @error="showConnectionError"
        @reloadSuccess="reloadingDone(true)"
        @reloadFail="reloadingDone(false)"
        :height="height"
        :draggable=true
        :fill-scale=true
        ref="canvas"></NativeCanvas>
    </div>
    <div class="absolute bottom-0 mb-8 flex justify-center w-full" @click="reloadingResult = null" v-show="reloadingResult">
      <Toast>
        {{reloadingResult}}
      </Toast>
    </div>
    <div @click="$router.push('contribute')" class="fixed bottom-0 right-0 p-8">
      <ae-icon name="plus" fill="primary" face="round"
               class="ae-icon-size shadow"></ae-icon>
    </div>
    <div @click="reloadCanvas" class="fixed bottom-0 p-8 " :class="{ spinning: isReloading }">
      <ae-icon name="reload" fill="primary" face="round"
               class="ae-icon-size shadow"></ae-icon>
    </div>
    <CriticalErrorOverlay
      :error="error"
      @continue="errorClick"
      :errorCTA="errorCTA"
    ></CriticalErrorOverlay>
  </div>
</template>

<script>
  import WhiteHeader from '~/components/WhiteHeader'
  import { AeIcon } from '@aeternity/aepp-components/'
  import CriticalErrorOverlay from '~/components/CriticalErrorOverlay'
  import NativeCanvas from '../components/NativeCanvas'
  import Toast from '../components/Toast'
  import aeternity from '../utils/aeternityNetwork.js'
  import axios from 'axios'

  export default {
    name: 'Home',
    components: { Toast, NativeCanvas, CriticalErrorOverlay, AeIcon, WhiteHeader },
    data () {
      return {
        height: window.innerHeight - 64,
        errorClick: () => {},
        error: null,
        errorCTA: null,
        ignoreErrors: (window.location.host.includes('localhost')),
        isReloading: false,
        reloadingResult: null
      }
    },
    computed: {
      firstTimeOpened () {
        return this.$store.state.firstTimeOpened
      }
    },
    methods: {
      reloadCanvas () {
        if(this.isReloading) return
        this.isReloading = true
        this.$refs.canvas.reloadBackgroundImage()
      },
      reloadingDone(success) {
        this.isReloading = false
        this.reloadingResult = success ? 'Reload successful' : 'Reload failed';
        setTimeout(() => this.reloadingResult = null, 2000)
      },
      showConnectionError () {
        // ALREADY SHOWED AN ERROR?
        if (this.error || this.ignoreErrors) return

        // SET ERROR
        this.error = 'Could not connect to our server. Please make sure you are online.'
        this.errorCTA = 'Retry'
        this.errorClick = this.$router.go
      }
    },
    async mounted () {
      if (this.firstTimeOpened) return this.$router.push('onboarding')
      try {
        // Top up users balance if user is on testnet and balance is smaller than 5
        if (aeternity.isTestnet() && aeternity.balance <= 5) {
          await axios.post(`https://testnet.faucet.aepps.com/account/${aeternity.address}`, {}, { headers: { 'content-type': 'application/x-www-form-urlencoded' } }).catch(console.error)
        }
      } catch (e) {
        console.error(e)
      }

    }
  }
</script>

<style scoped>
  .ae-icon-size {
    transform: scale(1.8)
  }

  @keyframes spin {
    from {transform:rotate(360deg);}
    to {transform:rotate(0deg);}
  }

  .spinning {
    animation-name: spin;
    animation-duration: 2000ms;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
  }

</style>
