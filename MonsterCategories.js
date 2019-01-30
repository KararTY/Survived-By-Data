let fs = require('fs')
let path = require('path')

// var category = 'Undying'
// var element = 'An'

function gImageOriginalData(data, mon) {
  var giod = data.find(v => v.sprite) ? data.find(v => v.sprite).sprite : ''
  return giod ? `{{CSS image crop|Image=${giod.name}.png|bSize=${giod.baseSize.width}|cWidth=${giod.textureRectangle.width}|cHeight=${giod.textureRectangle.height}|oBottom=${giod.baseSize.height - (giod.textureRectangle.y + giod.textureRectangle.height)}|oLeft=${giod.textureRectangle.x}|Link=${mon.name}${mon.alias ? `#${mon.alias}` : ''}}}` : ''
}

var template = ``
var zero = ``
for (let i = 0; i < 21; i++) {
  let tier = i
  var monsters = []
  var template = ``
  fs.readdirSync(path.join(__dirname, 'Patch', 'Monster')).sort((a, b) => {
    return a.localeCompare(b)
  }).forEach((val, ind) => {
    var file = require(path.join(__dirname, 'Patch', 'Monster', val))
    file.sort((a, b) => {
      if (!a.alias && !b.alias) return 0
      return a.alias.localeCompare(b.alias)
    }).forEach(mon => {
      let data = mon.data.find(v => v.stats) ? mon.data.find(v => v.stats).stats.find(v => v.key === 'Tier') ? mon.data.find(v => v.stats).stats.find(v => v.key === 'Tier').value : undefined : undefined
      if (mon.isElite && tier === 0 && typeof data === 'number' && data === 0 /*&& category ? mon.category === category : element ? mon.element === element : true*/) {
        monsters.push(`\n| ${gImageOriginalData(mon.data, mon) ? `${gImageOriginalData(mon.data, mon)}` : ''}\n| [[${mon.name}${mon.alias ? `#${mon.alias}` : ''}|${mon.name}${mon.alias ? `${(mon.alias.includes('tutorial_') || mon.alias.includes('_tutorial')) ? ` (Tutorial)` : ''}${mon.alias ? `${mon.isBoss ? ` (Boss)` : ''}${mon.alias.includes('boss_') && !mon.isBoss ? ` (Boss Minion)` : ''}${mon.alias.includes('_hardmode') ? ` (Hardmode)` : ''}${mon.isElite ? ` (Elite)` : ''}${mon.alias.includes('_elite_minion') ? ` (Elite Minion)` : ''}${mon.alias.includes('_world') ? ` (World)` : ''}${mon.alias.includes('_dangerous') ? ` (Dangerous chest)` : ''}${mon.alias.includes('_dung') ? ` (Dungeon)` : ''}${mon.alias.includes('invasion_') ? ` (Invasion)` : ''}${(mon.alias.toLowerCase().includes(' pet') || mon.alias.toLowerCase().includes('pet_')) ? ` (Pet)` : ''}` : ''}` : ''}]]\n|-`)
      } else if (mon.isElite && data && data === tier /*&& category ? mon.category === category : element ? mon.element === element : true*/) {
        monsters.push(`\n| ${gImageOriginalData(mon.data, mon) ? `${gImageOriginalData(mon.data, mon)}` : ''}\n| [[${mon.name}${mon.alias ? `#${mon.alias}` : ''}|${mon.name}${mon.alias ? `${(mon.alias.includes('tutorial_') || mon.alias.includes('_tutorial')) ? ` (Tutorial)` : ''}${mon.alias ? `${mon.isBoss ? ` (Boss)` : ''}${mon.alias.includes('boss_') && !mon.isBoss ? ` (Boss Minion)` : ''}${mon.alias.includes('_hardmode') ? ` (Hardmode)` : ''}${mon.isElite ? ` (Elite)` : ''}${mon.alias.includes('_elite_minion') ? ` (Elite Minion)` : ''}${mon.alias.includes('_world') ? ` (World)` : ''}${mon.alias.includes('_dangerous') ? ` (Dangerous chest)` : ''}${mon.alias.includes('_dung') ? ` (Dungeon)` : ''}${mon.alias.includes('invasion_') ? ` (Invasion)` : ''}${(mon.alias.toLowerCase().includes(' pet') || mon.alias.toLowerCase().includes('pet_')) ? ` (Pet)` : ''}` : ''}` : ''}]]\n|-`)
      }
    })
  })
  if (tier === 0) {
    zero = monsters.join('')
  } else if (monsters.length > 0) {
    template += `== Tier ${tier} ==\n{| class="wikitable"\n|-\n! Sprite || Name\n|-`
    template += monsters.join('')
    template += `\n|}\n`
    console.log(template)
  }
  if (tier === 20) {
    template = ``
    template += `== Tier ??? ==\n{| class="wikitable"\n|-\n! Sprite || Name\n|-`
    template += zero
    template += `\n|}\n`
    console.log(template)
  }
}
