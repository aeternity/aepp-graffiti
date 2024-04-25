<template>
  <div>
    <WhiteHeader title="Your Bids"></WhiteHeader>

    <div class="w-full p-4 text-center" v-if="isInitialState">
      <BiggerLoader></BiggerLoader>
    </div>

    <div class="w-full p-4 text-center" v-if="isErrorState">
      <h1 class="text-center mt-3">Error</h1>
      <div class="w-full text-center font-mono text-xl text-red-600 mt-2">
        {{error}}
      </div>
    </div>

    <div class="w-full p-4 pb-24" v-if="isShowListState">
      <div v-for="bid in bids" :key='Number(bid.seq_id)'>
        <DarkCard class="mb-4">
          <div class="flex flex-col w-full">
            <div class="w-full mb-2">
              <img :src='bid.url' v-if="bid.url" class="w-full bid-image" alt="Bidding Image">
              <div class="w-full text-center mt-4" v-else>
                <BiggerLoader></BiggerLoader>
              </div>
            </div>
            <div class="w-full relative">
              <div class="flex flex-row justify-between">
                <div class="flex flex-col mt-2">
                <span class="text-gray-500">
                  Amount
                </span>
                  <span class="font-mono  text-lg">
                  {{bid.amount.toFixed(2)}} AE ({{bid.perMinute}} AE/Min)
                </span>
                </div>
                <div class="flex flex-col mt-2">
                <span class="text-gray-500">
                  Slot
                </span>
                  <span class="font-mono text-right  text-lg">
                  {{bid.slotId}}
                </span>
                </div>
              </div>
              <div class="flex flex-col mt-2">
                <span class="text-gray-500">
                  Estimated Painting Time
                </span>
                <span class="font-mono  text-lg">
                  {{bid.time}} Minutes
                </span>
              </div>
              <div class="flex flex-col mt-2">
                <span class="text-gray-500">
                  Status
                </span>
                <span class="font-mono  text-lg">
                  <span v-if="bid.finished && bid.successful">Immutably Included</span>
                  <span v-if="!bid.successful">Outbid and refunded</span>
                  <span v-if="bid.finished && !bid.successful"><br> (Minimum bid: {{bid.minimumAmount}} AE / Min)</span>
                  <span v-if="!bid.finished && bid.successful">Bid Placed (Slot Open)</span>
              </span>
              </div>
              <div class="absolute bottom-0 right-0 rounded-full btn-primary-round"
                   @click="shareBid(bid.seq_id)">
                <div class="flex items-center justify-center p-4">
                  <img src="../assets/share.svg" alt="share">
                </div>
              </div>
            </div>
          </div>
        </DarkCard>
      </div>
    </div>
    <div class="w-full p-4" v-if="isEmptyListState">
      <h2 class="text-center">No bids found.</h2>
    </div>
    <div @click="$router.push('/')" class="fixed bottom-0 right-0 p-8 cursor-pointer">
      <div class="ae-icon-size rounded-full text-xl py-4  px-8 text-white">Home</div>
    </div>
    <div class="absolute bottom-0 mb-8 flex justify-center w-full" @click="sharedBid = null" v-show="sharedBid">
      <Toast>
        {{sharedBid}}
      </Toast>
    </div>
  </div>
</template>

<script>
  import Util from '../utils/blockchainUtil'
  import BiggerLoader from '~/components/BiggerLoader'
  import WhiteHeader from '~/components/WhiteHeader'
  import { AeCard } from '@aeternity/aepp-components/src/components'
  import config from '~/config'
  import AeIcon from '@aeternity/aepp-components/src/components/ae-icon/ae-icon'
  import aeternity from '~/utils/aeternityNetwork'
  import Toast from '~/components/Toast'
  import DarkCard from '../components/DarkCard'

  const INITAL_STATE = 0, SHOW_LIST = 1, EMPTY_LIST = 2, ERROR_STATE = 3

    export default {
        name: 'Overview',
        components: {DarkCard, Toast, AeIcon, BiggerLoader, AeCard, WhiteHeader},
        data() {
            return {
                bids: [],
                state: INITAL_STATE,
                address: null,
                error: null,
                sharedBid: null
            }
        },
        computed: {
            blockchainSettings() {
                return config.blockchainSettings
            },
            isInitialState() {
                return this.state === INITAL_STATE
            },
            isShowListState() {
                return this.state === SHOW_LIST
            },
            isEmptyListState() {
                return this.state === EMPTY_LIST
            },
            isErrorState() {
                return this.state === ERROR_STATE
            }
        },
        methods: {
            async shareBid(id) {
                try {
                    if (navigator.share) {
                        navigator.share({
                            title: 'æeternity graffiti project',
                            text: 'Check out my participation in the aeternity global blockchain artwork!',
                            url: `${document.location.host}/#/bid/${id}`,
                        })
                    } else {
                        if (navigator.clipboard) {
                            await navigator.clipboard.writeText(`${document.location.host}/#/bid/${id}`)
                            this.sharedBid = 'sharing info copied to clipboard'
                        } else {
                            window.open(`${document.location.host}/#/bid/${id}`)
                        }
                    }
                } catch (e) {
                    this.sharedBid = 'Error Sharing'
                    console.error(e)
                }
                setTimeout(() => this.sharedBid = null, 5000)
            },
            async updateSlots() {
                try {

                    const slots = await aeternity.contract.all_auction_slots()

                    const height = await aeternity.height

                    if (!slots.decodedResult) {
                        this.error = 'Could not decode data from contract.'
                        return this.state = ERROR_STATE
                    }

                    if (slots.decodedResult.length === 0) return this.state = EMPTY_LIST

                    const allBids = slots.decodedResult.map(slot => {
                        let allBids = []

                        allBids = allBids.concat(slot.successful_bids.filter(bid => bid.user === this.address).map(bid => {
                            bid.successful = true
                            return bid
                        }))

                        allBids = allBids.concat(slot.failed_bids.filter(bid => bid.user === this.address).map(bid => {
                            bid.successful = false
                            return bid
                        }))

                        allBids = allBids.map(bid => {
                            bid.amount = Util.atomsToAe(bid.amount)
                            bid.perMinute = Util.atomsToAe(bid.amount_per_time).toFixed(2)
                            bid.finished = Util.slotIsPast(slot, height)
                            bid.slotId = slot.id
                            bid.minimumAmount = Math.min(...slot.successful_bids.map(x => x.amount_per_time).map(x => Util.atomsToAe(x).toFixed(4)))
                            bid.url = config.apiUrl[aeternity.networkId] + '/ipfs/' + bid.data.artwork_reference + '.svg'
                            return bid
                        })
                        return allBids
                    })

                    if (allBids.length === 0) return this.state = EMPTY_LIST

                    this.bids = allBids.reduce((acc, val) => acc.concat(val), []).sort((a, b) => Number(b.seq_id - a.seq_id))

                    if (this.bids.length > 0) this.state = SHOW_LIST
                    else return this.state = EMPTY_LIST
                } catch (e) {
                    this.error = e.message
                    console.error(e)
                    this.state = ERROR_STATE
                }

            }
        },
        async created() {
            this.address = await aeternity.address
            await this.updateSlots()
        }
    }
</script>

<style scoped>

  .ae-icon-size {
    background-color: #FF0D6A;
  }

  .bid-image {
    max-height: 200px;
  }

  .btn-primary-round {
    background: #ff0d6a;
    color: #fff;
    box-shadow: 0 0 8px rgba(0, 33, 87, .4);
  }
</style>
