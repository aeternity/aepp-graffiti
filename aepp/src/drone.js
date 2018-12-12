import DroneTracer from '../node_modules/dronetracer/dist/DroneTracer.min'

const paintingConfig = {
  wallId: 1,
  gpsLocation: [-99.134982, 19.413494],
  dimensions: [30.4, 22.07],
  colors: ['#000000', '#eb340f', '#0f71eb'], // default [#000]
  droneResolution: 0.1 // default 0.2
}
// Instance of a drone tracer
const tracer = new DroneTracer(paintingConfig)
export default async function transform (imagefile, progressCallback) {
  // Transform image into a flyable drone path
  const dronePaint = await tracer.transform(
    imagefile, // loaded File API
    (progress) => progressCallback(progress), // log progress
    {
      size: [5, 8], // graffiti size in meters | default 4mx3m
      color: 2, // default 0. Color id from the paintingConfig color list
      threshold: 0.1
    }
  )
  /* The dronePaint object, provides functions to access and modify
     * related information to the svg for the drone.
     * This functions does not affect the transformation process.
     */

  dronePaint.setPaintingPosition(12.1, 0.85) // default: middle of the wall
  dronePaint.setPaintingScale(2.5) // post-scale the svg
  dronePaint.setPaintingData('dataName', 'datAvalue')

  // console.log('result path: ', dronePaint.svgFile)
  // console.log('image source: ', dronePaint.sourceImage)
  // console.log('painting time: ', dronePaint.estimatedTime)
  return dronePaint
}
