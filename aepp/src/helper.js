export function getGoodImageDimensions (imageWidth, imageHeight, maxWidth, maxHeight) {
  const ratio = imageHeight / imageWidth
  // Its all fine
  if (imageWidth < maxWidth && imageHeight < maxHeight) {
    return {
      height: imageHeight,
      width: imageWidth
    }
  } else {
    // One dimension is too big
    if (imageWidth > imageHeight) {
      // width > height
      let suggestedWidth = maxWidth
      let suggestedHeight = maxWidth * ratio
      if (suggestedHeight < maxHeight) {
        return {
          height: suggestedHeight,
          width: suggestedWidth
        }
      } else {
        return {
          height: maxHeight,
          width: maxHeight / ratio
        }
      }
    } else {
      // height > width
      let suggestedHeight = maxHeight
      let suggestedWidth = maxHeight / ratio
      if (suggestedWidth < maxWidth) {
        return {
          height: suggestedHeight,
          width: suggestedWidth
        }
      } else {
        return {
          width: maxWidth,
          height: maxWidth * ratio
        }
      }
    }
  }
}
