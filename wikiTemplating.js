const fs = require('fs')
const path = require('path')
const moment = require('moment') // npm i moment
const momentDurationFormatSetup = require('moment-duration-format') // npm i moment-duration-format
momentDurationFormatSetup(moment)

var patchDate = require(path.join(__dirname, 'patchDate.json'))['patchDate']

/*
  |dismantle_chance = ${item['craftingRarity'] ? `${parseFloat(item['craftingRarity'][0] * 100)}%` : ''}
  |dismantle_materials = ${(item['bonusDismantleLoot'] && item['bonusDismantleLoot']['lootTable']) ? item['bonusDismantleLoot']['lootTable'].map(i => `${i.count.add ? `x${i.count.add} ` : ''}{{Icon|${i.item}}} ${i.chance}%`).join('<br>') : ''}
  |dismantle_silver_cost = ${(item['bonusDismantleLoot'] && item.data.find(s => s['crafting'])) ? `${Math.floor(item.sellPrice * 1.1).toFixed(0)} {{Icon|Silver|nolink=1}}` : ''}
  |dismantle_time = ${(item['bonusDismantleLoot'] && item.data.find(s => s['crafting'])) ? moment.duration(Math.max((Number(item.data.find(s => s['crafting']).crafting.craftingTime) * 0.75), 60), 'seconds').format("h [hours], m [minutes], s [seconds]", { trim: 'both' }) : ''}
*/

