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
    'ItemDefinition': path.join(__dirname, 'Patch', 'ItemDefinition'),
    'Monster': path.join(__dirname, 'Patch', 'Monster'),
    'LootTable': path.join(__dirname, 'Patch', 'LootTable'),
    'Other': path.join(__dirname, 'Patch', 'Other'),
    'Ancestral': path.join(__dirname, 'Patch', 'Ancestral'),
    'CraftingRecipe': path.join(__dirname, 'Patch', 'CraftingRecipe'),
    'ItemModifier': path.join(__dirname, 'Patch', 'ItemModifier'),
    'LootBox': path.join(__dirname, 'Patch', 'LootBox'),
    'NPC': path.join(__dirname, 'Patch', 'NPC'),
    'Player': path.join(__dirname, 'Patch', 'Player'),
    'Challenge': path.join(__dirname, 'Patch', 'Challenge'),
    'Ancestral/Set bonuses': path.join(__dirname, 'Patch', 'Ancestral', 'Set bonuses')
  }

  if (!fs.existsSync(path.join(__dirname, 'Wiki Templates'))) {
    fs.mkdirSync(path.join(__dirname, 'Wiki Templates'), { recursive: true })
  }

  function gData(data, name) {
    return data.find(v => v[name] || typeof v[name] === 'number') ? data.find(v => v[name] || typeof v[name] === 'number')[name] : ''
  }

  function gStatsData(data, stat, icon) {
    var gsd = data.find(v => v.stats) ? data.find(v => v.stats).stats.find(v => v.key === stat) : ''
    var calculated 
    if (gsd && gsd.equation.includes('[$Tier]')) {
      var arr = data.find(v => v.stats).stats
      var statEquationSign = gsd.equation.replace(`[${gsd.key}]`, '').replace(/[ ]+/g, '').substr(0, 1)
      var statEquation = gsd.equation.replace(/\[\$Tier\]/g, `(${arr.find(v => v.key === 'Tier').equation})`).replace(`[${gsd.key}]`, '').replace(/[ ]+/g, '')
      calculated = `${/*statEquationSign*/ ''}${parseFloat(eval(statEquation.replace(`[${gsd.key}]`, gsd.value)).toFixed(2))}${/*statEquation.includes('*') ? '%' :*/ ''}<br><small>${gsd.equation.replace(`[${gsd.key}]`, '').replace(`[$${gsd.key}]`, '').replace(/\*/g, 'x')}</small>`
    } else if (gsd && gsd.equation.includes('[Level]')) {
      var arr = data.find(v => v.stats).stats
      var statEquationSign = gsd.equation.replace(/\[Level\]/g, '').replace(/[ ]+/g, '').substr(0, 1)
      var statEquation = gsd.equation.replace(/\[Level\]/g, `${arr.find(v => v.key === 'Level').value}`).replace(`[${gsd.key}]`, '').replace(/[ ]+/g, '')
      calculated = `${/*statEquationSign*/ ''}${parseFloat(eval(statEquation.replace(`[${gsd.key}]`, gsd.value)).toFixed(2))}${/*statEquation.includes('*') ? '%' :*/ ''}<br><small>${gsd.equation.replace(`[${gsd.key}]`, '').replace(`[$${gsd.key}]`, '').replace(/\*/g, 'x')}</small>`
    }
    return gsd
    ? (gsd.equation
      ? (`${icon ? `{{Icon|${icon}|nolink=1}} ` : ''}${calculated ? `${calculated}`: `${gsd.equation}${gsd.value > 0
        ? (`<br>'''${gsd.value}'''`)
        : ''}`}`)
      : `${gsd.value > 0
        ? (`${icon ? `{{Icon|${icon}|nolink=1}} ` : ''}${gsd.value}`)
        : ''}`)
    : ''
  }
  
  function gWeapons(weapons) {
    return (weapons && weapons.length > 0) ? weapons.map((v, ind) => {
      var weaponData = (name) => v.data.find(v => v[name])[name]
      return `${ind > 0 ? `` : `''`}
    {{{!}}class="wikitable mw-collapsible mw-collapsed" style="text-align:left;width:100%!important;"
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
    ${weaponData('projectile').randomRangeMax ? `{{!}} Random range max {{!!}} ${weaponData('projectile').randomRangeMax}` : ''}` : ''}
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
    ${weaponData('projectile').statusEffect.stats.map(v => {
      var equation
      if (v.key === 'DamageOverTime') {
        var statEquation = v.equation.replace('[DamageOverTime]+', '')
        equation = `(Initial damage: ${v.value} & Damage over time: ${statEquation})`
      } else if (!equation && v.equation.includes(`[${v.key}]`) && v.value) equation = parseFloat(eval(v.equation.replace(`[${v.key}]`, v.value)).toFixed(2))
      else if (v.key === 'DamageReduction') {
        var statEquation = v.equation.replace('[DamageReduction]', '')
        var statEquationSign = v.equation.replace(`[${v.key}]`, '').replace(/[ ]+/g, '').substr(0, 1)
        var increaseOrDecrease = statEquation.length > 0 ? Number(statEquation.split('.')[0].replace('*', '')) : '' // Either a 0 aka reduction, or higher aka increase.
        equation = statEquationSign === '*' ? typeof increaseOrDecrease === 'number' ? `(Damage ${increaseOrDecrease > 0 ? 'increase' : 'decrease'} by ${increaseOrDecrease > 0 ? `<strong style="color:green;">${parseFloat(eval(`(100${statEquation})-100`).toFixed(2))}` : `<strong style="color:red;">${parseFloat(eval(`100-(100${statEquation})`).toFixed(2))}`}%</strong>)` : '' : ''
      } else if (v.key === 'RateOfAttack') {
        var statEquation = v.equation.replace('[RateOfAttack]', '')
        var statEquationSign = v.equation.replace(`[${v.key}]`, '').replace(/[ ]+/g, '').substr(0, 1)
        var increaseOrDecrease = statEquation.length > 0 ? Number(statEquation.split('.')[0].replace('*', '')) : '' // Either a 0 aka reduction, or higher aka increase.
        equation = statEquationSign === '*' ? typeof increaseOrDecrease === 'number' ? `(Rate of attack ${increaseOrDecrease > 0 ? 'increase' : 'decrease'} by ${increaseOrDecrease > 0 ? `<strong style="color:green;">${parseFloat(eval(`(100${statEquation})-100`).toFixed(2))}` : `<strong style="color:red;">${parseFloat(eval(`100-(100${statEquation})`).toFixed(2))}`}%</strong>)` : '' : ''
      } else if (v.key === 'MovementSpeed') {
        var statEquation = v.equation.replace('[MovementSpeed]', '')
        var statEquationSign = v.equation.replace(`[${v.key}]`, '').replace(/[ ]+/g, '').substr(0, 1)
        var increaseOrDecrease = statEquation.length > 0 ? Number(statEquation.split('.')[0].replace('*', '')) : '' // Either a 0 aka reduction, or higher aka increase.
        equation = statEquationSign === '*' ? typeof increaseOrDecrease === 'number' ? `(Movement speed ${increaseOrDecrease > 0 ? 'increase' : 'decrease'} by ${increaseOrDecrease > 0 ? `<strong style="color:green;">${parseFloat(eval(`(100${statEquation})-100`).toFixed(2))}` : `<strong style="color:red;">${parseFloat(eval(`100-(100${statEquation})`).toFixed(2))}`}%</strong>)` : '' : ''
      } else if (v.key === 'CriticalChance') {
        var statEquation = v.equation.replace('[CriticalChance]', '')
        var statEquationSign = v.equation.replace(`[${v.key}]`, '').replace(/[ ]+/g, '').substr(0, 1)
        var increaseOrDecrease = statEquation.length > 0 ? Number(statEquation.split('.')[0].replace('*', '')) : '' // Either a 0 aka reduction, or higher aka increase.
        equation = statEquationSign === '*' ? typeof increaseOrDecrease === 'number' ? `(Critical chance ${increaseOrDecrease > 0 ? 'increase' : 'decrease'} by ${increaseOrDecrease > 0 ? `<strong style="color:green;">${parseFloat(eval(`(100${statEquation})-100`).toFixed(2))}` : `<strong style="color:red;">${parseFloat(eval(`100-(100${statEquation})`).toFixed(2))}`}%</strong>)` : '' : ''
      } else if (v.key === 'RagePerAttack') {
        var statEquation = v.equation.replace('[RagePerAttack]', '')
        var statEquationSign = v.equation.replace(`[${v.key}]`, '').replace(/[ ]+/g, '').substr(0, 1)
        var increaseOrDecrease = statEquation.length > 0 ? Number(statEquation.split('.')[0].replace('*', '')) : '' // Either a 0 aka reduction, or higher aka increase.
        equation = statEquationSign === '*' ? typeof increaseOrDecrease === 'number' ? `(Rage per attack ${increaseOrDecrease > 0 ? 'increase' : 'decrease'} by ${increaseOrDecrease > 0 ? `<strong style="color:green;">${parseFloat(eval(`(100${statEquation})-100`).toFixed(2))}` : `<strong style="color:red;">${parseFloat(eval(`100-(100${statEquation})`).toFixed(2))}`}%</strong>)` : '' : ''
      } else if (v.key === 'HealthRegen') {
        var statEquation = v.equation.replace('[HealthRegen]', '')
        var statEquationSign = v.equation.replace(`[${v.key}]`, '').replace(/[ ]+/g, '').substr(0, 1)
        var increaseOrDecrease = statEquation.length > 0 ? Number(statEquation.split('.')[0].replace('*', '')) : '' // Either a 0 aka reduction, or higher aka increase.
        equation = statEquationSign === '*' ? typeof increaseOrDecrease === 'number' ? `(Health regeneration ${increaseOrDecrease > 0 ? 'increase' : 'decrease'} by ${increaseOrDecrease > 0 ? `<strong style="color:green;">${parseFloat(eval(`(100${statEquation})-100`).toFixed(2))}` : `<strong style="color:red;">${parseFloat(eval(`100-(100${statEquation})`).toFixed(2))}`}%</strong>)` : '' : ''
      }
      return (v.equation || v.value) ? `{{!}} ${v.key} {{!!}} ${equation ? `${equation}<br><small>${v.equation}${v.value ? ` '''${v.value}'''` : ''}</small>` : `${v.equation}${v.value ? ` '''${v.value}'''` : ''}`}` : ''
    }).filter(Boolean).join(`
    {{!}}-
    `)}` : ''}
    {{!}}}`}).join('\n').replace(/    [\n\r]+/g, '\n') : ''
  }

  function gLootData(data) {
    var gld = data.find(v => v.loot) ? data.find(v => v.loot).loot : ''
    if (!gld) return
    return `${gld.lootTable && gld.lootTable.name ? `{{:Loot table/${gld.lootTable.name}}}` : gld.inheritedLootTable ? `'''Inheriting: ([[Loot table/${gld.inheritedLootTable.name}|${gld.inheritedLootTable.name}]])'''{{:Loot table/${gld.inheritedLootTable.name}}}` : ''}`.replace(/Ã¤/g, 'ä').replace(/    [\n\r]+/g, '\n')
  }

  function gLoot(data) {
    var gld = data.lootTable.length > 0 ? data.lootTable.sort((a, b) => {
      return b.chance - a.chance
    }) : ''
    return `${data.reference ? `{{:Loot table/${data.reference}}}` : ''}${data.questLootTable ? `('''Quest loot table''') ` : ''}${gld ? `'''Loot table: ([[Loot table/${data.from}|${data.from}]])'''\n${data.guaranteeItemCount ? `<br>Guaranteed drop amount: ${data.guaranteeItemCount}` : ''}${data.maximumItemCount ? `<br>Maximum drop amount: ${data.maximumItemCount}` : ''}\n{|class="sortable"\n|-\n! Amount || Item || Chance\n|-\n${gld.map(v => `| ${v.count.add ? `x${v.count.add}` : (v.count.faces === 0 && v.count.dice === 0) ? '' : `x1`}${(v.count.faces || v.count.dice) > 1 ? `-${(v.count.faces * (v.count.dice || 1))}` : ''} || {{Icon|${v.item}}} || style="text-align:right" | ${v.chance}% `).join('\n|-\n')}\n|}`.replace(/Ã¤/g, 'ä') : ''}`
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
    }).join('\n                  |-\n')}\n                |}\n                |-` : ''}
    ${gpd.statusEffect ? `| Status Effect || colspan="2" | 
    {| class="wikitable"
      |-
      ${gpd.statusEffect.duration ? `| Duration || ${gpd.statusEffect.duration}
      |-` : ''}
      ${gpd.statusEffect.isBuff ? `| colspan="2" | Buff
      |-` : ''}
      ${gpd.statusEffect.coolDownTime ? `| Cooldown || ${gpd.statusEffect.coolDownTime}
      |-` : ''}
      ${gpd.statusEffect.removeOnAttack ? `| colspan="2" | Removed on attack
      |-` : ''}
      ${!gpd.statusEffect.noTimeout ? `| colspan="2" | Times out
      |-` : ''}
      ${gpd.statusEffect.stats.map(v => {
        var equation
        var noResolution = false
        if (v.equation.includes('[Player.Level]') || v.equation.includes('[Proc.Benefit]')) {
          equation = v.equation.replace(`[${v.key}]`, v.value)
          noResolution = true
        } else if (v.key === 'DamageOverTime') {
          var statEquation = v.equation.replace('[DamageOverTime]+', '')
          equation = `(Initial damage: ${v.value} & Damage over time: ${statEquation})`
        } else if (v.equation.length > 0 && v.equation.includes(`[${v.key}]`) && v.value) equation = parseFloat(eval(v.equation.replace(`[${v.key}]`, v.value)).toFixed(2))
        else if (v.key === 'DamageReduction') {
          var statEquation = v.equation.replace('[DamageReduction]', '')
          var statEquationSign = v.equation.replace(`[${v.key}]`, '').replace(/[ ]+/g, '').substr(0, 1)
          var increaseOrDecrease = statEquation.length > 0 ? Number(statEquation.split('.')[0].replace('*', '')) : '' // Either a 0 aka reduction, or higher aka increase.
          equation = statEquationSign === '*' ? typeof increaseOrDecrease === 'number' ? `(Damage ${increaseOrDecrease > 0 ? 'increase' : 'decrease'} by ${increaseOrDecrease > 0 ? `<strong style="color:green;">${parseFloat(eval(`(100${statEquation})-100`).toFixed(2))}` : `<strong style="color:red;">${parseFloat(eval(`100-(100${statEquation})`).toFixed(2))}`}%</strong>)` : '' : ''
        } else if (v.key === 'RateOfAttack') {
          var statEquation = v.equation.replace('[RateOfAttack]', '')
          var statEquationSign = v.equation.replace(`[${v.key}]`, '').replace(/[ ]+/g, '').substr(0, 1)
          var increaseOrDecrease = statEquation.length > 0 ? Number(statEquation.split('.')[0].replace('*', '')) : '' // Either a 0 aka reduction, or higher aka increase.
          equation = statEquationSign === '*' ? typeof increaseOrDecrease === 'number' ? `(Rate of attack ${increaseOrDecrease > 0 ? 'increase' : 'decrease'} by ${increaseOrDecrease > 0 ? `<strong style="color:green;">${parseFloat(eval(`(100${statEquation})-100`).toFixed(2))}` : `<strong style="color:red;">${parseFloat(eval(`100-(100${statEquation})`).toFixed(2))}`}%</strong>)` : '' : ''
        } else if (v.key === 'MovementSpeed') {
          var statEquation = v.equation.replace('[MovementSpeed]', '')
          var statEquationSign = v.equation.replace(`[${v.key}]`, '').replace(/[ ]+/g, '').substr(0, 1)
          var increaseOrDecrease = statEquation.length > 0 ? Number(statEquation.split('.')[0].replace('*', '')) : '' // Either a 0 aka reduction, or higher aka increase.
          equation = statEquationSign === '*' ? typeof increaseOrDecrease === 'number' ? `(Movement speed ${increaseOrDecrease > 0 ? 'increase' : 'decrease'} by ${increaseOrDecrease > 0 ? `<strong style="color:green;">${parseFloat(eval(`(100${statEquation})-100`).toFixed(2))}` : `<strong style="color:red;">${parseFloat(eval(`100-(100${statEquation})`).toFixed(2))}`}%</strong>)` : '' : ''
        } else if (v.key === 'CriticalChance') {
          var statEquation = v.equation.replace('[CriticalChance]', '')
          var statEquationSign = v.equation.replace(`[${v.key}]`, '').replace(/[ ]+/g, '').substr(0, 1)
          var increaseOrDecrease = statEquation.length > 0 ? Number(statEquation.split('.')[0].replace('*', '')) : '' // Either a 0 aka reduction, or higher aka increase.
          equation = statEquationSign === '*' ? typeof increaseOrDecrease === 'number' ? `(Critical chance ${increaseOrDecrease > 0 ? 'increase' : 'decrease'} by ${increaseOrDecrease > 0 ? `<strong style="color:green;">${parseFloat(eval(`(100${statEquation})-100`).toFixed(2))}` : `<strong style="color:red;">${parseFloat(eval(`100-(100${statEquation})`).toFixed(2))}`}%</strong>)` : '' : ''
        } else if (v.key === 'RagePerAttack') {
          var statEquation = v.equation.replace('[RagePerAttack]', '')
          var statEquationSign = v.equation.replace(`[${v.key}]`, '').replace(/[ ]+/g, '').substr(0, 1)
          var increaseOrDecrease = statEquation.length > 0 ? Number(statEquation.split('.')[0].replace('*', '')) : '' // Either a 0 aka reduction, or higher aka increase.
          equation = statEquationSign === '*' ? typeof increaseOrDecrease === 'number' ? `(Rage per attack ${increaseOrDecrease > 0 ? 'increase' : 'decrease'} by ${increaseOrDecrease > 0 ? `<strong style="color:green;">${parseFloat(eval(`(100${statEquation})-100`).toFixed(2))}` : `<strong style="color:red;">${parseFloat(eval(`100-(100${statEquation})`).toFixed(2))}`}%</strong>)` : '' : ''
        } else if (v.key === 'HealthRegen') {
          var statEquation = v.equation.replace('[HealthRegen]', '')
          var statEquationSign = v.equation.replace(`[${v.key}]`, '').replace(/[ ]+/g, '').substr(0, 1)
          var increaseOrDecrease = statEquation.length > 0 ? Number(statEquation.split('.')[0].replace('*', '')) : '' // Either a 0 aka reduction, or higher aka increase.
          equation = statEquationSign === '*' ? typeof increaseOrDecrease === 'number' ? `(Health regeneration ${increaseOrDecrease > 0 ? 'increase' : 'decrease'} by ${increaseOrDecrease > 0 ? `<strong style="color:green;">${parseFloat(eval(`(100${statEquation})-100`).toFixed(2))}` : `<strong style="color:red;">${parseFloat(eval(`100-(100${statEquation})`).toFixed(2))}`}%</strong>)` : '' : ''
        }
        return (v.equation || v.value) ? `| ${v.key} || ${equation ? `${equation}${!noResolution ? `<br><small>${v.equation}${v.value ? ` '''${v.value}'''` : ''}</small>` : ''}` : `${v.equation}${v.value ? ` '''${v.value}'''` : ''}`}` : ''
      }).join('\n                  |-\n')}\n                |}` : ''}`.replace(/    [\n\r]+/g, '\n') : ''
  }

  function gAncestralStats(stats, colspan) {
    var gas = stats.length > 0 ? stats : ''
    return gas ? `! colspan="${colspan || 3}" | Stats
    |-
    ! Key !! Equation !! Value
    |-
    ${gas.map(stat => {
      return `| ${stat.key} || ${stat.equation.replace(/\*/g, 'x')} || ${stat.value > 0 ? stat.value : ''}`
    }).join('\n          |-\n    ')}`.replace(/      [\n\r]+/g, '\n') : ''
  }

  function gItemModifierStats(stats, item) {
    var gims = stats.length > 0 ? stats : ''
    return gims ? `! colspan="3" | Stats
    |-
    ! Key !! Equation !! Value
    |-
    ${gims.sort((a, b) => {
      return !!a.equation.includes('[$Tier]') - !!b.equation.includes('[$Tier]')
    }).map((stat, ind, arr) => {
      if (stat.equation.includes('[$Tier]')) {
        var statEquationSign = stat.equation.replace(`[${stat.key}]`, '').replace(/[ ]+/g, '').substr(0, 1)
        var statEquation = stat.equation.replace('[$Tier]', `(${arr.find(v => v.key === 'Tier').equation})`).replace(`[${stat.key}]`, '').replace(/[ ]+/g, '').substr(1)
        return `| ${stat.key} || ${stat.equation.replace(`[${stat.key}]`, '').replace(`[$${stat.key}]`, '').replace(/\*/g, 'x')}<br>('''Min level:''' ${statEquationSign === '-' ? '<strong style="color:red;">-' : '<strong style="color:green;">+'}${parseFloat(eval(statEquation.replace('[ItemInstance.Suffix_Level]', 0)).toFixed(2))}${/*statEquation.includes('*') ? '%' :*/ ''}</strong> '''Max level:''' ${statEquationSign === '-' ? '<strong style="color:red;">-' : '<strong style="color:green;">+'}${parseFloat(eval(statEquation.replace('[ItemInstance.Suffix_Level]', 9)).toFixed(2))}${/*statEquation.includes('*') ? '%' :*/ ''}</strong>) || ${stat.value > 0 ? stat.value : ''}`
      } else if (stat.key === 'DamageBonus') {
        var statEquation = stat.equation.replace('[DamageBonus]', '')
        var increaseOrDecrease = statEquation.length > 0 ? Number(statEquation.split('.')[0].replace('*', '')) : '' // Either a 0 aka reduction, or higher aka increase.
        return `| ${stat.key} || ${stat.equation.replace(`[${stat.key}]`, '').replace(`[$${stat.key}]`, '').replace(/\*/g, 'x')}${typeof increaseOrDecrease === 'number' ? `<br>(Damage ${increaseOrDecrease > 0 ? 'increase' : 'decrease'} by ${increaseOrDecrease > 0 ? `<strong style="color:green;">${parseFloat(eval(`(100${statEquation})-100`).toFixed(2))}` : `<strong style="color:red;">${parseFloat(eval(`100-(100${statEquation})`).toFixed(2))}`}%</strong>) ` : '' || stat.equation}|| ${stat.value > 0 ? stat.value : ''}`
      } else if (stat.key === 'RateOfAttack') {
        var statEquation = stat.equation.replace('[RateOfAttack]', '')
        var statEquationSign = stat.equation.replace(`[${stat.key}]`, '').replace(/[ ]+/g, '').substr(0, 1)
        var increaseOrDecrease = statEquation.length > 0 ? Number(statEquation.split('.')[0].replace('*', '')) : '' // Either a 0 aka reduction, or higher aka increase.
        return `| ${stat.key} || ${stat.equation.replace(`[${stat.key}]`, '').replace(`[$${stat.key}]`, '').replace(/\*/g, 'x')}${statEquationSign === '*' ? typeof increaseOrDecrease === 'number' ? `<br>(Rate of attack ${increaseOrDecrease > 0 ? 'increase' : 'decrease'} by ${increaseOrDecrease > 0 ? `<strong style="color:green;">${parseFloat(eval(`(100${statEquation})-100`).toFixed(2))}` : `<strong style="color:red;">${parseFloat(eval(`100-(100${statEquation})`).toFixed(2))}`}%</strong>) ` : '' : ''}|| ${stat.value > 0 ? stat.value : ''}`
      } else if (stat.key === 'RagePerAttack') {
        var statEquation = stat.equation.replace('[RagePerAttack]', '')
        var statEquationSign = stat.equation.replace(`[${stat.key}]`, '').replace(/[ ]+/g, '').substr(0, 1)
        var increaseOrDecrease = statEquation.length > 0 ? Number(statEquation.split('.')[0].replace('*', '')) : '' // Either a 0 aka reduction, or higher aka increase.
        return `| ${stat.key} || ${stat.equation.replace(`[${stat.key}]`, '').replace(`[$${stat.key}]`, '').replace(/\*/g, 'x')}${statEquationSign === '*' ? typeof increaseOrDecrease === 'number' ? `<br>(Rage per attack ${increaseOrDecrease > 0 ? 'increase' : 'decrease'} by ${increaseOrDecrease > 0 ? `<strong style="color:green;">${parseFloat(eval(`(100${statEquation})-100`).toFixed(2))}` : `<strong style="color:red;">${parseFloat(eval(`100-(100${statEquation})`).toFixed(2))}`}%</strong>) ` : '' : ''}|| ${stat.value > 0 ? stat.value : ''}`
      }
      return `| ${stat.key} || ${stat.equation.replace(`[${stat.key}]`, '').replace(`[$${stat.key}]`, '').replace(/\*/g, 'x')} || ${stat.value > 0 ? stat.value : ''}`
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
//      fs.writeFileSync(path.join(__dirname, 'Wiki Templates', folder1, `${file[0].name.replace(/[\/\?\<\>\\\:\*\|\"]/g, '')}.txt`), template)
//    })
//  }

  let folder2 = 'Monster'
  if (folder[folder2]) {
    if (!fs.existsSync(path.join(__dirname, 'Wiki Templates', folder2))) {
      fs.mkdirSync(path.join(__dirname, 'Wiki Templates', folder2))
    }
    fs.readdirSync(folder[folder2]).forEach((val, ind) => {
      var file = require(path.join(folder[folder2], val))
      var template = ``
      var count = -1
      file.sort((a, b) => {
        return Number(gStatsData(a.data, 'HealthMax')) - Number(gStatsData(b.data, 'HealthMax'))
      }).sort((a, b) => {
        return Number(gStatsData(a.data, 'Tier')) - Number(gStatsData(b.data, 'Tier'))
      }).forEach((item, ind, arr) => {
        count++
        template += arr.length > 1 ? `${ind === 0 ? `<div class="tabbertab-borderless"><tabber>\n` : '\n'}${item.alias ? item.alias : `${item.name}_${ind + 1}`}=` : ''
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
        ${gStatsData(item.data, 'SpecialWeaponDamage') ? `|special_weapon_damage = ${gStatsData(item.data, 'SpecialWeaponDamage')}` : ''}
        ${gWeapons(item.weapons) ? `|weapons = ${gWeapons(item.weapons)}` : ''}
        ${(gData(item.data, 'healthDialogue') || gData(item.data, 'dialogue')) ? `|dialogue = ${gData(item.data, 'healthDialogue') ? gData(item.data, 'healthDialogue').map(v => `<u>'''${v.healthPercentage * 100}% health:'''</u> ''${v.message}''`).join('<br>') : gData(item.data, 'dialogue') ? gData(item.data, 'dialogue').map(v => `''${v.message}''`).join('<br>') : ''}` : ''}
        ${gLootData(item.data) ? `|drops = ${gLootData(item.data)}` : ''}
        }}`.replace(/        [\n\r]+/g, '\n').replace(/\r?\n+|\r+/g, '\n').replace(/        /g, '  ').trim()
        template += arr.length > 1 ? `\n|-|` : ''
      })
      template += count > 0 ? `\n</tabber></div>\n` : '\n\n'
      template += `<includeonly>\n`
      template += `\n[[Category:Monster]]
${file[0].category.length > 0 && file[0].category !== 'None' && file[0].category !== 'All' ? `[[Category:${file[0].category}]]` : ''}
${(file[0].element && file[0].element !== 'None' && file[0].element !== 'All') ? `[[Category:${file[0].element}]]` : ''}
${file[0].isBoss ? '[[Category:Boss]]' : ''}
${file[0].isElite ? '[[Category:Elite]]' : ''}
${file[0].isSetPieceMonster ? '[[Category:Set Piece Monster]]' : ''}`.replace(/\r?\n+|\r+/g, '\n').trim()
      template += `\n</includeonly>`
      template = template.replace(/\r?\n+|\r+/g, '\n').trim()
      fs.writeFileSync(path.join(__dirname, 'Wiki Templates', folder2, `${file[0].name}.txt`), template)
    })
  }

  let folder3 = 'LootTable'
  if (folder[folder3]) {
    if (!fs.existsSync(path.join(__dirname, 'Wiki Templates', folder3))) {
      fs.mkdirSync(path.join(__dirname, 'Wiki Templates', folder3))
    }
    fs.readdirSync(folder[folder3]).forEach((val, ind) => {
      var file = require(path.join(folder[folder3], val))
      var template = `<noinclude>'''{{PAGENAME}}'''</noinclude>\n`
      var count = 0
      file.sort((a, b) => {
        return b.lootTable.length - a.lootTable.length
      }).forEach((item, ind, arr) => {
        if (arr.length > 1) count++
        if (arr.length > 1 && item.lootTable.length < 0) return
        template += arr.length > 1 ? `${ind === 0 ? `<div class="tabbertab-borderless"><tabber>\n` : ''}${item.from} ${ind + 1}=` : ''
        template += `${gLoot(item)}`
        template += arr.length > 1 ? `\n|-|\n` : ''
      })
      template += count > 0 ? `\n</tabber></div>\n` : '\n\n'
      template += `\n<noinclude><hr>\n{{Special:Whatlinkshere/Loot table/${file[0].from}}}\n[[Category:Loot table]]</noinclude>`
      template = template.replace(/\r?\n+|\r+/g, '\n').trim()
      fs.writeFileSync(path.join(__dirname, 'Wiki Templates', folder3, `${file[0].from}.txt`), template)
    })
  }

  let folder4 = 'Ancestral'
  if (folder[folder4]) {
    if (!fs.existsSync(path.join(__dirname, 'Wiki Templates', folder4))) {
      fs.mkdirSync(path.join(__dirname, 'Wiki Templates', folder4))
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
          ! colspan="3" | ${item.name === '<Deprecated>' ? item.alias : item.name}
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
      template = template.replace(/\r?\n+|\r+/g, '\n').trim()
      template += `\n<onlyinclude><includeonly>${file[0].description ? file[0].description.replace(/[\n]/g , ' ').replace('#', 'X').trim() : ''}</includeonly></onlyinclude>`
      fs.writeFileSync(path.join(__dirname, 'Wiki Templates', folder4, `${file[0].name.replace(/[\/\?\<\>\\\:\*\|\"]/g, '')}.txt`), template)
    })
  }

  var folder5 = 'Ancestral/Set bonuses'
  if (folder[folder5]) {
    if (!fs.existsSync(path.join(__dirname, 'Wiki Templates', folder5))) {
      fs.mkdirSync(path.join(__dirname, 'Wiki Templates', folder5))
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
    template = template.replace(/\r?\n+|\r+/g, '\n').trim()
    fs.writeFileSync(path.join(__dirname, 'Wiki Templates', folder5, `Set Bonus.txt`), template)
  }

  var folder6 = 'ItemModifier'
  if (folder[folder6]) {
    if (!fs.existsSync(path.join(__dirname, 'Wiki Templates', folder6))) {
      fs.mkdirSync(path.join(__dirname, 'Wiki Templates', folder6))
    }
    fs.readdirSync(folder[folder6]).forEach((val, ind) => {
      var itemModifier = require(path.join(folder[folder6], val))
      var craftingRecipe = itemModifier[0].data.find(v => v.craftingRecipe) ? require(path.join(__dirname, 'Patch', 'CraftingRecipe', itemModifier[0].data.find(v => v.craftingRecipe).craftingRecipe.name)) : undefined
      var template = ``
      itemModifier.forEach(item => {
        template += `
          {| class="wikitable"
          ! colspan="3" | ${item.alias}
          |-
          ${gData(item.data, 'minTier') ? `| Min tier || colspan="2" | ${gData(item.data, 'minTier')}\n          |-\n` : ''}
          | colspan="3" style="text-align:center;max-width:329px;" | <i>${item.description || '(No description set.)'}</i>
          |-
          | Category || colspan="2" | ${item.category}
          |-
          ${gData(item.data, 'nameMod') ? `| Name modification || colspan="2" | ${gData(item.data, 'nameMod').replace(/\{0\}/g, '...')}\n          |-\n` : ''}
          ${gData(item.data, 'chanceToApply') ? `| Chance to apply || colspan="2" | ${gData(item.data, 'chanceToApply')}%\n          |-\n` : ''}
          ${gData(item.data, 'expireTime') ? `| Expiration time || colspan="2" | ${gData(item.data, 'expireTime')}\n          |-\n` : ''}
          ${gData(item.data, 'equipmentSet') ? (function () {
            var equipmentSet = gData(item.data, 'equipmentSet')
            return `| colspan="3" style="padding:0;" |
            {| style="width:100%;margin:0;" class="wikitable"
            ! colspan="3" | Equipment set<br>${gData(item.data, 'type').join(', ')}${gData(item.data, 'validClasses').map(c => ` {{Icon|${c}|nolink=1}}`).join('')}
            |-
            | colspan="3" style="text-align:center;max-width:329px;" | <i>${equipmentSet.description}</i>
            |-
            | Minimum required amount || colspan="2" | ${equipmentSet.minimumRequiredAmount}
            |-
            ${gItemModifierStats(equipmentSet.stats, item).replace(/      /g , '').replace(/    /g, '  ')}
            |}`.replace(/            /g, '  ')
          })() : ''}
          ${craftingRecipe ? (function () {
            var cr = craftingRecipe[0]
            return `| colspan="3" style="padding:0;" |
          {| style="width:100%;margin:0;" class="wikitable mw-collapsible mw-collapsed"
            ! Crafting
            |-
            | colspan="3" style="padding:0;" |
            ${cr.leveledRecipes.map(v => {
                return `{| style="width:100%;margin:0;" class="wikitable mw-collapsible mw-collapsed"
                    ! colspan="2" | '''Level:''' ${v.level} (${v.level + 1})
                    |-
                    | Crafting cost || ${v.craftCost}
                    |-
                    | Craft now cost || ${v.craftNowCost} {{Icon|Electrum}} 
                    |-
                    | Crafting time || ${moment.duration(v.craftingTime, 'seconds').format("h [hours], m [minutes], s [seconds]", { trim: 'both' })}
                    |-
                    ! colspan="2" | Required items
                    |-
                    | colspan="2" | ${v.requiredItems.map(i => `x${i.count} {{Icon|${i.name}}} ${i.requiredLevel ? `<small>Required level: ${i.requiredLevel}</small>` : ''}`).join('<br>')}
                  |}`.replace(/              /g, '')
              }).join('\n    ')}
          |}`})() : ''}
        |}
        ${gData(item.data, 'equipmentSet') ? '' : item.data.filter(v => v['validClasses']).sort((a, b) => {
            return a.validClasses.length - b.validClasses.length
          }).sort((a, b) => {
            var typeA = a.type[0].toLowerCase()
            var typeB = b.type[0].toLowerCase()
            if (typeA > typeB) return 1
            else if (typeA < typeB) return -1
            else return 0 
          }).map(v => {
            return `{| class="wikitable mw-collapsible mw-collapsed"
          ! colspan="3" | ${`${v.type.join(', ')}${v.validClasses.map(c => ` {{Icon|${c}|nolink=1}}`).join('')}` || 'No types & classes defined.'}
          |-
          ${/*v.validClasses ? `| colspan="3" style="padding:0;" |
          {| style="width:100%;margin:0;" class="wikitable mw-collapsible mw-collapsed"
            ! Valid classes
            |-
            | ${v.validClasses.map(c => `{{Icon|${c}}}`).join('<br>')}
          |}\n          |-\n` :*/ ''}
          ${gItemModifierStats(v.stats, item).replace(/      /g , '').replace(/    /g, '  ')}
        |}`
          }).join('\n          ')}`.replace(/        /g, '').replace(/  \n/g, '\n')
      })
      template += `\n<includeonly>\n[[Category:Imprint]]\n[[Category:${itemModifier[0].category}]]\n</includeonly>`
      template = template.replace(/\r?\n+|\r+/g, '\n').trim()
      fs.writeFileSync(path.join(__dirname, 'Wiki Templates', folder6, `${itemModifier[0].category}_${itemModifier[0].name}.txt`), template)
    })
  }
  let folder7 = 'Challenge'
  /**
   * {| class="infoboxtable"
   * ! colspan="2" class="infoboxdetails" | <div>${item.title}</div>
   * |-
   * ! colspan="2" class="infoboxdetails" | <div>Loot</div>
   * |-
   * |{{:Loot table/Reach Level 1}}
   * |-
   * | <div>Prerequisites</div> || [[Complete Daily Challenges (III)]]
   * |}
   */
  if (folder[folder7]) {
    if (!fs.existsSync(path.join(__dirname, 'Wiki Templates', folder7))) {
      fs.mkdirSync(path.join(__dirname, 'Wiki Templates', folder7))
    }
    fs.readdirSync(folder[folder7]).forEach((val, ind) => {
      var file = require(path.join(folder[folder7], val))
      var template = ``
      template += `{| class="infoboxtable"
      ! colspan="2" class="infoboxdetails" | <div>${file[0].title}</div>
      |-
      ${file[0].achievement ? `! colspan="2" class="infoboxdetails" | <div>Achievement</div>
      |-` : ``}
      ${file[0].challengeType && (file[0].challengeType !== '_Unknown') ? `| <div>Type</div> || ${file[0].challengeType}
      |-` : ``}
      ${file[0].challengeValueSuffix ? `| <div>Suffix</div> || ${file[0].challengeValueSuffix}
      |-` : ``}
      ${file[0].prerequisites ? `| <div>Prerequisites</div> || ${file.map(v => v.prerequisites.map(v => `[[Challenge/${v[1]}|${v[0]}]]`).join('<br>')).join('<br>')}
      |-` : ``}
      ${file.map(v => gLootData(v.data)).filter(Boolean).length > 0 ? `! colspan="2" class="infoboxdetails" | <div>Rewards</div>
      |-
      ! style="text-align:left;" colspan="2" | ${[...new Set(file.map(v => gLootData(v.data)))].filter(Boolean).join('<br>')}` : ``}`.replace(/      [\n\r]+/g, '\n').replace(/\r?\n+|\r+/g, '\n').replace(/      /g, '  ').trim()
      template += `\n|}\n<includeonly>\n`
      template += `\n[[Category:Challenge]]`
      template += file[0].achievement ? `\n[[Category:Achievement]]` : ``
      template += `\n</includeonly>`
      template = template.replace(/\r?\n+|\r+/g, '\n').trim()
      fs.writeFileSync(path.join(__dirname, 'Wiki Templates', folder7, `${file[0].name}.txt`), template)
    })
  }
})()
