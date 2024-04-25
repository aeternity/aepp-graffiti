<template>
    <div>
        <div class="p-8">
            <div v-if="error">
                <h1 class="mt-4 mb-2">error</h1>
                <div class="font-mono text-red-600 text-xl">{{ error }}</div>
            </div>
            <div class="flex flex-col md:flex-row">
                <div>
                    <h1 class="mt-4 mb-2">health check</h1>
                    <div class="my-1" v-for="(value, key) in health" :key="key">
                        {{ key }}:
                        <ae-loader v-if="value === null"></ae-loader>
                        <ae-icon name="check" v-if="value === true"></ae-icon>
                        <span v-if="value === false" class="text-red-600 font-bold">HEALTHCHECK FAILED</span>
                    </div>
                </div>
                <div class="md:ml-8 md:pl-8 md:border-l">
                    <h1 class="mt-4 mb-2">ts to block</h1>
                    <div>
                        <div class="flex flex-row">
                            <div class="flex flex-col mb-4">
                                <label for="date" class="font-mono">Date</label>
                                <input class="input" id="date" v-model="date" type="date"/>
                            </div>

                            <div class="flex flex-col mb-4">
                                <label for="time" class="font-mono">Time</label>
                                <input class="input" id="time" v-model="time" type="time"/>
                            </div>

                            <div class="flex flex-col mb-4">
                                <label for="zone" class="font-mono">Timezone</label>
                                <input class="input" id="zone" v-model="timezone" type="number"
                                       placeholder="+ 0"/>
                            </div>
                        </div>

                        <div class="flex flex-col mb-4">
                            <label class="font-mono">Result Block</label>
                            <div class="text-xl font-mono">{{ block }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <h1 class="mt-4 mb-2">current height</h1>
            <bigger-loader v-if="!height"/>
            <div class="font-mono text-xl" v-else>{{ height }}</div>

            <h1 class="mt-4 mb-2">slots</h1>
            <bigger-loader v-if="loading"/>
            <div v-if="!loading">
                <div class="flex-row p-2 border-t border-grey-light hidden md:flex">
                    <div class="flex-1">Slot Id</div>
                    <div class="flex-1">Time Capacity</div>
                    <div class="flex-1">Bid Time Bounds</div>
                    <div class="flex-1">Block Height Bounds</div>
                    <div class="flex-1">Successful Bids</div>
                    <div class="flex-1">Failed Bids</div>
                </div>
                <div v-for="slot in slots" :key="Number(slot.id)">
                    <div class="flex flex-col p-2 border-t border-grey-light md:flex-row">
                        <div class="flex-1">
                            <div class="font-bold block md:hidden mt-3 mb-1">Slot</div>
                            {{ slot.id }}
                            <ae-badge v-if="slot.timing.active" class="active-badge">active</ae-badge>
                            <ae-badge v-if="slot.timing.past">past</ae-badge>
                            <ae-badge v-if="slot.timing.future">future</ae-badge>
                            <br>
                            <ae-button v-if="slot.timing.past" face="round" fill="primary">
                                <a :href="slot.downloadLink">
                                    export
                                    <ae-icon name="save"/>
                                </a>
                            </ae-button>
                        </div>
                        <div class="flex-1">
                            <div class="font-bold block md:hidden mt-3 mb-1">Time Capacity</div>
                            {{ slot.capacityUsed }} min used of {{ slot.time_capacity }} min
                        </div>
                        <div class="flex-1">
                            <div class="font-bold block md:hidden mt-3 mb-1">Bid Time Bounds</div>
                            Minimum Time: {{ slot.minimum_time_per_bid }} min<br>
                            Maximum Time: {{ slot.maximum_time_per_bid }} min
                        </div>
                        <div class="flex-1">
                            <div class="font-bold block md:hidden mt-3 mb-1">Block Height Bounds</div>
                            Start height {{ slot.start_block_height }}<br>
                            est.
                            <span>{{ blockToDate(slot.start_block_height) }}</span>
                            <br>
                            <br>
                            End height&nbsp;&nbsp;{{ slot.end_block_height }}<br>
                            est.
                            <span>{{ blockToDate(slot.end_block_height) }}</span>
                        </div>
                        <div class="flex-1">
                            <div class="font-bold block md:hidden mt-3 mb-1">Successful Bids</div>
                            Count: {{ slot.success.bids.length }}<br>
                            Σ Amount: {{ slot.success.amountSum.toFixed() }} AE<br>
                            Σ Time: {{ slot.success.timeSum }} min
                            <div v-if="slot.success.bids.length">
                                Min: {{ Math.min(...slot.success.amount_per_time) }} AE/min<br>
                                Max: {{ Math.max(...slot.success.amount_per_time) }} AE/min
                            </div>
                            <ae-button v-if="slot.success.bids.length" face="round" fill="primary"
                                       @click="showBids(slot.id, 'successful', slot.success.bids)">
                                inspect
                                <ae-icon name="eye"/>
                            </ae-button>
                        </div>
                        <div class="flex-1">
                            <div class="font-bold block md:hidden mt-3 mb-1">Failed Bids</div>
                            Count: {{ slot.failed.bids.length }}<br>
                            Σ Amount: {{ slot.failed.amountSum.toFixed() }} AE<br>
                            Σ Time: {{ slot.failed.timeSum }} min
                            <div v-if="slot.failed.bids.length">
                                Min: {{ Math.min(...slot.failed.amount_per_time) }} AE/min<br>
                                Max: {{ Math.max(...slot.failed.amount_per_time) }} AE/min
                            </div>
                            <ae-button v-if="slot.failed.bids.length" face="round" fill="primary"
                                       @click="showBids(slot.id, 'failed', slot.failed.bids)">
                                inspect
                                <ae-icon name="eye"/>
                            </ae-button>
                        </div>
                    </div>
                </div>
            </div>

            <bigger-loader v-if="inspectBidsLoading"/>
            <div v-if="inspectBids">
                <h2>{{ inspectBids.state }} bids Slot {{ inspectBids.slotId }}</h2><br>
                <div class="flex-row p-2 border-t border-grey-light hidden md:flex">
                    <div class="flex-1">Data</div>
                    <div class="flex-1">Preview</div>
                </div>
                <div v-for="bid in inspectBids.bids" :key="Number(bid.seq_id)">
                    <div class="flex flex-col md:flex-row p-2 border-t border-grey-light">
                        <div class="flex-1">
                            Sequence: {{ bid.seq_id }}<br>
                            Amount: {{ bid.amountAe.toFixed() }} AE<br>
                            Time: {{ bid.time }} min<br>
                            Amount/Time: {{ bid.amount_per_timeAe }} AE/min<br>
                            Bidder: {{ bid.user }}<br>
                            X:{{ bid.data.coordinates.x }} Y:{{ bid.data.coordinates.y }}
                        </div>
                        <div class="flex-1">
                            <img :src='bid.url' v-if="bid.url" class="w-full preview-image" alt="Bidding Image">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { AeSdk } from '@aeternity/aepp-sdk'
import Util from '~/utils/blockchainUtil'
import { AeBadge, AeButton, AeIcon, AeLoader } from '@aeternity/aepp-components/src/components'
import BiggerLoader from '~/components/BiggerLoader'
import BigNumber from 'bignumber.js'
import config from '~/config'
import axios from 'axios'
import GraffitiAuctionACI from '../../utils/GraffitiAuctionACI'
import { nodes } from '../../utils/aeternityNetwork'

export default {
    name: 'Admin',
    components: {AeLoader, BiggerLoader, AeBadge, AeButton, AeIcon},
    data() {
        return {
            networkId: 'ae_mainnet',
            slots: [],
            height: 0,
            avgBlockTime: 3 * 60,
            loading: true,
            interval: null,
            inspectBidsLoading: false,
            inspectBids: null,
            date: null,
            time: null,
            timezone: null,
            resultBlock: null,
            health: {
                ipfsNode: null,
                blockchainNode: null,
                testFiles: null,
                testContract: null
            },
            error: null
        }
    },
    computed: {
        config() {
            return config
        },
        timeZoneString() {
            if (!this.timezone || this.timezone === 0) return null
            return (this.timezone < 0 ? '-' : '+') + ('0000' + String(Math.abs(this.timezone * 100))).substr(-4, 4)
        },
        block() {
            const target = Date.parse(`${this.date || ' '} ${this.time || ' '}${this.timeZoneString || ' '}`.trim())
            const current = Date.now()
            const diff = target - current
            const goalBlock = parseInt(this.height + diff / 180000)
            return Number.isNaN(goalBlock) ? 0 : goalBlock
        }
    },
    methods: {
        blockToDate(goalBlock) {
            const diff = Number(goalBlock) - this.height
            return new Date(diff * 180000 + Date.now()).toLocaleString([],
                {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZoneName: 'short'
                })
        },
        runHealthChecks() {
            this.health = {
                ipfsNode: null,
                blockchainNode: null,
                testFiles: null,
                testContract: null
            }
            axios.get(`${this.config.apiUrl[this.networkId]}/health/ipfsNode`).then(() => this.health.ipfsNode = true).catch(() => {
                this.health.ipfsNode = false
            })
            axios.get(`${this.config.apiUrl[this.networkId]}/health/blockchainNode`).then(() => this.health.blockchainNode = true).catch(() => this.health.blockchainNode = false)
            axios.get(`${this.config.apiUrl[this.networkId]}/health/testFiles`).then(() => this.health.testFiles = true).catch(() => this.health.testFiles = false)
            axios.get(`${this.config.apiUrl[this.networkId]}/health/testContract`).then(() => this.health.testContract = true).catch(() => this.health.testContract = false)
        },
        async loadData(aeSdk, contractInstance) {
            try {
                this.height = await aeSdk.getHeight()

                const allAuctionSlots = await contractInstance.all_auction_slots()

                this.slots = allAuctionSlots.decodedResult
                    .sort((a, b) => Number(a.end_block_height - b.end_block_height))
                    .map(slot => {
                        return {
                            id: slot.id,
                            downloadLink: `${config.apiUrl[this.networkId]}/slots/${slot.id}`,
                            timing: {
                                past: Util.slotIsPast(slot, this.height),
                                active: Util.slotIsActive(slot, this.height),
                                future: Util.slotIsFuture(slot, this.height)
                            },
                            time_capacity: slot.time_capacity,
                            minimum_time_per_bid: slot.minimum_time_per_bid,
                            maximum_time_per_bid: slot.maximum_time_per_bid,
                            start_block_height: slot.start_block_height,
                            end_block_height: slot.end_block_height,
                            capacityUsed: Util.slotCapacityUsed(slot),
                            success: {
                                bids: slot.successful_bids.sort((a, b) => Number(a.seq_id - b.seq_id)),
                                amountSum: Util.atomsToAe(slot.successful_bids.reduce((acc, x) => acc.plus(x.amount), new BigNumber(0))),
                                timeSum: slot.successful_bids.reduce((acc, x) => Number(x.time) + acc, 0),
                                amount_per_time: slot.successful_bids.map(x => x.amount_per_time).map(x => Util.atomsToAe(x).toFixed(4))
                            },
                            failed: {
                                bids: slot.failed_bids.sort((a, b) => Number(a.seq_id - b.seq_id)),
                                amountSum: Util.atomsToAe(slot.failed_bids.reduce((acc, x) => acc.plus(x.amount), new BigNumber(0))),
                                timeSum: slot.failed_bids.reduce((acc, x) => Number(x.time) + acc, 0),
                                amount_per_time: slot.failed_bids.map(x => x.amount_per_time).map(x => Util.atomsToAe(x).toFixed(4))
                            },

                        }
                    })
                this.loading = false
            } catch (e) {
                console.error(e)
                this.error = e.message
            }
        },
        async showBids(slotId, state, bids) {
            this.inspectBidsLoading = true
            this.inspectBids = null
            bids = bids.map(bid => {
                bid.url = config.apiUrl[this.networkId] + '/ipfs/' + bid.data.artwork_reference + '.svg'
                bid.amountAe = Util.atomsToAe(bid.amount)
                bid.amount_per_timeAe = Util.atomsToAe(bid.amount_per_time).toFixed(4)
                return bid
            })
            this.inspectBidsLoading = false
            this.inspectBids = {slotId: slotId, state: state, bids: bids}
        }
    },
    async created() {
        this.networkId = this.$route.query.testnet ? 'ae_uat' : 'ae_mainnet'

        const aeSdk = new AeSdk({nodes})
        aeSdk.selectNode(this.networkId)

        const contractInstance = await aeSdk.initializeContract({
            aci: GraffitiAuctionACI,
            address: config.blockchainSettings[this.networkId]
        })

        this.runHealthChecks()
        void this.loadData(aeSdk, contractInstance)
        this.interval = setInterval(() => {
            void this.loadData(aeSdk, contractInstance)
            this.runHealthChecks()
        }, 30000)
    },
    beforeDestroy() {
        clearInterval(this.interval)
    }
}
</script>

<style lang="scss" scoped>
@import "~@aeternity/aepp-components/src/styles/variables/colors.scss";

a {
    color: $color-neutral-maximum;
    text-decoration: none;
}

.active-badge {
    background-color: $color-primary;
}

.ae-button {
    transform-origin: top left;
    transform: scale(0.7);
}

.preview-image {
    max-height: 300px;
}

.input {
    height: 50px;
    display: block;
    @apply border-b p-2 font-mono text-xl max-w-xs;
}
</style>
