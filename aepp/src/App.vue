<template>
  <div id="app" class="min-h-screen">
    <div class="content min-h-screen">
      <ae-main class="min-h-screen">
        <router-view v-if="clientAvailable"></router-view>
        <div class="inset-0 flex justify-center flex-col items-center" v-else>
          <BiggerLoader></BiggerLoader>
          <h2 class="mt-2 font-bold">Looking for a wallet. Check for popups.</h2>
        </div>
      </ae-main>
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
  import BiggerLoader from './components/BiggerLoader'

  export default {
    name: 'app',
    components: { BiggerLoader, CriticalErrorOverlay, AeMain },
    data () {
      return {
        error: null,
        errorCTA: null,
        clientAvailable: false,
        ignoreErrors: (window.location.host.includes('localhost') || window.location.host.includes('0.0.0.0')),
        errorClick: () => {}
      }
    },
    async created () {
      // Bypass check if we are on desktop
      if (this.$route.path.includes('desktop') || this.$route.path.includes('bid')) return this.clientAvailable = true
      // Bypass check if there is already an active wallet
      try {
        if (aeternity.hasActiveWallet()) {
          return this.clientAvailable = true
        } else if (aeternity.client && !aeternity.contract) {
          await aeternity.initProvider()
          return this.clientAvailable = true
        }

        // check if wallet is available
        const wallets = await aeternity.checkAvailableWallets()
        if (wallets.length === 0) throw new Error('Neither mobile nor desktop aepp found.')
        if (wallets.length > 1) {
          // TODO two wallets found
          alert('TWO WALLETS')
        }

        if (!(await aeternity.initClient())) {
          throw new Error('Wallet init failed')
        }

        this.clientAvailable = true

        //await wallet.init()
        //console.log(wallet.walletName)
      } catch (e) {
        console.error('INIT ERROR', e)
        this.error = 'Could not connect to your wallet. Please make sure you grant this application access to your wallet.'
        this.errorCTA = 'Retry'
        this.errorClick = () => {
          window.location.reload()
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
    overflow-y: auto;
  }
</style>
