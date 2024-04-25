<template>
  <div id="app" class="min-h-screen">
    <div class="content min-h-screen">
      <div class="min-h-screen bg-gray-900">
        <router-view v-if="clientAvailable"></router-view>
        <div class="inset-0 flex justify-center flex-col items-center" v-else>
          <BiggerLoader></BiggerLoader>
          <h2 class="mt-2 font-bold">Looking for a wallet. Check for popups.</h2>
        </div>
      </div>
    </div>
    <CriticalErrorOverlay
      :error="error"
      @continue="errorClick"
      :errorCTA="errorCTA"
    ></CriticalErrorOverlay>
  </div>
</template>

<script>

  import { AeMain } from '@aeternity/aepp-components/src/components'
  import CriticalErrorOverlay from '~/components/CriticalErrorOverlay'
  import aeternity from './utils/aeternityNetwork.js'
  import BiggerLoader from './components/BiggerLoader'
  import { EventBus } from './utils/eventBus';
  import {wallet} from './utils/walletSearch.js'

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
      if (this.$route.path.includes('desktop') || this.$route.path.includes('bid') || this.$route.path.includes('landingpage'))
        return this.clientAvailable = true
      // Bypass check if there is already an active wallet
      try {

        EventBus.$on('networkChange', () => this.$router.go(0));
        EventBus.$on('addressChange', () => this.$router.go(0));

        if (aeternity.hasActiveWallet()) {
          return this.clientAvailable = true
        }

        await wallet.initWalletOrFallbackStatic();
        this.clientAvailable = true;

        if (aeternity.static) {
          console.error('Wallet init failed');
          return await this.$router.push('landingpage');
        }
      } catch (e) {
        console.error('INIT ERROR', e)
        this.error = 'Could not connect to your wallet.'
        this.errorCTA = 'Ok'
        this.errorClick = () => {
          this.$router.push('landingpage')
          this.$router.go(0)
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
