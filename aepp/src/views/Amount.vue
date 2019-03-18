<template>
  <div>
    <WhiteHeader :back="back" title="Your Bid"></WhiteHeader>
    <div class="w-full p-8 pb-6">
      <div class="flex justify-center flex-col">
        <h1 class="text-center mb-2">Place your bid</h1>
        <span class="text-xl text-center leading-normal text-grey-darker">
          Your artwork takes the drone <span class="bold-info">{{transformedImage.dronetime}} minutes</span> to paint. How much AE do you want to bid per minute?
        </span>
      </div>
      <div class="mt-8">
        <ae-input type="number" label="Total Bid" step="0.01" placeholder="1" min="0" aemount :value="amount"
                  @input="updateData" :error="!!error">
          <template slot="header">
            <span class="text-grey">AE</span>
          </template>
          <ae-toolbar slot="footer">
            <div class="w-full flex justify-between">
              <span>{{transformedImage.dronetime}} Minutes</span>
              <span class="bold-info">~{{perMinute.toLocaleString('en-US')}} AE per minute</span>
            </div>
          </ae-toolbar>
        </ae-input>
      </div>
      <div class="pt-4 pb-4" v-if="error">
        <span class="text-red">
          {{error}}
        </span>
      </div>
      <div class="w-full mt-8 flex justify-center">
        <ae-button face="round" fill="primary" @click="next" extend>Place Bid</ae-button>
      </div>
    </div>
  </div>
</template>

<script>
  import WhiteHeader from '../components/WhiteHeader'
  import { AeButton, AeInput, AeToolbar } from '@aeternity/aepp-components'
  import Aepp from '@aeternity/aepp-sdk/es/ae/aepp'
  import Utils from '~/utils/blockchain_util'
  import bugsnagClient from '~/utils/bugsnag'

  export default {
    name: 'Amount',
    components: { AeInput, WhiteHeader, AeToolbar, AeButton },
    data () {
      return {
        amount: 10,
        perMinute: 0,
        error: null,
        balance: null
      }
    },
    computed: {
      transformedImage () {
        return this.$store.state.transformedImage
      },
      slotObject () {
        return this.$store.state.bid.slotObject
      }
    },
    methods: {
      updateData (e) {
        if (e === '') {
          this.amount = null
        } else {
          this.amount = e
          this.perMinute = this.amount / this.transformedImage.dronetime
        }
        this.error = null
      },
      back () {
        this.$router.push('slots')
      },
      next () {

        this.error = null

        if (this.remainingDronetime < this.transformedImage.dronetime && this.perMinute < this.slotObject.minimumBid) {
          this.error = `The minimum bid for this slot is ${this.slotObject.minimumBid.toFixed(5)} AE per minute`
        }

        if (this.amount < 0.001) {
          this.error = `The minimum bidding amount is 0.001 AE.`
        }

        if (this.balance.lt(this.amount)) {
          this.error = `Your bid total (${this.amount} AE) exceeds your balance (${this.balance} AE).`
        }

        if (!this.error) {
          this.$store.dispatch('updateBidding', {
            amount: this.amount
          })
          this.$router.push('confirm')
        }

      }
    },
    async mounted () {
      try {
        this.perMinute = this.amount / this.transformedImage.dronetime
        this.client = await Aepp()
        const pub = await this.client.address()
        this.balance = Utils.atomsToAe(await this.client.balance(pub, {format:false}))
      } catch (e) {
        console.error(e)
        bugsnagClient.notify(e)
        this.balance = 0
      }
    }
  }
</script>

<style scoped>
  .bold-info {
    font-weight: 800;
  }
</style>
