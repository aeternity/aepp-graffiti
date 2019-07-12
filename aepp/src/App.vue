<template>
  <div id="app" class="min-h-screen">
    <div class="content min-h-screen">
      <ae-main class="min-h-screen">
        <router-view></router-view>
      </ae-main>
      <!-- Find the docs for the component here: http://aeternity.com/aepp-components/ -->
    </div>
    <CriticalErrorOverlay
      :error="error"
      @continue="errorClick"
      :errorCTA="errorCTA"
    ></CriticalErrorOverlay>
  </div>
</template>

<script>

  import { AeMain } from '@aeternity/aepp-components'
  import CriticalErrorOverlay from '~/components/CriticalErrorOverlay'
  import aeternity from '~/utils/aeternityNetwork.js'

  export default {
    name: 'app',
    components: { CriticalErrorOverlay, AeMain },
    data () {
      return {
        error: null,
        errorCTA: null,
        ignoreErrors: (window.location.host.includes('localhost') || window.location.host.includes('0.0.0.0')),
        errorClick: () => {}
      }
    },
    async created () {
      // Bypass check if we are on desktop
      if (this.$route.path.includes('desktop') || this.$route.path.includes('bid')) return

      // check if wallet is available
      try {
        // base-aepp and reverse iframe

        const wallets = await aeternity.checkAvailableWallets()
        if (wallets.length === 0) throw new Error('Neither mobile nor desktop aepp found.')
        if (wallets.length > 1) {
          // TODO two wallets found
        }

        //await wallet.init()
        //console.log(wallet.walletName)
      } catch (e) {
        console.error('INIT ERROR', e)
        this.error = 'Could not connect to your wallet. Please make sure you run this application inside the base aepp.'
        this.errorCTA = 'Go to Base Aepp'
        this.errorClick = () => {
          window.location.href = 'https://base.aepps.com'
        }

      }
    }
  }
</script>

<style scoped>
  .min-h-screen {
    min-height: 100vh;
    max-height: 100vh;
    padding-bottom: 0;
    overflow-y: auto
  }
</style>
