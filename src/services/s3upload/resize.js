// resize.js

// require modules
const sharp = require('sharp')

// sharp resize stream
const streamToSharp = ({data, width, height }) => {
  return sharp(`./uploads/${data}`)
    .resize(width, height)
    .toFormat('png')
}


function resize(readStream, format, width, height) {
  let transform = sharp(readStream)
  // const buffer = new Buffer(readStream, 'base64')

  if (format) {
    transform = transform.toFormat(format)
  }

  if (width || height) {
    transform = transform.resize(width, height)
  }

  return transform;
}

exports.handler = (event) => {
  const { params : {query :{ height , width}}, result, id} = event;
  console.log(event.params)
  let pureHeight , pureWidth
  if(height){
    pureHeight = parseInt(height)
  }


  if(width){
    pureWidth = parseInt(height)
  }
  // create the new name of the image, note this has a '/' - S3 will create a directory
  const file = streamToSharp({data : id,  pureWidth, pureHeight})

  

  file.toBuffer((err, info)=>{
    console.log(err)
    console.log(info)
    event.result.uri = info.toString('base64')
  })  
}