module.exports = (() => {
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

  if (!fs.existsSync(path.join(__dirname, 'Wiki Templates', patchDate))) {
    fs.mkdirSync(path.join(__dirname, 'Wiki Templates', patchDate), { recursive: true })
  }

  function gData(data, name) {
    return data.find(v => v[name]) ? data.find(v => v[name])[name] : ''
  }

  function gStatsData(data, stat, icon) {
    var gsd = data.find(v => v.stats) ? data.find(v => v.stats).stats.find(v => v.key === stat) : ''
    return gsd
    ? (gsd.equation
      ? (`${icon ? `{{Icon|${icon}|nolink=1}} ` : ''}${gsd.equation}${gsd.value > 0
        ? (`<br>'''${gsd.value}'''`)
        : ''}`)
      : `${gsd.value > 0
        ? (`${icon ? `{{Icon|${icon}|nolink=1}} ` : ''}${gsd.value}`)
        : ''}`)
    : ''
  }
  
  function gWeapons(weapons) {
    return (weapons && weapons.length > 0) ? weapons.map(v => {
      var weaponData = (name) => v.data.find(v => v[name])[name]
      return `''\n{{{!}}class="wikitable" style="text-align:left;width:100%!important"\n{{!}} colspan="2" {{!}}'''${weaponData('projectile').name.replace(/[_]/g, ' ')}'''\n{{!}}-\n${weaponData('projectile').damage ? `{{!}} Damage {{!}}{{!}} ${weaponData('projectile').damage}\n{{!}}-\n` : ''}{{!}} Speed {{!}}{{!}} ${weaponData('projectile').speed}\n{{!}}-\n${weaponData('projectile').acceleration ? `{{!}} Acceleration {{!}}{{!}} ${weaponData('projectile').acceleration}\n{{!}}-\n` : ''}{{!}} Lifetime {{!}}{{!}} ${weaponData('projectile').maxLifetime}${weaponData('projectile').delayRate ? `\n{{!}}-\n{{!}} Delay rate {{!}}{{!}} ${weaponData('projectile').delayRate}` : ''}${weaponData('projectile').useTargetForRange ? `\n{{!}}-\n{{!}}Use target for range {{!}}{{!}} Yes` : ''}${weaponData('projectile').useRandomRange ? `\n{{!}}-\n{{!}} Use random range {{!}}{{!}} Yes\n{{!}}-\n{{!}} Random range max {{!}} ${weaponData('projectile').randomRangeMax} ` : ''}\n{{!}}-\n{{!}} Range {{!}}{{!}} ${weaponData('projectile').range}\n{{!}}-\n{{!}} Max hits {{!}}{{!}} ${weaponData('projectile').maxHits} ${weaponData('projectile').arcSeparation ? `\n{{!}}-\n{{!}} Arc Separation {{!}}{{!}} ${weaponData('projectile').arcSeparation} ` : ''}${weaponData('projectile').bounceBetweenEnemies ? `\n{{!}}-\n{{!}} Bounce between enemies {{!}}{{!}} Yes` : ''}${weaponData('projectile').pierceWorld ? `\n{{!}}-\n{{!}} Pierce world  {{!}}{{!}} Yes` : ''}\n${weaponData('projectile').statusEffect ? `{{!}}-\n{{!}} colspan="2" {{!}} Status\n{{!}}-\n{{!}} Effect name {{!}}{{!}} '''${weaponData('projectile').statusEffect.name}'''\n{{!}}-\n{{!}} Duration {{!}}{{!}} ${weaponData('projectile').statusEffect.duration} seconds\n{{!}}-\n{{!}} colspan="2" {{!}} Status statistics\n{{!}}-\n${weaponData('projectile').statusEffect.stats.map(v => (v.equation || v.value) ? `{{!}}${v.key} {{!}}{{!}} ${v.equation}${v.value ? ` '''${v.value}'''` : ''}` : '').filter(Boolean).join('\n{{!}}-\n')}\n{{!}}}` : '{{!}}}'}`
    }).join('\n') : ''
  }

  function gLootData(data) {
    var gld = data.find(v => v.loot) ? data.find(v => v.loot).loot : ''
    if (gld && gld.lootTable) {
      data.find(v => v.loot).loot.lootTable = data.find(v => v.loot).loot.lootTable.sort((a, b) => {
        return b.chance - a.chance
      })
    }
    return gld ? `''\n${gld.inheritedLootTable ? `'''Inheriting:''' [[Loot table/${gld.inheritedLootTable.name}|${gld.inheritedLootTable.name}]]<br>` : ''}${gld.guaranteeItemCount ? `Guaranteed drop amount: ${gld.guaranteeItemCount}<br>` : ''}${gld.maximumItemCount ? `Maximum drop amount: ${gld.maximumItemCount}<br>` : ''}${(gld.lootTable && gld.lootTable.length > 0) ? `\n{{{!}} style="width:100%!important"\n{{!}}-\n${gld.lootTable.map(v => `{{!}} x${v.count.add} {{!}}{{!}} {{Icon|${v.item}}} {{!}}{{!}} ${v.chance}%`).join('\n{{!}}-\n')}\n{{!}}}` : ''}`.replace(/Ã¤/g, 'ä') : ''
  }

  function gLoot(data) {
    var gld = data.lootTable.length > 0 ? data.lootTable.sort((a, b) => {
      return b.chance - a.chance
    }) : ''
    return gld ? `${data.reference ? `'''Inheriting:''' [[Loot table/${data.reference}|${data.reference}]]<br>\n` : ''}${gld.guaranteeItemCount ? `Guaranteed drop amount: ${gld.guaranteeItemCount}<br>\n` : ''}${gld.maximumItemCount ? `Maximum drop amount: ${gld.maximumItemCount}<br>\n` : ''}{|class="wikitable sortable"\n|-\n${gld.map(v => `| x${v.count.add} || {{Icon|${v.item}}} || ${v.chance}% `).join('\n|-\n')}\n|}`.replace(/Ã¤/g, 'ä') : ''
  }

  function gStats(stats, stat) {
    return stats.find(v => v.key === stat) ? stats.find(v => v.key === stat) : ''
  }

  function gImageOriginalData(data) {
    var giod = data.find(v => v.sprite) ? data.find(v => v.sprite).sprite : ''
    return giod ? `{{CSS image crop|Image=${giod.name}.png|bSize=${giod.baseSize.width}|cWidth=${giod.textureRectangle.width + 1}|cHeight=${giod.textureRectangle.height + 1}|oBottom=${giod.baseSize.height - (giod.textureRectangle.y + giod.textureRectangle.height)}|oLeft=${giod.textureRectangle.x}}}` : ''
  }
//  let folder1 = 'ItemDefinition'
//  if (folder[folder1]) {
//    if (!fs.existsSync(path.join(__dirname, 'Wiki Templates', patchDate, folder1))) {
//      fs.mkdirSync(path.join(__dirname, 'Wiki Templates', patchDate, folder1))
//    }
//
//    let count = {}
//    fs.readdirSync(folder[folder1]).forEach(val => {
//      var file = require(path.join(folder[folder1], val))
//      var template = ``
//      file.forEach(item => {
//        template += `{{Item
//  |title = ${item.name}
//  |image = ${item.data.find(v => v.sprite).sprite.name}.png
//  |caption = ${item.description || ''}
//  |type = ${item.type}
//  |tier = ${item.tier || ''}
//  |bound = ${Object.keys(item.bound).map(v => {
//          return item.bound[v] ? v.substr(0, 1).toUpperCase() + v.substr(1) : undefined
//        }).filter(Boolean).join(', ')}
//  |max_stack = ${item.maxStack || ''}
//  |buy_cost = ${(item.currency && typeof item.price === 'number' && item.price) ? `${item.price} {{Icon|${item.currency === 'Gold' ? 'Silver' : item.currency === 'Platinum' ? 'Electrum' : item.currency === 'Fame' ? 'Valr' : item.currency === 'Crystal' ? 'Bloodstone' : item.currency}}}` : ''}
//  |sell_cost = ${item.sellPrice ? `${item.sellPrice} {{Icon|Silver}}` : ''}
//
//  |class = ${item.class.map(c => `{{Icon|${c}}}`).join('<br>')}
//  |max_health = ${item.stats ? item.stats.find(s => s.key === 'HealthMax') ? `{{Icon|Health|nolink=1}} ${item.stats.find(s => s.key === 'HealthMax').equation || item.stats.find(s => s.key === 'HealthMax').value} ${item.stats.find(s => s.key === 'HealthMax').equation && item.stats.find(s => s.key === 'HealthMax').value > 0 ? `<br>'''${item.stats.find(s => s.key === 'HealthMax').value}'''` : ''}` : '' : ''}
//  |max_energy = ${item.stats ? item.stats.find(s => s.key === 'ManaMax') ? `{{Icon|Energy|nolink=1}} ${item.stats.find(s => s.key === 'ManaMax').equation || item.stats.find(s => s.key === 'ManaMax').value} ${item.stats.find(s => s.key === 'ManaMax').equation && item.stats.find(s => s.key === 'ManaMax').value > 0 ? ` <br>'''${item.stats.find(s => s.key === 'ManaMax').value}'''` : ''}` : '' : ''}
//  |potency = ${item.stats ? item.stats.find(s => s.key === 'Potency') ? (`{{Icon|Potency|nolink=1}} ${item.stats.find(s => s.key === 'Potency').equation || item.stats.find(s => s.key === 'Potency').value} ${item.stats.find(s => s.key === 'Potency').equation && item.stats.find(s => s.key === 'Potency').value > 0 ? ` <br>'''${item.stats.find(s => s.key === 'Potency').value}'''` : ''}`) : '' : ''}
//  |swiftness = ${item.stats ? item.stats.find(s => s.key === 'Swiftness') ? (`{{Icon|Swiftness|nolink=1}} ${item.stats.find(s => s.key === 'Swiftness').equation || item.stats.find(s => s.key === 'Swiftness').value} ${item.stats.find(s => s.key === 'Swiftness').equation && item.stats.find(s => s.key === 'Swiftness').value > 0 ? `<br>'''${item.stats.find(s => s.key === 'Swiftness').value}'''` : ''}`) : '' : ''}
//  |endurance = ${item.stats ? item.stats.find(s => s.key === 'Endurance') ? (`{{Icon|Endurance|nolink=1}} ${item.stats.find(s => s.key === 'Endurance').equation || item.stats.find(s => s.key === 'Endurance').value} ${item.stats.find(s => s.key === 'Endurance').equation && item.stats.find(s => s.key === 'Endurance').value > 0 ? `<br>'''${item.stats.find(s => s.key === 'Endurance').value}'''` : ''}`) : '' : ''}
//  |willpower = ${item.stats ? item.stats.find(s => s.key === 'Willpower') ? (`{{Icon|Willpower|nolink=1}} ${item.stats.find(s => s.key === 'Willpower').equation || item.stats.find(s => s.key === 'Willpower').value} ${item.stats.find(s => s.key === 'Willpower').equation && item.stats.find(s => s.key === 'Willpower').value > 0 ? `<br>'''${item.stats.find(s => s.key === 'Willpower').value}'''` : ''}`) : '' : ''}
//  |focus = ${item.stats ? item.stats.find(s => s.key === 'Focus') ? (`{{Icon|Focus|nolink=1}} ${item.stats.find(s => s.key === 'Focus').equation || item.stats.find(s => s.key === 'Focus').value} ${item.stats.find(s => s.key === 'Focus').equation && item.stats.find(s => s.key === 'Focus').value > 0 ? `<br>'''${item.stats.find(s => s.key === 'Focus').value}'''` : ''}`) : '' : ''}
//
//  |materials = ${!!item.data.find(s => s['crafting']) ? item.data.find(s => s['crafting']).crafting.requiredItems.map(i => `x${i.count} {{Icon|${i.name}}}`).join('<br>') : ''}
//  |silver_cost = ${!!item.data.find(s => s['crafting']) ? item.data.find(s => s['crafting']).crafting.craftCost ? `${item.data.find(s => s['crafting']).crafting.craftCost} {{Icon|Silver|nolink=1}}` : '' : ''}
//  |time = ${!!item.data.find(s => s['crafting']) ? moment.duration(Number(item.data.find(s => s['crafting']).crafting.craftingTime), 'seconds').format("h [hours], m [minutes], s [seconds]", { trim: 'both' }) : ''}
//
//  |dismantle_name = [[${(item['bonusDismantleLoot'].length > 0 ? item['bonusDismantleLoot'] : '')}]]
//}}`.replace(/\r?\n+|\r+/g, '\n').trim()
//        template += `\n\n`
//      })
//      template += `
//${file[0].type.length > 0 && file[0].type !== 'None' && file[0].type !== 'All' ? `[[Category:${file[0].type}]]` : ''}
//[[Category:Tier ${file[0].tier}]]
//${file[0].class.length > 0 ? file[0].class.map(c => `[[Category:${c}]]`).join('\n') : ''}
//{{stub}}
//'''{{PAGENAME}}'''`.replace(/\r?\n+|\r+/g, '\n').trim()
//      fs.writeFileSync(path.join(__dirname, 'Wiki Templates', folder1, `${file[0].name}.txt`), template)
//    })
//  }

  let folder2 = 'Monster'
  if (folder[folder2]) {
    if (!fs.existsSync(path.join(__dirname, 'Wiki Templates', patchDate, folder2))) {
      fs.mkdirSync(path.join(__dirname, 'Wiki Templates', patchDate, folder2))
    }

    let count = {}
    fs.readdirSync(folder[folder2]).forEach((val, ind) => {
      var file = require(path.join(folder[folder2], val))
      var template = `{{stub}}\n\n`
      var count = -1
      file.sort((a, b) => {
        return Number(gStatsData(a.data, 'HealthMax')) - Number(gStatsData(b.data, 'HealthMax'))
      }).sort((a, b) => {
        return Number(gStatsData(a.data, 'Tier')) - Number(gStatsData(b.data, 'Tier'))
      }).forEach((item, ind, arr) => {
        count++
        template += arr.length > 1 ? `${ind === 0 ? `<div class="tabbertab-borderless"><tabber>\n` : '\n'}${item.alias ? item.alias.replace(/[_]/g, ' ') : `${item.name} ${ind + 1}`}= ` : ''
        template += `{{Enemy
  |title = ${item.name}
  |image = ${/*item.data.find(v => v.sprite) ? item.data.find(v => v.sprite).sprite.name : */item.name}.png
  |image_original = ${gImageOriginalData(item.data)}
  |caption = ${item.description || ''}
  |location = 
  |category = ${item.category || ''}
  |is_boss = ${item.isBoss ? 'Yes' : ''}
  |is_elite = ${item.isElite ? 'Yes' : ''}
  |is_set_piece_monster = ${item.isSetPieceMonster ? 'Yes' : ''}
  |element = ${(!item.element || item.element) === 'None' ? '' : item.element}
  |tier = ${gStatsData(item.data, 'Tier')}
  |level = ${gStatsData(item.data, 'Level')}
  |max_health = ${gStatsData(item.data, 'HealthMax', 'Health')}
  |experience = ${gStatsData(item.data, 'Experience')}
  |damage_bonus = ${gStatsData(item.data, 'DamageBonus')}
  |accuracy = ${gStatsData(item.data, 'Accuracy')}
  |critical_defense = ${gStatsData(item.data, 'CriticalDefense')}
  |weapons = ${gWeapons(item.weapons)}
  |dialogue = ${gData(item.data, 'healthDialogue') ? gData(item.data, 'healthDialogue').map(v => `<u>'''${v.healthPercentage * 100}% health:'''</u> ''${v.message}''`).join('<br>') : gData(item.data, 'dialogue') ? gData(item.data, 'dialogue').map(v => `''${v.message}''`).join('<br>') : ''}
  |drops = ${gLootData(item.data)}
}}`.replace(/\r?\n+|\r+/g, '\n').trim()
        template += arr.length > 1 ? `\n|-|` : ''
      })
      template += count > 0 ? `\n</tabber></div>\n` : '\n\n'
      template += `
[[Category:Monster]]
${file[0].category.length > 0 && file[0].category !== 'None' && file[0].category !== 'All' ? `[[Category:${file[0].category}]]` : ''}
${(file[0].element && file[0].element !== 'None' && file[0].element !== 'All') ? `[[Category:${file[0].element}]]` : ''}
${file[0].isBoss ? '[[Category:Boss]]' : ''}
${file[0].isElite ? '[[Category:Elite]]' : ''}
${file[0].isSetPieceMonster ? '[[Category:Set Piece Monster]]' : ''}`.replace(/\r?\n+|\r+/g, '\n').trim()
      template += `\n\n'''{{PAGENAME}}'''`
      fs.writeFileSync(path.join(__dirname, 'Wiki Templates', patchDate, folder2, `${file[0].name}.txt`), template)
    })
  }

  let folder3 = 'LootTable'
  if (folder[folder3]) {
    if (!fs.existsSync(path.join(__dirname, 'Wiki Templates', patchDate, folder3))) {
      fs.mkdirSync(path.join(__dirname, 'Wiki Templates', patchDate, folder3))
    }

    let count = {}
    fs.readdirSync(folder[folder3]).forEach((val, ind) => {
      var file = require(path.join(folder[folder3], val))
      var template = `{{stub}}\n'''{{PAGENAME}}'''\n\n`
      var count = -1
      file.sort((a, b) => {
        return a.lootTable.length - b.lootTable.length
      }).forEach((item, ind, arr) => {
        count++
        template += arr.length > 1 ? `${ind === 0 ? `<div class="tabbertab-borderless"><tabber>\n` : ''}${item.from} ${ind + 1}= ` : ''
        template += `${gLoot(item)}`.replace(/\r?\n+|\r+/g, '\n').trim()
        template += count > 0 ? `\n|-|` : ''
      })
      template += count > 0 ? `\n</tabber></div>\n` : '\n\n'
      template += `\n{{Special:Whatlinkshere/Loot table/${file[0].from}}}\n[[Category:Loot table]]`.replace(/\r?\n+|\r+/g, '\n').trim()
      fs.writeFileSync(path.join(__dirname, 'Wiki Templates', patchDate, folder3, `${file[0].from}.txt`), template)
    })
  }
})()
