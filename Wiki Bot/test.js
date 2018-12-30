const MWBot = require('mwbot')
const path = require('path')
let bot = new MWBot()

const settings = require(path.join(__dirname, 'env.json'))

bot.loginGetEditToken({
  apiUrl: 'https://survivedby.gamepedia.com/api.php',
  username: settings.username,
  password: settings.password
}).then(() => {
  bot.read('Loot_table/RareLoot_T2').then(article => {
    // Exists, check gen date & compare against patchDate
    let articleText = article.query.pages[Object.keys(article.query.pages)[0]]['revisions'] ? article.query.pages[Object.keys(article.query.pages)[0]]['revisions'][0]['*'] : undefined
    if (articleText) {
      let genString = articleText.match(/<!-- ALL LINES ABOVE ARE AUTOMATED[\w;: ,0-9]+ -->/)[0].split(';').pop().replace('GENERATION DATE:', '').replace(' -->', '')
      console.log(genString)
      if (Date.parse(patchDate) > Date.parse(genString)) {
        // There's an update, continue.
      }
    }
  })
})
