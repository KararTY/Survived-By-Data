let lootTable = [{"from":"boss_hydra","guaranteeItemCount":0,"maximumItemCount":0,"lootTable":[{"item":"Simple Keepsake","count":{"dice":0,"faces":0,"add":1},"chance":20,"allowModifiers":true},{"item":"Antique Plate Armor","count":{"dice":0,"faces":0,"add":1},"chance":15,"allowModifiers":true},{"item":"Forester Mantle","count":{"dice":0,"faces":0,"add":1},"chance":15,"allowModifiers":true},{"item":"Hunter Leathers","count":{"dice":0,"faces":0,"add":1},"chance":15,"allowModifiers":true},{"item":"Logger Sabatons","count":{"dice":0,"faces":0,"add":1},"chance":15,"allowModifiers":true},{"item":"Farmer Boots","count":{"dice":0,"faces":0,"add":1},"chance":15,"allowModifiers":true},{"item":"Unworked Stone Totem","count":{"dice":0,"faces":0,"add":1},"chance":12,"allowModifiers":true},{"item":"Chipped Stone Pick","count":{"dice":0,"faces":0,"add":1},"chance":12,"allowModifiers":true},{"item":"Huntsman's Bow","count":{"dice":0,"faces":0,"add":1},"chance":12,"allowModifiers":true},{"item":"Stone Staff","count":{"dice":0,"faces":0,"add":1},"chance":12,"allowModifiers":true},{"item":"Antique Longsword","count":{"dice":0,"faces":0,"add":1},"chance":12,"allowModifiers":true},{"item":"Heritage Band","count":{"dice":0,"faces":0,"add":1},"chance":20,"allowModifiers":true},{"item":"Workman's Knife","count":{"dice":0,"faces":0,"add":1},"chance":12,"allowModifiers":true},{"item":"Burning Sands Key","count":{"dice":0,"faces":0,"add":1},"chance":40,"allowModifiers":true},{"item":"Silver","count":{"dice":4,"faces":10,"add":5},"chance":100,"allowModifiers":true},{"item":"Rosin Catalyst","count":{"dice":0,"faces":0,"add":1},"chance":100,"allowModifiers":true},{"item":"Blue Jade","count":{"dice":0,"faces":0,"add":1},"chance":3,"allowModifiers":true}],"reference":"HeirloomLoot"}]

function debug(msg) {
  try {
    document.getElementById('calculations').innerText += msg + '\n'
  } catch (e) {
    console.log(msg)
  }
}

if (lootTable[0]) lootTable = lootTable[0]
function GetLootTable() { return lootTable.lootTable }

let DiceParm = {}
DiceParm.randy = {}
DiceParm.randy.NextDouble = () => {
  let calc = Math.random()
  debug(`(DiceParm.randy.NextDouble) [return calc] = ${calc}`)
  return calc
}
DiceParm.randy.Next = (valueOne, valueTwo) => {
  let min = typeof valueTwo === 'number' ? Math.ceil(valueOne) : 0
  let max = typeof valueTwo === 'number' ? Math.floor(valueTwo) : valueOne
  let calc = Math.floor(Math.random() * (max - min + 1)) + min
  debug(`(DiceParm.randy.Next) [return calc] = ${calc}`)
  return calc
}

let isCardPack = false

function QJNLPGMKOGAJQ(playerStatistics, lootTableItem) {
  let chance = lootTableItem.chance;
  let num = 1 + playerStatistics.dropRateIncrease || 0; /* playerStatistics.GetStat(StatEnum.DropRateIncrease, 0) */

  if (isCardPack /* lootTable.gameObject.GetComponent<CardPack>() */ != null) {
    num += playerStatistics.cardPackIncrease || 0; /* playerStatistics.GetStat(StatEnum.CardPackIncrease, 0) */
  } else if (lootTableItem.class === "Misc") { // If item is of type "Misc"
    num += playerStatistics.materialChanceIncrease || 0; /* playerStatistics.GetStat(StatEnum.MaterialChanceIncrease, 0) */
  }
  debug(`(QJNLPGMKOGAJQ) [return chance * num] = ${chance * num.toFixed(2)}`)
  return chance * num
}

function QBHKKMLLCNDKQ(playerStatistics, QPBDLPNEKMIPQ, QCCAGILOFBGPQ) {
  let list = []
  let list2 = GetLootTable(QCCAGILOFBGPQ)
  let num = 0.0

  list2.forEach(lootEntry => {
    num += lootEntry.chance
  })
  debug(`(QBHKKMLLCNDKQ) num = ${num}`)
  for (let i = 0; i < QPBDLPNEKMIPQ; i++) {
    let num2 = DiceParm.randy.NextDouble() * num
		debug(`(QBHKKMLLCNDKQ - first loop) [num2] = ${num2}`)
    for (let ii = 0; ii < list2.length; ii++) {
      let lootEntry2 = list2[ii]
      debug(`(QBHKKMLLCNDKQ - second loop) [num2 < lootEntry2.chance] = ${num2 < lootEntry2.chance}`)
      if (!QHOJPHIOPILFQ(list2.item)) {
        if (num2 < lootEntry2.chance) {
          list.push(lootEntry2)
          break;
        }
        num2 -= lootEntry2.chance
        debug(`(QBHKKMLLCNDKQ - second loop) [num2 -= lootEntry2.chance] = ${num2}`)
      }
    }
  }
  return list
}

