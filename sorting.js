const fs = require('fs')
const path = require('path')

module.exports = () => {
  var patchDate = require(path.join(__dirname, 'patchDate.json'))['patchDate']
  var folder = path.join(__dirname, 'Raw data', patchDate, 'Other')

  var count = 0
  var announceAtNextCount = 500
  fs.readdirSync(folder).forEach(val => {
    var file = require(path.join(folder, val))
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
      else if (monoBehaviour['0 Array spawnList']) moveToFolder = 'SpawnerDef'
      else if (monoBehaviour['0 PPtr<$GameObject> questChain']) moveToFolder = 'QuestGiver'
      if (moveToFolder.length > 0) {
        if (!fs.existsSync(path.join(__dirname, 'Raw data', patchDate, moveToFolder))) fs.mkdirSync(path.join(__dirname, 'Raw data', patchDate, moveToFolder))
        fs.renameSync(path.join(folder, val), path.join(__dirname, 'Raw data', patchDate, moveToFolder, val))
        count++
        if (count === announceAtNextCount) {
          announceAtNextCount += 500
          console.log('Sorted', count, 'files so far...')
        }
      }
    }
  })
  return count
}
