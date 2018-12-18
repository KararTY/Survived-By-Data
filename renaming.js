const fs = require('fs')
const path = require('path')

var patchDate = '2018-12-16'

// After you're done renaming, move the files to "Other" and then run sorting.js
var folder = path.join(__dirname, patchDate, 'RenameFolder')
if (!fs.existsSync(folder)) fs.mkdirSync(folder)

fs.readdirSync(folder).forEach(val => {
  fs.renameSync(path.join(folder, val), path.join(folder, val.replace(/(^[\w \[\]\(\)\.&']+-|unnamed asset-|unity default resources-|-GameObject|-MonoBehaviour|-Texture2D|\-SpriteRenderer|\-Sprite)/g, '')), (err) => {
    if (err) throw err
  })
})
