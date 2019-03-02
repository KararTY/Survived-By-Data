const path = require('path')
const patchDate = require(path.join(__dirname, 'patchDate.json'))['patchDate']

console.log('Renaming, this will take some time.')
const renamer = require('./renaming.js')()
if (renamer.result) {
  console.log('Renamed', renamer.count, 'files in total.')
  
  console.log('Sorting, this will take some time.')
  let sorter = require('./sorting.js')()
  console.log('Sorted', sorter, 'files in total.')

  console.log('Starting the parser... This will take some time to finish.')
  require('./parsing.js')()
  console.log('Parsed. Parser results are in', path.join(__dirname, 'Patch'))
} else return console.log('Created starter folders, please dump UABE files (.JSON formatted) of Unity type,\n', require('./UABETypes.json').map((t, i) => `${i + 1} - ${t}`).join('\n '), '\ninto\n', path.join(__dirname, 'Raw data', patchDate, '_Dump Files Here'))

console.log('Running the wiki templater...')
require('./wikiTemplating.js')
console.log('Wiki templater results are in', path.join(__dirname, 'Wiki Templates'))
console.log('Finished!')