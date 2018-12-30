const MWBot = require('mwbot')
const readline = require('readline')

const path = require('path')
const fs = require('fs')

const settings = require(path.join(__dirname, 'env.json'))
const patchDate = require(path.join(__dirname, '..', 'patchDate.json'))['patchDate']

let bot = new MWBot()

function ask(question, callback) {
  var r = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  r.question(question + '\n', function (answer) {
    r.close()
    callback(null, answer)
  })
}

function askToUpload(array, count, type) {
  var filename = array[count]
  let articleName = type === 'LootTable' ? `Loot_table/${filename.split('.')[0]}` : `${filename.split('.')[0]}/info`
  bot.read(articleName).then(article => {
    // Exists, check gen date & compare against patchDate
    let articleText = article.query.pages[Object.keys(article.query.pages)[0]]['revisions'] ? article.query.pages[Object.keys(article.query.pages)[0]]['revisions'][0]['*'] : undefined
    if (articleText) {
      let genString = articleText.match(/<!-- ALL LINES ABOVE ARE AUTOMATED[\w;: ,0-9]+ -->/) ? articleText.match(/<!-- ALL LINES ABOVE ARE AUTOMATED[\w;: ,0-9]+ -->/)[0].split(';').pop().replace('GENERATION DATE:', '').replace(' -->', '') : undefined
      if (!genString || (Date.parse(patchDate) > Date.parse(genString))) {
        // There's an update, continue.
        console.log(`${filename.split('.')[0]}\nneeds update:\t${genString}`)
        goAhead()
      } else {
        console.log(`${filename.split('.')[0]}\nis already up to date:\t${genString}`)
        count++
        if (count === array.length) return console.log('Completed!')
        askToUpload(array, count, type)
      }
    } else {
      goAhead()
    }
  })
  function goAhead() {
    ask(`Upload ${filename.split('.')[0]}?`, (err, answer) => {
      switch (answer) {
        case 'yes':
        case 'y':
          var file = fs.readFileSync(path.join(__dirname, '..', 'Wiki Templates', patchDate, type, filename), 'utf8')
          bot.edit(articleName, file, 'Generated with SB-Data bot.').then(response => {
            console.log(response)
            count++
            if (count === array.length) return console.log('Completed!')
            askToUpload(array, count, type)
          }).catch(err => {
            throw err
          })
          break
        default:
          console.log('Skipping.')
          count++
          if (count === array.length) return console.log('Completed!')
          askToUpload(array, count, type)
      }
    })
  }
}

bot.loginGetEditToken({
  apiUrl: 'https://survivedby.gamepedia.com/api.php',
  username: settings.username,
  password: settings.password
}).then(() => {
  ask('Automate what?', (err, answer) => {
    switch (answer) {
      case 'monster':
      case 'mon':
        var array = fs.readdirSync(path.join(__dirname, '..', 'Wiki Templates', patchDate, 'Monster'))
        var count = 0
        askToUpload(array, count, 'Monster')
        break
      case 'item':
      case 'itm':
        var array = fs.readdirSync(path.join(__dirname, '..', 'Wiki Templates', patchDate, 'ItemDefinition'))
        var count = 0
        askToUpload(array, count, 'ItemDefinition')
        break
      case 'loot':
      case 'lot':
        var array = fs.readdirSync(path.join(__dirname, '..', 'Wiki Templates', patchDate, 'LootTable'))
        var count = 0
        askToUpload(array, count, 'LootTable')
        break
      default:
        process.exit(1)
        break
    }
  })
})