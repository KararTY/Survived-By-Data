const fs = require('fs')
const path = require('path')

module.exports = () => {
  var patchDate = require(path.join(__dirname, 'patchDate.json'))['patchDate']

  // After you're done renaming, move the files to "Other" and then run sorting.js
  var folder = path.join(__dirname, 'Raw data', patchDate, '_Dump Files Here')
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true })
    fs.mkdirSync(path.join(__dirname, 'Raw data', patchDate, 'Other'))
    return { result: true }
  }
  
  var count = 0
  var announceAtNextCount = 1000
  fs.readdirSync(folder).forEach(val => {
    fs.renameSync(path.join(folder, val), path.join(__dirname, 'Raw data', patchDate, 'Other', val.replace(/(^[\w \[\]\(\)\.&']+-|unnamed asset-|unity default resources-|-GameObject|-MonoBehaviour|-Texture2D|\-SpriteRenderer|\-Sprite)/g, '')))
    count++
    if (count === announceAtNextCount) {
      announceAtNextCount += 1000
      console.log('Renamed', count, 'files so far...')
    }
  })
  return { result: true, count }
}