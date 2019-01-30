let lootTable = {"from":"boss_hydra","guaranteeItemCount":0,"maximumItemCount":0,"lootTable":[{"item":"Simple Keepsake","count":{"dice":0,"faces":0,"add":1},"chance":20,"allowModifiers":true},{"item":"Antique Plate Armor","count":{"dice":0,"faces":0,"add":1},"chance":15,"allowModifiers":true},{"item":"Forester Mantle","count":{"dice":0,"faces":0,"add":1},"chance":15,"allowModifiers":true},{"item":"Hunter Leathers","count":{"dice":0,"faces":0,"add":1},"chance":15,"allowModifiers":true},{"item":"Logger Sabatons","count":{"dice":0,"faces":0,"add":1},"chance":15,"allowModifiers":true},{"item":"Farmer Boots","count":{"dice":0,"faces":0,"add":1},"chance":15,"allowModifiers":true},{"item":"Unworked Stone Totem","count":{"dice":0,"faces":0,"add":1},"chance":12,"allowModifiers":true},{"item":"Chipped Stone Pick","count":{"dice":0,"faces":0,"add":1},"chance":12,"allowModifiers":true},{"item":"Huntsman's Bow","count":{"dice":0,"faces":0,"add":1},"chance":12,"allowModifiers":true},{"item":"Stone Staff","count":{"dice":0,"faces":0,"add":1},"chance":12,"allowModifiers":true},{"item":"Antique Longsword","count":{"dice":0,"faces":0,"add":1},"chance":12,"allowModifiers":true},{"item":"Heritage Band","count":{"dice":0,"faces":0,"add":1},"chance":20,"allowModifiers":true},{"item":"Workman's Knife","count":{"dice":0,"faces":0,"add":1},"chance":12,"allowModifiers":true},{"item":"Burning Sands Key","count":{"dice":0,"faces":0,"add":1},"chance":40,"allowModifiers":true},{"item":"Silver","count":{"dice":4,"faces":10,"add":5},"chance":100,"allowModifiers":true},{"item":"Rosin Catalyst","count":{"dice":0,"faces":0,"add":1},"chance":100,"allowModifiers":true},{"item":"Blue Jade","count":{"dice":0,"faces":0,"add":1},"chance":3,"allowModifiers":true}],"reference":"HeirloomLoot"}

function GetLootTable() { return lootTable.lootTable }
let DiceParm = {}
DiceParm.randy = {}
DiceParm.randy.NextDouble = () => parseFloat(Math.random().toFixed(2))
DiceParm.randy.Next = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let isCardPack = false

function QJNLPGMKOGAJQ(playerStatistics, lootTableItem) {
  let chance = lootTableItem.chance;
  let num = 1 + playerStatistics.dropRateIncrease || 0 /* playerStatistics.GetStat(StatEnum.DropRateIncrease, 0) */

  if (isCardPack /* lootTable.gameObject.GetComponent<CardPack>() */ != null) {
    num += playerStatistics.cardPackIncrease || 0 /* playerStatistics.GetStat(StatEnum.CardPackIncrease, 0) */
  } else if (lootTableItem.class === "Misc") { // If item is of type "Misc"
    num += playerStatistics.materialChanceIncrease || 0 /* playerStatistics.GetStat(StatEnum.MaterialChanceIncrease, 0) */
  }
  return chance * parseFloat(num.toFixed(2))
}

function QBHKKMLLCNDKQ(playerStatistics, QPBDLPNEKMIPQ, QCCAGILOFBGPQ) {
  let list = []
  let list2 = GetLootTable(QCCAGILOFBGPQ)
  let num = 0.0

  list2.forEach(lootEntry => {
    num += lootEntry.chance
  })

  for (let i = 0; i < QPBDLPNEKMIPQ; i++) {
    let num2 = DiceParm.randy.NextDouble() * num

    for (let ii = 0; ii < list2.length; ii++) {
      let lootEntry2 = list2[ii]
      if (num2 < lootEntry2.chance) {
        list.push(lootEntry2)
        break;
      }

      num2 -= lootEntry2.chance
    }
  }
  return list;
}

function QIOCAMEAGKBFQ(playerStatistics, QCCAGILOFBGPQ) {
  let list = []
  let list2 = GetLootTable(QCCAGILOFBGPQ)
  list2.forEach(lootEntry => {
    if (lootEntry.item == null) {
      console.log('Loot Table is missing item reference')
    } else {
      let num = QJNLPGMKOGAJQ(playerStatistics, lootEntry)
      let num2 = DiceParm.randy.NextDouble() * 100.0
      if (num >= 100.0 || num2 < num) {
        let component = null /* lootEntry.item.gameObject.GetComponent() */ // ?
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
    return QBHKKMLLCNDKQ(playerStatistics, qpbdlpnekmipq, QCCAGILOFBGPQ)
  }

  if (lootTable.guaranteeItemCount === 0) {
    return QIOCAMEAGKBFQ(playerStatistics, QCCAGILOFBGPQ)
  }

  let list = QBHKKMLLCNDKQ(playerStatistics, lootTable.guaranteeItemCount, QCCAGILOFBGPQ)
  list.concat(QIOCAMEAGKBFQ(playerStatistics, QCCAGILOFBGPQ))
  return list
}

console.log(JSON.stringify(GetLoot({ dropRateIncrease: 0 })))
//GetLoot({ dropRateIncrease: 1 })

// Next to figure out, what calls GetLoot()?
