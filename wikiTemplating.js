const fs = require('fs')
const path = require('path')
const moment = require('moment') // npm i moment
const momentDurationFormatSetup = require('moment-duration-format') // npm i moment-duration-format
momentDurationFormatSetup(moment)

if (!fs.existsSync(path.join(__dirname, 'Wiki Templates'))) {
  fs.mkdirSync(path.join(__dirname, 'Wiki Templates'))
}

let folder1 = 'ItemDefinition'
fs.readdir(path.join(__dirname, folder1), (err, files) => {
  if (err) throw err
  let count = {}
  files.forEach(val => {
    var file = require(path.join(__dirname, folder1, val))
    var template = `{{Item
  |title = ${file.name}
  |image = ${file.name}.png
  |caption = ${file.description || ''}
  |type = ${file.type}
  |tier = ${file.tier}
  |bound = ${Object.keys(file.bound).map(v => {
    return file.bound[v] ? v.substr(0, 1).toUpperCase() + v.substr(1)  : undefined
  }).filter(Boolean).join(', ')}
  |max_stack = ${file.maxStack}
  |buy_cost = ${(file.currency && typeof file.price === 'number' && file.price) ? `${file.price} {{Icon|${file.currency}}}` : ''}
  |sell_cost = ${file.sellPrice ? `${file.sellPrice} {{Icon|Silver}}` : ''}

  |class = ${file.class.map(c => `{{Icon|${c}}}`).join('<br>')}
  |max_health = ${file.stats ? file.stats.find(s => s.key === 'HealthMax') ? `{{Icon|Health|nolink=1}} ${file.stats.find(s => s.key === 'HealthMax').equation || file.stats.find(s => s.key === 'HealthMax').value} ${file.stats.find(s => s.key === 'HealthMax').equation && file.stats.find(s => s.key === 'HealthMax').value > 0 ? `<br>'''${file.stats.find(s => s.key === 'HealthMax').value}'''` : ''}` : '' : ''}
  |max_energy = ${file.stats ? file.stats.find(s => s.key === 'ManaMax') ? `{{Icon|Energy|nolink=1}} ${file.stats.find(s => s.key === 'ManaMax').equation || file.stats.find(s => s.key === 'ManaMax').value} ${file.stats.find(s => s.key === 'ManaMax').equation && file.stats.find(s => s.key === 'ManaMax').value > 0 ? ` <br>'''${file.stats.find(s => s.key === 'ManaMax').value}'''` : ''}` : '' : ''}
  |potency = ${file.stats ? file.stats.find(s => s.key === 'Potency') ? (`{{Icon|Potency|nolink=1}} ${file.stats.find(s => s.key === 'Potency').equation || file.stats.find(s => s.key === 'Potency').value} ${file.stats.find(s => s.key === 'Potency').equation && file.stats.find(s => s.key === 'Potency').value > 0 ? ` <br>'''${file.stats.find(s => s.key === 'Potency').value}'''` : ''}`) : '' : ''}
  |swiftness = ${file.stats ? file.stats.find(s => s.key === 'Swiftness') ? (`{{Icon|Swiftness|nolink=1}} ${file.stats.find(s => s.key === 'Swiftness').equation || file.stats.find(s => s.key === 'Swiftness').value} ${file.stats.find(s => s.key === 'Swiftness').equation && file.stats.find(s => s.key === 'Swiftness').value > 0 ? `<br>'''${file.stats.find(s => s.key === 'Swiftness').value}'''` : ''}`) : '' : ''}
  |endurance = ${file.stats ? file.stats.find(s => s.key === 'Endurance') ? (`{{Icon|Endurance|nolink=1}} ${file.stats.find(s => s.key === 'Endurance').equation || file.stats.find(s => s.key === 'Endurance').value} ${file.stats.find(s => s.key === 'Endurance').equation && file.stats.find(s => s.key === 'Endurance').value > 0 ? `<br>'''${file.stats.find(s => s.key === 'Endurance').value}'''` : ''}`) : '' : ''}
  |willpower = ${file.stats ? file.stats.find(s => s.key === 'Willpower') ? (`{{Icon|Willpower|nolink=1}} ${file.stats.find(s => s.key === 'Willpower').equation || file.stats.find(s => s.key === 'Willpower').value} ${file.stats.find(s => s.key === 'Willpower').equation && file.stats.find(s => s.key === 'Willpower').value > 0 ? `<br>'''${file.stats.find(s => s.key === 'Willpower').value}'''` : ''}`) : '' : ''}
  |focus = ${file.stats ? file.stats.find(s => s.key === 'Focus') ? (`{{Icon|Focus|nolink=1}} ${file.stats.find(s => s.key === 'Focus').equation || file.stats.find(s => s.key === 'Focus').value} ${file.stats.find(s => s.key === 'Focus').equation && file.stats.find(s => s.key === 'Focus').value > 0 ? `<br>'''${file.stats.find(s => s.key === 'Focus').value}'''` : ''}`) : '' : ''}

  |materials = ${!!file.data.find(s => s['crafting']) ? file.data.find(s => s['crafting']).crafting.requiredItems.map(i => `x${i.count} {{Icon|${i.name}}}`).join('<br>') : ''}
  |silver_cost = ${!!file.data.find(s => s['crafting']) ? `${file.data.find(s => s['crafting']).crafting.craftCost} {{Icon|Silver|nolink=1}}` : ''}
  |time = ${!!file.data.find(s => s['crafting']) ? moment.duration(Number(file.data.find(s => s['crafting']).crafting.craftingTime), 'seconds').format("h [hours], m [minutes], s [seconds]", { trim: 'both'}) : ''}

  |dismantle_chance = ${file['craftingRarity'] ? `${parseFloat(file['craftingRarity'][0] * 100)}%` : ''}
  |dismantle_materials = ${(file['bonusDismantleLoot'] && file['bonusDismantleLoot']['lootTable']) ? file['bonusDismantleLoot']['lootTable'].map(i => `${i.count.add ? `x${i.count.add} ` : ''}{{Icon|${i.item}}} ${i.chance}%`).join('<br>') : ''}
  |dismantle_silver_cost = ${(file['bonusDismantleLoot'] && file.data.find(s => s['crafting'])) ? `${Math.floor(file.sellPrice * 1.1).toFixed(0)} {{Icon|Silver|nolink=1}}` : ''}
  |dismantle_time = ${(file['bonusDismantleLoot'] && file.data.find(s => s['crafting'])) ? moment.duration(Math.max((Number(file.data.find(s => s['crafting']).crafting.craftingTime) * 0.75), 60), 'seconds').format("h [hours], m [minutes], s [seconds]", { trim: 'both'}) : ''}
}}

${file.type.length > 0 && file.type !== 'None' && file.type !== 'All' ? `[[Category:${file.type}]]` : ''}
[[Category:Tier ${file.tier}]]
${file.class.length > 0 ? file.class.map(c => `[[Category:${c}]]`).join('\n') : ''}
{{stub}}
'''{{PAGENAME}}'''
`.replace(/\r?\n+|\r+/g, '\n').trim()

    if (!fs.existsSync(path.join(__dirname, 'Wiki Templates', folder1))) {
      fs.mkdirSync(path.join(__dirname, 'Wiki Templates', folder1))
    }

    fs.writeFileSync(path.join(__dirname, 'Wiki Templates', folder1, `${file.name}.txt`), template)
  })
})
