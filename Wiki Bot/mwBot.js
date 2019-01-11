const MWBot = require('mwbot')
const readline = require('readline')
const exec = require('child_process').exec

const path = require('path')
const fs = require('fs')

const settings = require(path.join(__dirname, 'env.json'))

let bot = new MWBot()

function ask(question, callback) {
  var r = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  r.question(question + ': ', function (answer) {
    r.close()
    callback(null, answer)
  })
}

function askToUpload(array, count, type) {
  var filename = array[count]
  let articleName = type === 'LootTable' ? `Loot_table/${filename.split('.')[0]}` : type === 'Challenge' ? `Challenge/${filename.split('.')[0]}/info` : `${filename.split('.')[0]}/info`
  bot.read(articleName).then(article => {
    // Exists, check gen date & compare against git latest git commit.
    let articleText = article.query.pages[Object.keys(article.query.pages)[0]]['revisions'] ? article.query.pages[Object.keys(article.query.pages)[0]]['revisions'][0]['*'] : undefined
    exec(`git log -1 --format=%cd "${path.join(__dirname, '..', 'Wiki Templates', type, filename)}"`, (err, stdout, stderr) => {
    if (articleText) {
      let genString = articleText.match(/<!-- ALL LINES ABOVE ARE AUTOMATED[\w;: ,0-9]+ -->/) ? articleText.match(/<!-- ALL LINES ABOVE ARE AUTOMATED[\w;: ,0-9]+ -->/)[0].split(';').pop().replace('GENERATION DATE:', '').replace(' -->', '') : undefined
        if (!genString || genString === 'Invalid Date' || (Date.parse(stdout) > Date.parse(genString))) {
          // There's an update, continue.
          console.log(`(${filename.split('.')[0]}) needs update!\tArticle: ${genString}\tLocal git: ${stdout}`)
          goAhead({ type }, stdout ? new Date(stdout).toUTCString() : new Date().toUTCString())
        } else {
          console.log(`(${filename.split('.')[0]}) is already up to date.\tArticle: ${genString}\tLocal git: ${stdout}`)
          count++
          if (count === array.length) return console.log('Completed!')
          askToUpload(array, count, type)
        }
      } else {
        goAhead({ type }, new Date(stdout).toUTCString())
      }
    })
  })
  function goAhead(obj, date) {
    ask(`Upload ${filename.split('.')[0]}?`, (err, answer) => {
      switch (answer) {
        case 'yes':
        case 'y':
          var file = fs.readFileSync(path.join(__dirname, '..', 'Wiki Templates', obj.type, filename), 'utf8')
          if (date) file += `<!-- ALL LINES ABOVE ARE AUTOMATED, CHANGES DONE ABOVE MAY BE OVERWRITTEN;GENERATION DATE:${date} -->`
          bot.edit(articleName, file, 'Generated with SB-Data bot.').then(response => {
            if (obj.type === 'Challenge') {
              bot.edit(articleName.replace('/info', ''), `{{/info}}`, 'Generated with SB-Data bot.')
            }
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
        var array = fs.readdirSync(path.join(__dirname, '..', 'Wiki Templates', 'Monster'))
        var count = 0
        askToUpload(array, count, 'Monster')
        break
      case 'item':
      case 'itm':
        var array = fs.readdirSync(path.join(__dirname, '..', 'Wiki Templates', 'ItemDefinition'))
        var count = 0
        askToUpload(array, count, 'ItemDefinition')
        break
      case 'loot':
      case 'lot':
        var array = fs.readdirSync(path.join(__dirname, '..', 'Wiki Templates', 'LootTable'))
        var count = 0
        askToUpload(array, count, 'LootTable')
        break
      case 'challenge':
      case 'clg':
        var array = fs.readdirSync(path.join(__dirname, '..', 'Wiki Templates', 'Challenge'))
        var count = 0
        askToUpload(array, count, 'Challenge')
        break
      default:
        process.exit(1)
        break
    }
  })
})