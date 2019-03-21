# Sanity Check Endpoint

This server provides multiple endpoints to check your bid and images for validity before they are send to the smart contract.

The hosted version is available at [https://backend.dronegraffiti.com](https://backend.dronegraffiti.com) but it will 
also work when you setup your own backend. Please note that you need to provide access to an [aeternity node](https://github.com/aeternity/aeternity) 
and an [ipfs node](https://docs.ipfs.io/introduction/install/).

## `POST /sanity/all`

Runs all checks detailed below at once.

#### body
```
{
    amount: int,
    x: int,
    y: int,
    droneTime: int,
    ipfsHash: string
}
```

## `POST /sanity/bidDataValid`

Validates the bid against the chosen slot. Does NOT check if the image is retrievable or valid.

#### body
```
{
    amount: int,
    x: int,
    y: int,
    droneTime: int,
    ipfsHash: string
}
```

## `POST /sanity/couldRetrieveFileFromIPFS`

Tests if the hosted IPFS client can retrieve the specified hash from the ipfs network. Does NOT check for file validity.

#### body
```
body: {
    ipfsHash: string
}
```

## `POST /sanity/fileIsValidSVG`

This endpoint validates if your SVG is valid and has the required headers. It will NOT verify if the paths can 
be actually flown by the drone.

#### body
```
{
    ipfsHash: string
}
```

or

```
multipart/form-data;
-----BOUNDARY
Content-Disposition: form-data; name="image"; filename="image.svg"
Content-Type: xml/svg
Content-Transfer-Encoding: base64

/9j/4AAQSkZJRgABAQEA...
-----BOUNDARY
```


## responses

```
{
  "performedCheck": {    // name of the performed check
    "passed": boolean,   // result of the performed checks
    "reason": string     // reason for rejection
  }
}
```
