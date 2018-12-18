const fs = require('fs')
const path = require('path')
const moment = require('moment') // npm i moment
const momentDurationFormatSetup = require('moment-duration-format') // npm i moment-duration-format
momentDurationFormatSetup(moment)

var folder = {
  'ItemDefinition': path.join(__dirname, 'Patches', patchDate, 'ItemDefinition'),
  'Monster': path.join(__dirname, 'Patches', patchDate, 'Monster'),
  'LootTable': path.join(__dirname, 'Patches', patchDate, 'LootTable'),
  'Other': path.join(__dirname, 'Patches', patchDate, 'Other'),
  'Ancestral': path.join(__dirname, 'Patches', patchDate, 'Ancestral'),
  'CraftingRecipe': path.join(__dirname, 'Patches', patchDate, 'CraftingRecipe'),
  'ItemModifier': path.join(__dirname, 'Patches', patchDate, 'ItemModifier'),
  'LootBox': path.join(__dirname, 'Patches', patchDate, 'LootBox'),
  'NPC': path.join(__dirname, 'Patches', patchDate, 'NPC'),
  'Player': path.join(__dirname, 'Patches', patchDate, 'Player'),
  'Challenge': path.join(__dirname, 'Patches', patchDate, 'Challenge')
}

if (!fs.existsSync(path.join(__dirname, 'Wiki Templates'))) {
  fs.mkdirSync(path.join(__dirname, 'Wiki Templates'))
}

var patchDate = '2018-12-16'

