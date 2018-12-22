const path = require('path')

const patchDate = require('./patchDate.json')['patchDate']

console.log('Renaming, this will take some time.')
const renamer = require('./renaming.js')()
if (renamer.result) {
  console.log('Renamed', renamer.count, 'files in total.')
  
  // console.log('Sorting, this will take some time.')
  // const sorter = require('./sorting.js')()
  // console.log('Sorted', sorter, 'files in total.')

  console.log('Starting the parser... This will take some time to finish.')
  const parser = require('./parsing.js')()
  console.log('Parsed. Parser results are in', path.join(__dirname, 'Patches', patchDate))
} else return console.log('Created starter folders, please dump UABE files (.JSON formatted) of Unity type,\n', require('./UABETypes.json').map((t, i) => `${i + 1} - ${t}`).join('\n '), '\ninto\n', path.join(__dirname, 'Raw data', patchDate, '_Dump Files Here'))

console.log('Running the wiki templater...')
const wikiTemplate = require('./wikiTemplating.js')
console.log('Wiki templater results are in', path.join(__dirname, 'Wiki Templates', patchDate))
console.log('Finished!')