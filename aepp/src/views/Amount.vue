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
        <ae-input type="number" label="Amount per Minute" step="0.01" placeholder="1" min="0" aemount :value="amount"
                  @input="updateData" :error="!!error">
          <template slot="header">
            <span class="text-grey">AE</span>
          </template>
          <ae-toolbar slot="footer">
            <div class="w-full flex justify-between">
              <span>{{transformedImage.dronetime}} Minutes</span>
              <span class="bold-info">~{{total.toLocaleString('en-US')}} AE in total</span>
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
  import Utils from '../utils/blockchain_util'

  export default {
    name: 'Amount',
    components: { AeInput, WhiteHeader, AeToolbar, AeButton },
    data () {
      return {
        amount: 0.1,
        total: 0,
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
          this.total = 0
        } else {
          this.amount = e
          this.total = this.amount * this.transformedImage.dronetime
        }
      },
      back () {
        this.$router.push('slots')
      },
      next () {

        this.error = null

        if (this.remainingDronetime < this.transformedImage.dronetime && this.amount < this.slotObject.minimumBid) {
          this.error = `The minimum bid for this slot is ${this.slotObject.minimumBid.toFixed(5)} AE per minute`
        }

        if (this.total < 0.001) {
          this.error = `The minimum bidding amount is 0.001 AE.`
        }

        if (this.balance.lt(this.total)) {
          this.error = `Your bid total (${this.total} AE) exceeds your balance (${this.balance} AE).`
        }

        if (!this.error) {
          this.$store.dispatch('updateBidding', {
            amount: this.total
          })
          this.$router.push('confirm')
        }

      }
    },
    async mounted () {
      console.log(this.slotObject)
      this.total = this.amount * this.transformedImage.dronetime
      this.client = await Aepp()
      try {
        const pub = await this.client.address()
        this.balance = Utils.atomsToAe(await this.client.balance(pub, {format:false}))
      } catch (e) {
        console.error(e)
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
