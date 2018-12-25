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
    'Challenge': path.join(__dirname, 'Patches', patchDate, 'Challenge'),
    'Ancestral/Set bonuses': path.join(__dirname, 'Patches', patchDate, 'Ancestral', 'Set bonuses')
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
    return (weapons && weapons.length > 0) ? weapons.map((v, ind) => {
      var weaponData = (name) => v.data.find(v => v[name])[name]
      return `${ind > 0 ? `    ''` : `''`}
    {{{!}}class="wikitable" style="text-align:left;width:100%!important"
    {{!}}-
    {{!}} ${v.data.find(v => v.sprite) ? `'''${weaponData('projectile').name.replace(/[_]/g, ' ')}''' {{!!}} <center>${gImageOriginalData(v.data)}</center>
    ` : `colspan="2" {{!}}'''${weaponData('projectile').name.replace(/[_]/g, ' ')}'''`}
    {{!}}-
    ${weaponData('projectile').damage ? `{{!}} Damage {{!!}} ${weaponData('projectile').damage}
    {{!}}-
    ` : ''}{{!}} Speed {{!!}} ${weaponData('projectile').speed}
    {{!}}-
    ${weaponData('projectile').acceleration ? `{{!}} Acceleration {{!!}} ${weaponData('projectile').acceleration}
    {{!}}-
    ` : ''}{{!}} Lifetime {{!!}} ${weaponData('projectile').maxLifetime}
    ${weaponData('projectile').delayRate ? `{{!}}-
    {{!}} Delay rate {{!!}} ${weaponData('projectile').delayRate}` : ''}
    ${weaponData('projectile').useTargetForRange ? `{{!}}-
    {{!}}Use target for range {{!!}} Yes` : ''}${weaponData('projectile').useRandomRange ? `
    {{!}}-
    {{!}} Use random range {{!!}} Yes
    {{!}}-
    {{!}} Random range max {{!!}} ${weaponData('projectile').randomRangeMax}` : ''}
    {{!}}-
    {{!}} Range {{!!}} ${weaponData('projectile').range}
    {{!}}-
    {{!}} Max hits {{!!}} ${weaponData('projectile').maxHits}
    ${weaponData('projectile').arcSeparation ? `{{!}}-
    {{!}} Arc Separation {{!!}} ${weaponData('projectile').arcSeparation}` : ''}
    ${weaponData('projectile').bounceBetweenEnemies ? `{{!}}-
    {{!}} Bounce between enemies {{!!}} Yes` : ''}
    ${weaponData('projectile').pierceWorld ? `
    {{!}}-
    {{!}} Pierce world  {{!!}} Yes` : ''}
    ${weaponData('projectile').statusEffect ? `{{!}}-
    {{!}} colspan="2" {{!}} Status
    {{!}}-
    {{!}} Effect name {{!!}} '''${weaponData('projectile').statusEffect.name}'''
    {{!}}-
    {{!}} Duration {{!!}} ${weaponData('projectile').statusEffect.duration} seconds
    {{!}}-
    {{!}} colspan="2" {{!}} Status statistics
    {{!}}-
    ${weaponData('projectile').statusEffect.stats.map(v => (v.equation || v.value) ? `{{!}} ${v.key} {{!!}} ${v.equation}${v.value ? ` '''${v.value}'''` : ''}` : '').filter(Boolean).join(`
    {{!}}-
    `)}` : ''}
    {{!}}}`}).join('\n').replace(/    [\n\r]+/g, '\n') : ''
  }

  function gLootData(data) {
    var gld = data.find(v => v.loot) ? data.find(v => v.loot).loot : ''
    if (gld && gld.lootTable) {
      data.find(v => v.loot).loot.lootTable = data.find(v => v.loot).loot.lootTable.sort((a, b) => {
        return b.chance - a.chance
      })
    }
    return `${gld.inheritedLootTable ? `'''Inheriting:''' [[Loot table/${gld.inheritedLootTable.name}|${gld.inheritedLootTable.name}]]` : ''}
    ${gld.questLootTable ? `'''Quest loot table:''' [[Loot table/${gld.questLootTable.name}|${gld.questLootTable.name}]]<br>\n` : ''}
    ${gld.guaranteeItemCount ? `Guaranteed drop amount: ${gld.guaranteeItemCount}<br>` : ''}${gld.maximumItemCount ? `Maximum drop amount: ${gld.maximumItemCount}` : ''}
    ${gld ? `${(gld.lootTable && gld.lootTable.length > 0) ? `
    {{{!}} style="width:100%!important"
    {{!}}-
    ${gld.lootTable.map(v => `{{!}} x${v.count.add} {{!}}{{!}} {{Icon|${v.item}}} {{!}}{{!}} ${v.chance}%`).join('\n    {{!}}-\n    ')}\n    {{!}}}` : ''}` : ''}`.replace(/Ã¤/g, 'ä').replace(/    [\n\r]+/g, '\n')
  }

  function gLoot(data) {
    var gld = data.lootTable.length > 0 ? data.lootTable.sort((a, b) => {
      return b.chance - a.chance
    }) : ''
    return `${data.reference ? `'''Inheriting:''' [[Loot table/${data.reference}|${data.reference}]]<br>\n` : ''}${data.questLootTable ? `'''Quest loot table:''' [[Loot table/${data.questLootTable.name}|${data.questLootTable.name}]]<br>\n` : ''}${gld ? `${gld.guaranteeItemCount ? `Guaranteed drop amount: ${gld.guaranteeItemCount}<br>\n` : ''}${gld.maximumItemCount ? `Maximum drop amount: ${gld.maximumItemCount}<br>\n` : ''}{|class="wikitable sortable"\n|-\n${gld.map(v => `| x${v.count.add} || {{Icon|${v.item}}} || ${v.chance}% `).join('\n|-\n')}\n|}`.replace(/Ã¤/g, 'ä') : ''}`
  }

  function gStats(stats, stat) {
    return stats.find(v => v.key === stat) ? stats.find(v => v.key === stat) : ''
  }

  function gImageOriginalData(data) {
    var giod = data.find(v => v.sprite) ? data.find(v => v.sprite).sprite : ''
    return giod ? `{{CSS image crop|Image=${giod.name}.png|bSize=${giod.baseSize.width}|cWidth=${giod.textureRectangle.width}|cHeight=${giod.textureRectangle.height}|oBottom=${giod.baseSize.height - (giod.textureRectangle.y + giod.textureRectangle.height)}|oLeft=${giod.textureRectangle.x}}}` : ''
  }

  function gAncestralProcData(data) {
    var gpd = data.find(v => v.proc) ? data.find(v => v.proc).proc : ''
    return gpd ? `! colspan="3" | Proc
    |-
    ${gpd.counterMax ? `| Counter max || colspan="2" | ${gpd.counterMax}
    |-` : ''}
    ${gpd.timerValue ? `| Timer value || colspan="2" | ${gpd.timerValue}
    |-` : ''}
    ${gpd.projectileDamageMultiplier ? `| Projectile damage multiplier || colspan="2" | ${gpd.projectileDamageMultiplier}
    |-` : ''}
    ${gpd.useAncestralBenefitForDamage ? `| Use ancestral benefit for damage || colspan="2" | ${gpd.useAncestralBenefitForDamage}
    |-` : ''}
    ${gpd.triggers ? `| Triggers || colspan="2" | 
    {| class="wikitable"
      |-
      ${gpd.triggers.map(t => {
        return `        | colspan="2" | ${t.trigger}
        |-
        | Chance || ${t.chance}
        |-
        | Chance source || ${t.chanceSource}
        |-
        | Action || ${t.action}`.replace(/      /g, '    ')
    }).join('\n                  |-\n')}\n                |}` : ''}`.replace(/    [\n\r]+/g, '\n') : ''
  }

  function gAncestralStats(stats, colspan) {
    var gas = stats.length > 0 ? stats : ''
    return gas ? `! colspan="${colspan || 3}" | Stats
    |-
    ! Key !! Equation !! Value
    |-
    ${gas.map(stat => {
      return `| ${stat.key} || ${stat.equation} || ${stat.value > 0 ? stat.value : ''}`
    }).join('\n          |-\n    ')}`.replace(/      [\n\r]+/g, '\n') : ''
  }

  function gAncestralSetsData(sets) {
    var set = sets
    return `! colspan="3" | [[File:${set.sprite.name}.png|nolink=]] ${set.alias}
    |-
    ${set.setBonuses.sort((a, b) => {
      return a.requiredAmount - b.requiredAmount
    }).map(bonus => {
      return `| colspan="3" style="text-align:center;" | '''${bonus.name}:''' ${bonus.description}
    |-
    | Required amount || colspan="2" | '''${bonus.requiredAmount}'''
    |-
    ${gAncestralStats(bonus.stats)}`
    }).join('\n  |-\n  | colspan="3" style="border: none;" | <hr style="background-color:transparent;">\n  |-\n  ')}`.replace(/    /g, '  ')
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
//      template += `\n\n<!-- ALL LINES ABOVE ARE AUTOMATED, CHANGES DONE ABOVE MAY BE OVERWRITTEN;GENERATION DATE:${new Date().toUTCString()} -->
//      fs.writeFileSync(path.join(__dirname, 'Wiki Templates', folder1, `${file[0].name}.txt`), template)
//    })
//  }

  let folder2 = 'Monster'
  if (folder[folder2]) {
    if (!fs.existsSync(path.join(__dirname, 'Wiki Templates', patchDate, folder2))) {
      fs.mkdirSync(path.join(__dirname, 'Wiki Templates', patchDate, folder2))
    }
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
        template += arr.length > 1 ? `${ind === 0 ? `<div class="tabbertab-borderless"><tabber>\n` : '\n'}${item.alias ? item.alias.replace(/[_]/g, ' ') : `${item.name} ${ind + 1}`}=` : ''
        template += `{{Enemy
        |title = ${item.name}
        ${gImageOriginalData(item.data) ? '' : `|image = ${item.name}.png`}
        ${gImageOriginalData(item.data) ? `|image_original = ${gImageOriginalData(item.data)}` : ''}
        ${item.description ? `|caption = ${item.description}` : ''}
        |location = 
        ${item.category ? `|category = ${item.category}` : ''}
        ${item.isBoss ? '|is_boss = Yes' : ''}
        ${item.isElite ? '|is_elite = Yes' : ''}
        ${item.isSetPieceMonster ? '|is_set_piece_monster = Yes' : ''}
        ${(!item.element || item.element) === 'None' ? '' : `|element = ${item.element}`}
        ${gStatsData(item.data, 'Tier') ? `|tier = ${gStatsData(item.data, 'Tier')}` : ''}
        ${gStatsData(item.data, 'Level') ? `|level = ${gStatsData(item.data, 'Level')}` : ''}
        ${gStatsData(item.data, 'HealthMax', 'Health') ? `|max_health = ${gStatsData(item.data, 'HealthMax', 'Health')}` : ''}
        ${gStatsData(item.data, 'Experience') ? `|experience = ${gStatsData(item.data, 'Experience')}` : ''}
        ${gStatsData(item.data, 'DamageBonus') ? `|damage_bonus = ${gStatsData(item.data, 'DamageBonus')}` : ''}
        ${gStatsData(item.data, 'Accuracy') ? `|accuracy = ${gStatsData(item.data, 'Accuracy')}` : ''}
        ${gStatsData(item.data, 'CriticalDefense') ? `|critical_defense = ${gStatsData(item.data, 'CriticalDefense')}` : ''}
        ${gWeapons(item.weapons) ? `|weapons = ${gWeapons(item.weapons)}` : ''}
        ${(gData(item.data, 'healthDialogue') || gData(item.data, 'dialogue')) ? `|dialogue = ${gData(item.data, 'healthDialogue') ? gData(item.data, 'healthDialogue').map(v => `<u>'''${v.healthPercentage * 100}% health:'''</u> ''${v.message}''`).join('<br>') : gData(item.data, 'dialogue') ? gData(item.data, 'dialogue').map(v => `''${v.message}''`).join('<br>') : ''}` : ''}
        ${gLootData(item.data) ? `|drops = ${gLootData(item.data)}` : ''}
        }}`.replace(/        [\n\r]+/g, '\n').replace(/\r?\n+|\r+/g, '\n').replace(/        /g, '  ').trim()
        template += arr.length > 1 ? `\n|-|` : ''
      })
      template += count > 0 ? `\n</tabber></div>\n` : '\n\n'
      template += `\n[[Category:Monster]]
${file[0].category.length > 0 && file[0].category !== 'None' && file[0].category !== 'All' ? `[[Category:${file[0].category}]]` : ''}
${(file[0].element && file[0].element !== 'None' && file[0].element !== 'All') ? `[[Category:${file[0].element}]]` : ''}
${file[0].isBoss ? '[[Category:Boss]]' : ''}
${file[0].isElite ? '[[Category:Elite]]' : ''}
${file[0].isSetPieceMonster ? '[[Category:Set Piece Monster]]' : ''}`.replace(/\r?\n+|\r+/g, '\n').trim()
      template += `\n\n<!-- ALL LINES ABOVE ARE AUTOMATED, CHANGES DONE ABOVE MAY BE OVERWRITTEN;GENERATION DATE:${new Date().toUTCString()} -->`
      template = template.replace(/\r?\n+|\r+/g, '\n').trim()
      fs.writeFileSync(path.join(__dirname, 'Wiki Templates', patchDate, folder2, `${file[0].name}.txt`), template)
    })
  }

  let folder3 = 'LootTable'
  if (folder[folder3]) {
    if (!fs.existsSync(path.join(__dirname, 'Wiki Templates', patchDate, folder3))) {
      fs.mkdirSync(path.join(__dirname, 'Wiki Templates', patchDate, folder3))
    }
    fs.readdirSync(folder[folder3]).forEach((val, ind) => {
      var file = require(path.join(folder[folder3], val))
      var template = `{{stub}}\n'''{{PAGENAME}}'''\n\n`
      var count = -1
      file.sort((a, b) => {
        return a.lootTable.length - b.lootTable.length
      }).forEach((item, ind, arr) => {
        count++
        template += arr.length > 1 ? `${ind === 0 ? `<div class="tabbertab-borderless"><tabber>\n` : ''}${item.from} ${ind + 1}=` : ''
        template += `${gLoot(item)}`
        template += count > 0 ? `\n|-|` : ''
      })
      template += count > 0 ? `\n</tabber></div>\n` : '\n\n'
      template += `\n{{Special:Whatlinkshere/Loot table/${file[0].from}}}\n[[Category:Loot table]]`.replace(/\r?\n+|\r+/g, '\n').trim()
      template += `\n\n<!-- ALL LINES ABOVE ARE AUTOMATED, CHANGES DONE ABOVE MAY BE OVERWRITTEN;GENERATION DATE:${new Date().toUTCString()} -->`
      template = template.replace(/\r?\n+|\r+/g, '\n').trim()
      fs.writeFileSync(path.join(__dirname, 'Wiki Templates', patchDate, folder3, `${file[0].from}.txt`), template)
    })
  }

  let folder4 = 'Ancestral'
  if (folder[folder4]) {
    if (!fs.existsSync(path.join(__dirname, 'Wiki Templates', patchDate, folder4))) {
      fs.mkdirSync(path.join(__dirname, 'Wiki Templates', patchDate, folder4))
    }
    fs.readdirSync(folder[folder4]).forEach((val, ind) => {
      if (val === 'Set bonuses') return
      var file = require(path.join(folder[folder4], val))
      var template = `{{stub}}\n\n`
      var count = 0
      file.sort((a, b) => {
        return Number(a.alias.replace(/[^0-9]+/g, '')) - Number(b.alias.replace(/[^0-9]+/g, ''))
      }).forEach((item, ind, arr) => {
        count++
        template += arr.length > 1 ? `${ind === 0 ? `<div class="tabbertab-borderless"><tabber>\n` : ''}${item.alias}${item.rarity ? ` (${item.rarity})` : ''}=` : ''
        template += `${item.ordinaries && item.ordinaries.length > 0 ? `{| style="float:right;"
        |-
        | {{Ancestral Legacy
          | name = ${item.name}
          | description = ${item.description ? item.description.replace('#', item.stats.length > 0 ? `${parseFloat(eval(item.stats.find(s => s.key === 'Benefit').equation.replace('[AncestralData.Ancestral_Level]', 1)).toFixed(2))}` : '#') : ''}
          | level = 1
          | rarity = ${item.rarity.toLowerCase()}
          ${(item.ordinaries && item.ordinaries.length > 0) ? item.ordinaries.map((o, ind) => {
            return `| ordinary${ind + 1} = ${o.sprite.name}`
          }).join('\n          ') : ''}
          ${(item.sets && item.sets.length > 0) ? item.sets.map((o, ind) => {
            return `| set${ind + 1} = ${o.sprite}`
          }).join('\n          ') : ''}
          }}
        |-
        | {{Ancestral Legacy
          | name = ${item.name}
          | description = ${item.description ? item.description.replace('#', item.stats.length > 0 ? `${parseFloat(eval(item.stats.find(s => s.key === 'Benefit').equation.replace('[AncestralData.Ancestral_Level]', 50)).toFixed(2))}` : '#') : ''}
          | level = 50
          | rarity = ${item.rarity.toLowerCase()}
          ${(item.ordinaries && item.ordinaries.length > 0) ? item.ordinaries.map((o, ind) => {
            return `| ordinary${ind + 1} = ${o.sprite.name}`
          }).join('\n          ') : ''}
          ${(item.sets && item.sets.length > 0) ? item.sets.map((o, ind) => {
            return `| set${ind + 1} = ${o.sprite}`
          }).join('\n          ') : ''}
          }}
        |}` : ''}
        {| class="wikitable mw-collapsible"
          |-
          ! colspan="3" | ${item.name === 'Deprecated' ? item.alias : item.name}
          |-
          | Available || colspan="2" | ${item.doNotAward ? 'No' : 'Yes'}
          |-
          | Rarity || colspan="2" | ${item.rarity}
          |-
          | Classes || colspan="2" | ${item.validClasses.map(c => `{{Icon|${c}}}`).join('<br>')}
          |-
          ${gAncestralStats(item.stats)}
        |}
        ${gAncestralProcData(item.data) ? `{| class="wikitable mw-collapsible mw-collapsed"
          |-
          ${gAncestralProcData(item.data)}
        |}` : ''}
        ${item.sets ? `{| class="wikitable"
          |-
          ! Sets
          |-
          ${item.sets.map(v => {
            return `| [[File:${v.sprite}.png]] [[Ancestral_Legacy/Set Bonus#${v.alias.replace(/[ ]+/g,'_')}|${v.alias}]]`
          }).join('\n          |-\n    ')}
        |}` : ''}`.replace(/\r?\n+|\r+/g, '\n').replace(/        /g, '  ').replace(/  \n/g, '').trim()
        template += count > 0 ? `\n|-|\n` : ''
      })
      template += count > 0 ? `\n</tabber></div>\n` : '\n\n'
      template += `\n[[Category:Ancestral Legacy]]`.replace(/\r?\n+|\r+/g, '\n').trim()
      template += `\n\n<!-- ALL LINES ABOVE ARE AUTOMATED, CHANGES DONE ABOVE MAY BE OVERWRITTEN;GENERATION DATE:${new Date().toUTCString()} -->`
      template = template.replace(/\r?\n+|\r+/g, '\n').trim()
      fs.writeFileSync(path.join(__dirname, 'Wiki Templates', patchDate, folder4, `${file[0].name}.txt`), template)
    })
  }
  // Set bonuses
  /*
    {| class="wikitable mw-collapsible mw-collapsed"
      |-
      ${gAncestralSetsData(item.sets)}
    |}
  */
  var folder5 = 'Ancestral/Set bonuses'
  if (folder[folder5]) {
    if (!fs.existsSync(path.join(__dirname, 'Wiki Templates', patchDate, folder5))) {
      fs.mkdirSync(path.join(__dirname, 'Wiki Templates', patchDate, folder5))
    }
    var template = `{{stub}}\n\n`
    template += `<div class="tabbertab-borderless"><tabber>\n`
    fs.readdirSync(folder[folder5]).forEach((val, ind) => {
      if (val === 'Set bonuses') return
      var file = require(path.join(folder[folder5], val))
      template += `${file.alias.replace(/[ ]+/g, '_')}= {| class="wikitable mw-collapsible"
       |-
       ${gAncestralSetsData(file)}
      |}
      |-|\n`.replace(/      /g, ' ')
    })
    template += `\n</tabber></div>\n`
    template += `\n[[Category:Ancestral Legacy]]`
    template += `\n[[Category:Ancestral Legacy Set Bonus]]`
    template += `\n\n<!-- ALL LINES ABOVE ARE AUTOMATED, CHANGES DONE ABOVE MAY BE OVERWRITTEN;GENERATION DATE:${new Date().toUTCString()} -->`
    template = template.replace(/\r?\n+|\r+/g, '\n').trim()
    fs.writeFileSync(path.join(__dirname, 'Wiki Templates', patchDate, folder5, `Set Bonus.txt`), template)
  }
})()