let folder1 = 'ItemDefinition'
if (!fs.existsSync(path.join(__dirname, 'Wiki Templates', folder1))) {
  fs.mkdirSync(path.join(__dirname, 'Wiki Templates', folder1))
}
fs.readdir(folder['ItemDefinition'], (err, files) => {
  if (err) throw err
  let count = {}
  files.forEach(val => {
    var file = require(path.join(__dirname, folder1, val))
    var template = ``
    file.forEach(item => {
      template += `{{Item
  |title = ${item.name}
  |image = ${item.name}.png
  |caption = ${item.description || ''}
  |type = ${item.type}
  |tier = ${item.tier || ''}
  |bound = ${Object.keys(item.bound).map(v => {
    return item.bound[v] ? v.substr(0, 1).toUpperCase() + v.substr(1)  : undefined
  }).filter(Boolean).join(', ')}
  |max_stack = ${item.maxStack || ''}
  |buy_cost = ${(item.currency && typeof item.price === 'number' && item.price) ? `${item.price} {{Icon|${item.currency === 'Gold' ? 'Silver' : item.currency === 'Platinum' ? 'Electrum' : item.currency === 'Fame' ? 'Valr' : item.currency === 'Crystal' ? 'Bloodstone' : item.currency}}}` : ''}
  |sell_cost = ${item.sellPrice ? `${item.sellPrice} {{Icon|Silver}}` : ''}

  |class = ${item.class.map(c => `{{Icon|${c}}}`).join('<br>')}
  |max_health = ${item.stats ? item.stats.find(s => s.key === 'HealthMax') ? `{{Icon|Health|nolink=1}} ${item.stats.find(s => s.key === 'HealthMax').equation || item.stats.find(s => s.key === 'HealthMax').value} ${item.stats.find(s => s.key === 'HealthMax').equation && item.stats.find(s => s.key === 'HealthMax').value > 0 ? `<br>'''${item.stats.find(s => s.key === 'HealthMax').value}'''` : ''}` : '' : ''}
  |max_energy = ${item.stats ? item.stats.find(s => s.key === 'ManaMax') ? `{{Icon|Energy|nolink=1}} ${item.stats.find(s => s.key === 'ManaMax').equation || item.stats.find(s => s.key === 'ManaMax').value} ${item.stats.find(s => s.key === 'ManaMax').equation && item.stats.find(s => s.key === 'ManaMax').value > 0 ? ` <br>'''${item.stats.find(s => s.key === 'ManaMax').value}'''` : ''}` : '' : ''}
  |potency = ${item.stats ? item.stats.find(s => s.key === 'Potency') ? (`{{Icon|Potency|nolink=1}} ${item.stats.find(s => s.key === 'Potency').equation || item.stats.find(s => s.key === 'Potency').value} ${item.stats.find(s => s.key === 'Potency').equation && item.stats.find(s => s.key === 'Potency').value > 0 ? ` <br>'''${item.stats.find(s => s.key === 'Potency').value}'''` : ''}`) : '' : ''}
  |swiftness = ${item.stats ? item.stats.find(s => s.key === 'Swiftness') ? (`{{Icon|Swiftness|nolink=1}} ${item.stats.find(s => s.key === 'Swiftness').equation || item.stats.find(s => s.key === 'Swiftness').value} ${item.stats.find(s => s.key === 'Swiftness').equation && item.stats.find(s => s.key === 'Swiftness').value > 0 ? `<br>'''${item.stats.find(s => s.key === 'Swiftness').value}'''` : ''}`) : '' : ''}
  |endurance = ${item.stats ? item.stats.find(s => s.key === 'Endurance') ? (`{{Icon|Endurance|nolink=1}} ${item.stats.find(s => s.key === 'Endurance').equation || item.stats.find(s => s.key === 'Endurance').value} ${item.stats.find(s => s.key === 'Endurance').equation && item.stats.find(s => s.key === 'Endurance').value > 0 ? `<br>'''${item.stats.find(s => s.key === 'Endurance').value}'''` : ''}`) : '' : ''}
  |willpower = ${item.stats ? item.stats.find(s => s.key === 'Willpower') ? (`{{Icon|Willpower|nolink=1}} ${item.stats.find(s => s.key === 'Willpower').equation || item.stats.find(s => s.key === 'Willpower').value} ${item.stats.find(s => s.key === 'Willpower').equation && item.stats.find(s => s.key === 'Willpower').value > 0 ? `<br>'''${item.stats.find(s => s.key === 'Willpower').value}'''` : ''}`) : '' : ''}
  |focus = ${item.stats ? item.stats.find(s => s.key === 'Focus') ? (`{{Icon|Focus|nolink=1}} ${item.stats.find(s => s.key === 'Focus').equation || item.stats.find(s => s.key === 'Focus').value} ${item.stats.find(s => s.key === 'Focus').equation && item.stats.find(s => s.key === 'Focus').value > 0 ? `<br>'''${item.stats.find(s => s.key === 'Focus').value}'''` : ''}`) : '' : ''}

  |materials = ${!!item.data.find(s => s['crafting']) ? item.data.find(s => s['crafting']).crafting.requiredItems.map(i => `x${i.count} {{Icon|${i.name}}}`).join('<br>') : ''}
  |silver_cost = ${!!item.data.find(s => s['crafting']) ? item.data.find(s => s['crafting']).crafting.craftCost ? `${item.data.find(s => s['crafting']).crafting.craftCost} {{Icon|Silver|nolink=1}}` : '' : ''}
  |time = ${!!item.data.find(s => s['crafting']) ? moment.duration(Number(item.data.find(s => s['crafting']).crafting.craftingTime), 'seconds').format("h [hours], m [minutes], s [seconds]", { trim: 'both'}) : ''}

  |dismantle_chance = ${item['craftingRarity'] ? `${parseFloat(item['craftingRarity'][0] * 100)}%` : ''}
  |dismantle_materials = ${(item['bonusDismantleLoot'] && item['bonusDismantleLoot']['lootTable']) ? item['bonusDismantleLoot']['lootTable'].map(i => `${i.count.add ? `x${i.count.add} ` : ''}{{Icon|${i.item}}} ${i.chance}%`).join('<br>') : ''}
  |dismantle_silver_cost = ${(item['bonusDismantleLoot'] && item.data.find(s => s['crafting'])) ? `${Math.floor(item.sellPrice * 1.1).toFixed(0)} {{Icon|Silver|nolink=1}}` : ''}
  |dismantle_time = ${(item['bonusDismantleLoot'] && item.data.find(s => s['crafting'])) ? moment.duration(Math.max((Number(item.data.find(s => s['crafting']).crafting.craftingTime) * 0.75), 60), 'seconds').format("h [hours], m [minutes], s [seconds]", { trim: 'both'}) : ''}
}}`.replace(/\r?\n+|\r+/g, '\n').trim()
    template += `\n\n`
    })
    template += `
${file[0].type.length > 0 && file[0].type !== 'None' && file[0].type !== 'All' ? `[[Category:${file[0].type}]]` : ''}
[[Category:Tier ${file[0].tier}]]
${file[0].class.length > 0 ? file[0].class.map(c => `[[Category:${c}]]`).join('\n') : ''}
{{stub}}
'''{{PAGENAME}}'''`.replace(/\r?\n+|\r+/g, '\n').trim()
    fs.writeFileSync(path.join(__dirname, 'Wiki Templates', folder1, `${file[0].name}.txt`), template)
  })
})