// I have no idea what this does, yet.
function QHOJPHIOPILFQ (itemDefinition) {
	return true
}

function QIOCAMEAGKBFQ(playerStatistics, QCCAGILOFBGPQ) {
  let list = []
  let list2 = GetLootTable(QCCAGILOFBGPQ)
  list2.forEach(lootEntry => {
  debug(`(QIOCAMEAGKBFQ) lootEntry = ${lootEntry.item}`)
    if (lootEntry.item == null) {
      console.log('Loot Table is missing item reference')
      debug(`Loot Table is missing item reference`)
    } else {
      let num = QJNLPGMKOGAJQ(playerStatistics, lootEntry)
      debug(`(QIOCAMEAGKBFQ) [num] = ${num}`)
      let num2 = DiceParm.randy.NextDouble() * 100.0
      debug(`(QIOCAMEAGKBFQ) [num2] = ${num2}`)
      debug(`(QIOCAMEAGKBFQ) [num >= 100.0 || num2 < num] = ${num >= 100.0 || num2 < num}`)
      if (num >= 100.0 || num2 < num) {
        let component = null; /* lootEntry.item.gameObject.GetComponent() */ // ?
        if (component != null) {
          let loot = GetLoot(playerStatistics, QCCAGILOFBGPQ);
          for (let i = 0; i < lootEntry.count.value; i++) {
            list.concat(loot)
          }
        } else {
          list.push(lootEntry)
        }
      }
    }
  })
  return list
}

function GetLoot(playerStatistics, QCCAGILOFBGPQ = 1) {
  if (lootTable.maximumItemCount > 0) {
    let qpbdlpnekmipq = DiceParm.randy.Next((lootTable.guaranteeItemCount <= 0) ? 0 : lootTable.guaranteeItemCount, lootTable.maximumItemCount)
    debug(`(GetLoot) qpbdlpnekmipq = ${qpbdlpnekmipq}`)
    return QBHKKMLLCNDKQ(playerStatistics, qpbdlpnekmipq, QCCAGILOFBGPQ)
  }

  if (lootTable.guaranteeItemCount === 0) {
    return QIOCAMEAGKBFQ(playerStatistics, QCCAGILOFBGPQ)
  }

  let list = QBHKKMLLCNDKQ(playerStatistics, lootTable.guaranteeItemCount, QCCAGILOFBGPQ)
  list.concat(QIOCAMEAGKBFQ(playerStatistics, QCCAGILOFBGPQ))
  return list
}

function QEKOGELIAFKOQ(add, dice, faces) {
  let num = add
  debug(`(QEKOGELIAFKOQ) [num] = ${num}`)
  for (let i = 0; i < dice; i++) {
    // num += DiceParm.randy.Next(faces)
    num += DiceParm.randy.Next(faces)
  }
  debug(`(QEKOGELIAFKOQ) [return num] = ${num}`)
  return num
}

// Used by UI for bounties and "quest chains".
function CalculateMaxReward () {
  let num = 0
  let lootTable = GetLootTable(1.0)
  lootTable.forEach(lootEntry => {
    // QAKIFCLCEEKMQ is a private boolean inside of ItemDefinition, I can't find it anywhere however.
    //if (lootEntry.item.QAKIFCLCEEKMQ === QKDKDLGICJHOQ) {
			num += lootEntry.count.add
			num += lootEntry.count.dice * lootEntry.count.faces
		//}
  })
	return num;
}

try {
  document.getElementById('rerun').addEventListener('click', () => {
    document.getElementById('date').innerText = `Date: ${new Date().toUTCString()}`
    document.getElementById('calculations').innerText = ``
    let loot = GetLoot({ dropRateIncrease: 0 })
    let result = ``
    loot.forEach(entry => {
      debug(`(RESULT) ${entry.item}`)
      result += `x${QEKOGELIAFKOQ(entry.count.add, entry.count.dice, entry.count.faces)} ${entry.item}\n`
    })
    if (result.length > 0) document.getElementById('result').innerText = result
    else document.getElementById('result').innerHTML = `<span style="color:red;">No loot.</span>`
  })
  
  document.getElementById('rerunWithDropRateIncrease').addEventListener('click', () => {
    document.getElementById('date').innerText = `Date: ${new Date().toUTCString()}`
    document.getElementById('calculations').innerText = ``
    let loot = GetLoot({ dropRateIncrease: Number(document.getElementById('dropRateIncrease').value) })
    let result = ``
    loot.forEach(entry => {
      debug(`(RESULT) ${entry.item}`)
      result += `x${QEKOGELIAFKOQ(entry.count.add, entry.count.dice, entry.count.faces)} ${entry.item}\n`
    })
    if (result.length > 0) document.getElementById('result').innerText = result
    else document.getElementById('result').innerHTML = `<span style="color:red;">No loot.</span>`
  })
} catch (e) {
  let loot = GetLoot({ dropRateIncrease: 0 })
  let result = ``
  loot.forEach(entry => {
    debug(`(RESULT) ${entry.item}`)
    result += `x${QEKOGELIAFKOQ(entry.count.add, entry.count.dice, entry.count.faces)} ${entry.item}\n`
  })
  if (result.length === 0) result = 'No loot.'
  console.log(result)
}