# Interacting with the smart contract
The purpose of the vue.js frontend and node.js backend is to provide a simple user interface for this smart contract. 
As the smart contract can also be accessed directly we supply this documentation for interested users to ease their interactions.

## How to bid directly on the contract

### 1. Create your artwork
We published a image conversion library that converts any digital image into a svg. 
Clone the [Drone Tracer repository](https://github.com/Drone-Graffiti/DroneTracer) and follow its 
example implementation to load and convert your image.
Its important that you note down the `estimatedTime` property of the resulting `dronePaint` object as 
you will need this later. The SVG can be extracted from `dronePaint.svgFile`.

### 2. Upload your File to IPFS

As with good practice the images are not stored in the contract state but rather a reference to the 
file in the IPFS network is provided. You can obtain this reference by hosting your own
 [IPFS node](https://docs.ipfs.io/introduction/install/) or by using one of the many gateways or upload providers.

### 2.1 Verify your bid (optional)

The node-js server provides an API for you to check your bid against. [Read the documentation here.](https://github.com/aeternity/aepp-graffiti/tree/master/server/docs/SANITY.md)

### 3. Call the contract

Next you need to call the smart contracts public function `place_bid` with the `auction_slot_id`, your `estimatedTime`, the `IPFS_hash` and 
the `x` and `y` coordinates. The full signature of the function is listed in the reference below. Here an example using 
the [js-sdk](https://github.com/aeternity/aepp-sdk-js/)

## Reference

This section describes the smart contracts data types and its public methods.

### Methods

### `get_auction_metadata`

| | |
| ------------- | ------------- |
| Parameters | `()` |
| Returns | `auction_metadata` |
| Description | Returns the auction meta data defined during contract init. |

### `all_auction_slots`

| | |
| ------------- | ------------- |
| Parameters | `()` |
| Returns | `list(auction_slot)` |
| Description | Returns all active and inactive auction slots. |

### `get_auction_slot`

| | |
| ------------- | ------------- |
| Parameters | `(id: int)` |
| Returns | `auction_slot` |
| Description | Returns the requested auction slot. |

### `place_bid`

| | |
| ------------- | ------------- |
| Parameters | `(auction_slot_id : int, time' : int, artwork_reference' : string, x' : int, y' : int)` |
| Returns | `auction_slot` |
| Description | Places a bid in the defined slot and returns the updated auction slot including your bid. |

### Data Types

### `state`

| Property      | Description   | Type          |
| ------------- | ------------- | ------------- |
| `is_admin`                        | A key value store of admin addresses.  | `map(address, bool)`  |
| `auction_metadata`                |                                     | `auction_metadata`   |
| `latest_auction_slot_id`          |   | `int`       |
| `latest_bid_seq_id`          |   | `int`       |
| `auction_slots `          |   | `map(int, auction_slot)`       |


### `auction_metadata`

| Property      | Description   | Type          |
| ------------- | ------------- | ------------- |
| `geolocation`    |                                     | `string`    |
| `canvas_width`   |  The width of the canvas in pixel.  | `int`       |
| `canvas_height`  | The height of the canvas in pixel.  | `int`       |

### `auction_slot`

| Property      | Description   | Type          |
| ------------- | ------------- | ------------- |
| `id`          | sequencial id for each slot, starting from 1  | `int`       |
| `time_capacity`          | time is the unit to be bid off, this defined the availability for this slot  | `int`       |
| `minimum_time_per_bid`          | minimum time that has to be bid for  | `int`       |
| `maximum_time_per_bid`          | maximum time that has to be bid for  | `int`       |
| `successful_bids` | all bids that are still considered successfull, can change until end_block_height is reached  | `list(bid)`  |
| `failed_bids`                   | all bids that are considered failed, were overbid  | `list(bid)`       |
| `start_block_height`            | start block height from which bids can be placed in this block  | `int`       |
| `end_block_height`              | end block height after which bids can no longer be placed in this block  | `int`       |

### `bid`

| Property      | Description   | Type          |
| ------------- | ------------- | ------------- |
| `seq_id `          | sequencial id for each bid, starting from 1  | `int`       |
| `user  `          | user address placing the bid  | `address `       |
| `amount  `          | total amount that is payed for this bid  | `int`       |
| `time  `          | time that is bid for (unit to be bid off)  | `int`       |
| `amount_per_time`          | amount that is payed per time  | `int`       |
| `data   `          | reference to metadata that is included in the bid  | `artwork_data`       |

### `artwork_data`

| Property      | Description   | Type          |
| ------------- | ------------- | ------------- |
| `artwork_reference`          | IPFS id of the artworks svg | `string`       |
| `coordinates`          | coordinates of the artwork on the canvas | `coordinates`       |

### `coordinates`

| Property      | Description   | Type          |
| ------------- | ------------- | ------------- |
| `x`          | x coordinate in the same unit as `canvas_width` | `int`       |
| `y`          | y coordinate in the same unit as `canvas_height` | `int`       |
