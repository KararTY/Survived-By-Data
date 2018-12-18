const fs = require('fs')
const path = require('path')

var patchDate = '2018-12-16'
var otherFolder = path.join(__dirname, patchDate, 'Other')

var count = 0
fs.readdirSync(otherFolder).forEach(val => {
  var file = require(path.join(otherFolder, val))
  if (file['0 MonoBehaviour Base']) {
    var monoBehaviour = file['0 MonoBehaviour Base']
    var moveToFolder = ''
    if (typeof monoBehaviour['1 string ChallengeTitle'] === 'string') moveToFolder = 'Challenge'
    else if (monoBehaviour['0 Array lootTable']) moveToFolder = 'LootTable'
    else if (typeof monoBehaviour['1 string NPCName'] === 'string') moveToFolder = 'NPC'
    else if (typeof monoBehaviour['1 string MonsterName'] === 'string') moveToFolder = 'Monster'
    else if (typeof monoBehaviour['1 string PlayerName'] === 'string') moveToFolder = 'Player'
    else if (monoBehaviour['0 PPtr<$ItemDefinition> FusionUpgradeItem']) moveToFolder = 'ItemDefinition'
    else if (monoBehaviour['0 Array availableModifiers']) moveToFolder = 'ItemModifier'
    else if (monoBehaviour['0 Array LeveledRecipes'] && monoBehaviour['0 Array LeveledRecipes'].length > 0) moveToFolder = 'CraftingRecipe'
    else if (typeof monoBehaviour['1 UInt8 shouldContainBloodstone'] === 'number') moveToFolder = 'LootBox'
    else if (monoBehaviour['0 Array sets'] && monoBehaviour['0 Array stat']) moveToFolder = 'Ancestral'
    if (moveToFolder.length > 0) {
      if (!fs.existsSync(path.join(__dirname, patchDate, moveToFolder))) fs.mkdirSync(path.join(__dirname, patchDate, moveToFolder))
      fs.renameSync(path.join(otherFolder, val), path.join(__dirname, patchDate, moveToFolder, val), (err) => {
        if (err) throw err
      })
      count++
      console.log(moveToFolder)
    }
  }
})
console.log('Moved', count, 'files.')
