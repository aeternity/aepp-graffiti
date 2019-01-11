<template>
  <div class="w-full p-4 flex justify-center flex-col bg-grey h-screen">
    <h1 class="mb-4">Identity (BASE) Aepp</h1>

    <div class="border">
      <div class="bg-green w-full flex flex-row font-mono border border-b">
        <div class="p-2 w-1/4">
          Public Key
        </div>
        <div class="p-2 w-3/4 bg-grey-lightest break-words">
          {{pub}}
        </div>
      </div>
      <div v-if="height" class="bg-green w-full flex flex-row font-mono border border-b">
        <div class="p-2 w-1/4">
          Height
        </div>
        <div class="p-2 w-3/4 bg-grey-lightest">
          {{height}}
        </div>
      </div>
      <div v-if="height" class="bg-green w-full flex flex-row font-mono">
        <div class="p-2 w-1/4">
          Balance
        </div>
        <div class="p-2 w-3/4 bg-grey-lightest">
          {{balance}}
        </div>
      </div>
    </div>

    <div v-if="!aeppUrl" class="w-full p-4 h-64 border border-black border-dashed shadow mx-auto mt-4 bg-grey-lighter">
      Loading Aepp...
    </div>
    <!-- external app -->
    <iframe v-show="aeppUrl" ref="aepp" class="w-full h-screen border border-black border-dashed bg-grey-light mx-auto mt-4 shadow" src="about:blank" frameborder="1"></iframe>

  </div>
</template>

<script>
// AE_SDK_MODULES is a webpack alias present in webpack.config.js
import Wallet from 'AE_SDK_MODULES/ae/wallet'
import MemoryAccount from 'AE_SDK_MODULES/account/memory'

export default {
  name: 'Wallet',
  components: {},
  data () {
    return {
      pub: 'ak_twR4h7dEcUtc2iSEDv8kB7UFJJDGiEDQCXr85C3fYF8FdVdyo',
      priv: '79816bbf860b95600ddfabf9d81fee81bdb30be823b17d80b9e48be0a7015adf75ee9825ad630963482bb1939a212a0e535883c6b4d7804e40287e1f556da272',
      client: null,
      wallet: null,
      balance: null,
      height: null,
      aeppUrl: '//0.0.0.0:8081'
    }
  },
  computed: {
  },
  methods: {
    confirmDialog (method, params, {id}) {
      // return new Promise((resolve, reject) => { resolve ('test') })
      //return Promise.resolve(window.confirm(`User ${id} wants to run ${method} ${params}`));
      console.log(`User ${id} wants to run ${method} ${params}`)
      return Promise.resolve(true);
    }
  },
  created () {
    window.addEventListener('message', console.log, false)

    Wallet({
      url: 'https://ae-uat.piwo.app',
      internalUrl: 'http://51.15.237.173:4113',
      accounts: [MemoryAccount({keypair: {secretKey: this.priv, publicKey: this.pub}})],
      address: this.pub,
      onTx: this.confirmDialog,
      onChain: this.confirmDialog,
      onAccount: this.confirmDialog,
      onContract: this.confirmDialog
    }).then(ae => {
      this.client = ae
      console.log('status', this.client.api.getTopBlock())
      console.log('version', this.client.api.getStatus())
      this.$refs.aepp.src = this.aeppUrl

      ae.height().then(height => {
        console.log('height', height)
        this.height = height
      })
      console.log(ae)

      ae.balance(this.pub).then(balance => {
        console.log('balance', balance)
        this.balance = balance
      }).catch(() => {
        this.balance = 0
      })
    })
  }
}
</script>

<style scoped lang="css">
</style>
