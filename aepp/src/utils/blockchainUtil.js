const BigNumber = require('bignumber.js')

const atomsToAe = (atoms) => (new BigNumber(atoms)).dividedBy(new BigNumber(1000000000000000000))
const aeToAtoms = (ae) => (new BigNumber(ae)).times(new BigNumber(1000000000000000000))

const slotIsActive = (slot, height) => slot.start_block_height <= height && slot.end_block_height > height
const slotIsPast = (slot, height) => slot.end_block_height < height
const slotIsFuture = (slot, height) => slot.start_block_height >= height
const slotCapacityUsed = (slot) => slot.successful_bids.reduce((acc, x) => Number(x.time) + acc, 0)
const slotCapacityRemaining = (slot) => Number(slot.time_capacity) - slotCapacityUsed(slot)

export default {
  atomsToAe, aeToAtoms, slotIsActive, slotIsPast, slotIsFuture, slotCapacityUsed, slotCapacityRemaining
}
