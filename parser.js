const fs = require('fs')
const path = require('path')

// // Rename function
// var folder = 'Other'
// fs.readdir(path.join(__dirname, folder), (err, files) => {
//   if (err) throw err
//   files.forEach(val => {
//     fs.renameSync(path.join(__dirname, folder, val), path.join(__dirname, folder, val.replace(/(unnamed asset-|(sharedassets1|sharedassets2|resources).assets-|-GameObject|-MonoBehaviour)/g, '').split('-').pop()))
//   })
// })

/**
 * Following folders need to exist:
 * - GameObject
 * - ItemDefinition
 * - LootTable
 * - Monster
 * - Other
 * - Parsed^
 * ^Automatically created by this script.
 * Following files need to exist:
 * - StatEnum.json
 * - AICategoryEnum.json
 * - ElementalEnum.json
 * - ItemClassEnum.json
 * - ClassEnum.json
 * - CraftingCategory.json
 * - english.json
 */

var statEnum = require(path.join(__dirname, 'StatEnum.json'))
var categoryEnum = require(path.join(__dirname, 'AICategoryEnum.json'))
var elementEnum = require(path.join(__dirname, 'ElementalEnum.json'))
var itemClassEnum = require(path.join(__dirname, 'ItemClassEnum.json'))
var classEnum = require(path.join(__dirname, 'ClassEnum.json'))
var craftingCategoryEnum = require(path.join(__dirname, 'CraftingCategoryEnum.json'))
var english = require(path.join(__dirname, 'english.json'))

function hasFlag (a, b) {
  return (a & b) === b;
}

if (!fs.existsSync(path.join(__dirname, 'Parsed'))) {
  fs.mkdirSync(path.join(__dirname, 'Parsed'))
}

let folder1 = 'ItemDefinition'
fs.readdir(path.join(__dirname, folder1), (err, files) => {
  if (err) throw err
  let count = {}
  files.forEach(val => {
    var file = require(path.join(__dirname, folder1, val))
    var itemDefinition = {
      name: english[file['0 MonoBehaviour Base']['1 string Name']] || file['0 MonoBehaviour Base']['1 string Name'].replace(/[\/?<>\\:*|"]/g, ''),
      alias: (english[file['0 MonoBehaviour Base']['1 string Name']] || file['0 MonoBehaviour Base']['1 string Name']) === require(path.join(__dirname, 'GameObject', file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name']
        ? undefined
        : require(path.join(__dirname, 'GameObject', file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name'],
      description: english[file['0 MonoBehaviour Base']['1 string Description']],
      price: file['0 MonoBehaviour Base']['0 int Price'],
      sellPrice: file['0 MonoBehaviour Base']['0 int SellPrice'],
      consumable: !!file['0 MonoBehaviour Base']['1 UInt8 bConsumable'],
      requiredLevel: file['0 MonoBehaviour Base']['0 int RequiredLevel'],
      type: Object.keys(itemClassEnum).map(e => {
        if (itemClassEnum[e] === file['0 MonoBehaviour Base']['0 int Class']) return e
        else return undefined
      }).filter(Boolean).join(''),
      maxStack: file['0 MonoBehaviour Base']['0 int MaxStackAmount'],
      tier: file['0 MonoBehaviour Base']['0 int Tier'],
      data: require(path.join(__dirname, 'GameObject', file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['0 vector m_Component']['0 Array Array'].map(v => {
        if (!fs.existsSync(path.join(__dirname, 'Other', v['0 pair data']['0 PPtr<Component> second']['0 SInt64 m_PathID'] + '.json'))) return undefined
        var f = require(path.join(__dirname, 'Other', v['0 pair data']['0 PPtr<Component> second']['0 SInt64 m_PathID'] + '.json'))
        if (f['0 MonoBehaviour Base'] && f['0 MonoBehaviour Base']['0 float CraftingTime'] > 0) {
          return {
            crafting: {
              craftingTime: f['0 MonoBehaviour Base']['0 float CraftingTime'].toFixed(2),
              leveledRecipes: f['0 MonoBehaviour Base']['0 Array LeveledRecipes'].map(v => {
                return {
                  level: v['0 Deity.Shared.Recipe data']['0 int Level'],
                  craftingTime: v['0 Deity.Shared.Recipe data']['0 float CraftingTime'].toFixed(2),
                  requiredItems: v['0 Deity.Shared.Recipe data']['0 Array RequiredItems'].map(v => {
                    var f = require(path.join(__dirname, 'ItemDefinition', v['0 Deity.Shared.CraftRecipeItem data']['0 PPtr<$ItemDefinition> item']['0 SInt64 m_PathID'] + '.json'))
                    return {
                      name: english[f['0 MonoBehaviour Base']['1 string Name']] || f['0 MonoBehaviour Base']['1 string Name'],
                      count: v['0 Deity.Shared.CraftRecipeItem data']['0 unsigned int count'],
                      requiredLevel: v['0 Deity.Shared.CraftRecipeItem data']['0 unsigned int requiredLevel']
                    }
                  }),
                  craftCost: v['0 Deity.Shared.Recipe data']['0 int CraftCost'],
                  craftNowCost: v['0 Deity.Shared.Recipe data']['0 int CraftNowCost'],
                  craftingStat:  Object.keys(statEnum).map(e => {
                    if (statEnum[e] === v['0 Deity.Shared.Recipe data']['CraftingStat']) return e
                    else return undefined
                  }).filter(Boolean).join('')
                }
              }),
              requiredItems: f['0 MonoBehaviour Base']['0 Array RequiredItems'].map(v => {
                var f = require(path.join(__dirname, 'ItemDefinition', v['0 Deity.Shared.CraftRecipeItem data']['0 PPtr<$ItemDefinition> item']['0 SInt64 m_PathID'] + '.json'))
                return {
                  name: english[f['0 MonoBehaviour Base']['1 string Name']] || f['0 MonoBehaviour Base']['1 string Name'],
                  count: v['0 Deity.Shared.CraftRecipeItem data']['0 unsigned int count'],
                  requiredLevel: v['0 Deity.Shared.CraftRecipeItem data']['0 unsigned int requiredLevel']
                }
              }),
              craftCost: f['0 MonoBehaviour Base']['0 int CraftCost'],
              craftNowCost: f['0 MonoBehaviour Base']['0 int CraftNowCost'],
              craftingStat: Object.keys(statEnum).map(e => {
                if (statEnum[e] === f['0 MonoBehaviour Base']['0 int CraftingStat']) return e
                else return undefined
              }).filter(Boolean).join(''),
              craftingCategory: Object.keys(craftingCategoryEnum).map(e => {
                if (craftingCategoryEnum[e] === f['0 MonoBehaviour Base']['0 int craftingCategory']) return e
                else return undefined
              }).filter(Boolean).join('')
            }
          }
        } else return undefined
      }).filter(Boolean),
      stats: file['0 MonoBehaviour Base']['0 Array stat'].length > 0 ? file['0 MonoBehaviour Base']['0 Array stat'].map(v => {
        return {
          key: Object.keys(statEnum).map(e => {
             if (statEnum[e] === v['0 Deity.Shared.Stat data']['0 int key']) return e
             else return undefined
           }).filter(Boolean).join(''),
          equation: v['0 Deity.Shared.Stat data']['1 string equation'],
          value: v['0 Deity.Shared.Stat data']['0 float value'].toFixed(2)
        }
      }) : undefined,
      experiencePerLevel: file['0 MonoBehaviour Base']['0 Array ExperiencePerLevel'].map(v => {
        return v['0 int data']
      }),
      class: Object.keys(classEnum).map(e => {
        if (e !== 'None' && classEnum[e] === file['0 MonoBehaviour Base']['0 int EquipMask']) return e
        else if (e !== 'None' && hasFlag(file['0 MonoBehaviour Base']['0 int EquipMask'], classEnum[e])) return e
        else return undefined
      }).filter(Boolean),
      bonusDismantleLoot: file['0 MonoBehaviour Base']['0 PPtr<$LootTable> BonusDismantleLoot']['0 SInt64 m_PathID'] > 0 ? {
        name: require(path.join(__dirname, 'GameObject', require(path.join(__dirname, 'LootTable', file['0 MonoBehaviour Base']['0 PPtr<$LootTable> BonusDismantleLoot']['0 SInt64 m_PathID'] + '.json'))['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name'],
        lootTable: require(path.join(__dirname, 'LootTable', file['0 MonoBehaviour Base']['0 PPtr<$LootTable> BonusDismantleLoot']['0 SInt64 m_PathID'] + '.json'))['0 MonoBehaviour Base']['0 Array lootTable'].map(v => {
          return {
            item: english[require(path.join(__dirname, 'ItemDefinition', v['0 Deity.Shared.LootEntry data']['0 PPtr<$ItemDefinition> item']['0 SInt64 m_PathID']  + '.json'))['0 MonoBehaviour Base']['1 string Name']] || require(path.join(__dirname, 'ItemDefinition', v['0 Deity.Shared.LootEntry data']['0 PPtr<$ItemDefinition> item']['0 SInt64 m_PathID']  + '.json'))['0 MonoBehaviour Base']['1 string Name'],
            count: {
              dice: v['0 Deity.Shared.LootEntry data']['0 Deity.Shared.DiceParm count']['0 int dice'],
              faces: v['0 Deity.Shared.LootEntry data']['0 Deity.Shared.DiceParm count']['0 int faces'],
              add: v['0 Deity.Shared.LootEntry data']['0 Deity.Shared.DiceParm count']['0 int add']
            },
            chance: v['0 Deity.Shared.LootEntry data']['0 double chance'],
            allowModifiers: !!v['0 Deity.Shared.LootEntry data']['1 UInt8 allowModifiers']
          }
        })
      } : undefined,
      bound: {
        account: !!file['0 MonoBehaviour Base']['1 UInt8 AlwaysSoulbound'],
        soul: !!file['0 MonoBehaviour Base']['1 UInt8 AlwaysAccountbound']
      },
      isHeirloom: !!file['0 MonoBehaviour Base']['1 UInt8 IsHeirloomItem'],
      requiresDiscovery: !!file['0 MonoBehaviour Base']['1 UInt8 RequiresDiscovery'],
      recoverCost: file['0 MonoBehaviour Base']['0 int RecoverCost'],
      insureCost: file['0 MonoBehaviour Base']['0 int InsureCost'],
      currency: file['0 MonoBehaviour Base']['0 PPtr<$GameObject> Currency']['0 SInt64 m_PathID'] > 0 ? require(path.join(__dirname, 'GameObject', file['0 MonoBehaviour Base']['0 PPtr<$GameObject> Currency']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name'] : undefined,
      coolDown: file['0 MonoBehaviour Base']['0 float CoolDown'].toFixed(2),
      modifierChance: file['0 MonoBehaviour Base']['0 float ModifierChance'].toFixed(2)
    }
    if (typeof count[itemDefinition.name] === 'number') count[itemDefinition.name]++
    else count[itemDefinition.name] = 0

    if (!fs.existsSync(path.join(__dirname, 'Parsed', folder1))) {
      fs.mkdirSync(path.join(__dirname, 'Parsed', folder1))
    }

    fs.writeFileSync(path.join(__dirname, 'Parsed', folder1, `${itemDefinition.name}-${count[itemDefinition.name]}.json`), JSON.stringify(itemDefinition))
  })
  console.log(folder1, 'Complete.')
})

let folder2 = 'LootTable'
fs.readdir(path.join(__dirname, folder2), (err, files) => {
  if (err) throw err
  let count = {}
  files.forEach(val => {
    var file = require(path.join(__dirname, folder2, val))
    var lootTable = {
      from: require(path.join(__dirname, 'GameObject', file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name'],
      enabled: !!file['0 MonoBehaviour Base']['1 UInt8 m_Enabled'],
      guaranteeItemCount: file['0 MonoBehaviour Base']['0 int guaranteeItemCount'],
      maximumItemCount: file['0 MonoBehaviour Base']['0 int maximumItemCount'],
      lootTable: file['0 MonoBehaviour Base']['0 Array lootTable'].map(v => {
        return {
          item: english[require(path.join(__dirname, 'ItemDefinition', v['0 Deity.Shared.LootEntry data']['0 PPtr<$ItemDefinition> item']['0 SInt64 m_PathID']  + '.json'))['0 MonoBehaviour Base']['1 string Name']] || require(path.join(__dirname, 'ItemDefinition', v['0 Deity.Shared.LootEntry data']['0 PPtr<$ItemDefinition> item']['0 SInt64 m_PathID']  + '.json'))['0 MonoBehaviour Base']['1 string Name'],
          count: {
            dice: v['0 Deity.Shared.LootEntry data']['0 Deity.Shared.DiceParm count']['0 int dice'],
            faces: v['0 Deity.Shared.LootEntry data']['0 Deity.Shared.DiceParm count']['0 int faces'],
            add: v['0 Deity.Shared.LootEntry data']['0 Deity.Shared.DiceParm count']['0 int add']
          },
          chance: v['0 Deity.Shared.LootEntry data']['0 double chance'],
          allowModifiers: !!v['0 Deity.Shared.LootEntry data']['1 UInt8 allowModifiers']
        }
      }),
      reference: file['0 MonoBehaviour Base']['0 PPtr<$LootTable> ReferenceObject']['0 SInt64 m_PathID'] > 0
      ? require(path.join(__dirname, 'GameObject', require(path.join(__dirname, 'LootTable', file['0 MonoBehaviour Base']['0 PPtr<$LootTable> ReferenceObject']['0 SInt64 m_PathID'] + '.json'))['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name']
      : undefined
    }
    if (typeof count[lootTable.from] === 'number') count[lootTable.from]++
    else count[lootTable.from] = 0

    if (!fs.existsSync(path.join(__dirname, 'Parsed', folder2))) {
      fs.mkdirSync(path.join(__dirname, 'Parsed', folder2))
    }

    fs.writeFileSync(path.join(__dirname, 'Parsed', folder2, `${lootTable.from}-${count[lootTable.from]}.json`), JSON.stringify(lootTable))
  })
  console.log(folder2, 'Complete.')
})

let folder3 = 'Monster'
fs.readdir(path.join(__dirname, folder3), (err, files) => {
  if (err) throw err
  let count = {}
  files.forEach(val => {
    var file = require(path.join(__dirname, folder3, val))
    var monsterInfo = {
      name: file['0 MonoBehaviour Base']['1 string MonsterName'].length > 0
        ? english[file['0 MonoBehaviour Base']['1 string MonsterName']] || file['0 MonoBehaviour Base']['1 string MonsterName'].replace(/[\/?<>\\:*|"]/g, '')
        : require(path.join(__dirname, 'GameObject', file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name'],
      alias: file['0 MonoBehaviour Base']['1 string MonsterName'].length > 0 
        ? (english[file['0 MonoBehaviour Base']['1 string MonsterName']] || file['0 MonoBehaviour Base']['1 string MonsterName']) === require(path.join(__dirname, 'GameObject', file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name']
          ? undefined
          : require(path.join(__dirname, 'GameObject', file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name']
        : undefined,
      description: english[file['0 MonoBehaviour Base']['1 string MonsterDescription']] || file['0 MonoBehaviour Base']['1 string MonsterDescription'],
      enabled: !!file['0 MonoBehaviour Base']['1 UInt8 m_Enabled'],
      isBoss: !!file['0 MonoBehaviour Base']['1 UInt8 IsBoss'],
      isElite: !!file['0 MonoBehaviour Base']['1 UInt8 IsElite'],
      isSetPieceMonster: !!file['0 MonoBehaviour Base']['1 UInt8 IsSetPieceMonster'],
      data: require(path.join(__dirname, 'GameObject', file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['0 vector m_Component']['0 Array Array'].map(v => {
        if (!fs.existsSync(path.join(__dirname, 'Other', v['0 pair data']['0 PPtr<Component> second']['0 SInt64 m_PathID'] + '.json'))) return undefined
        var f = require(path.join(__dirname, 'Other', v['0 pair data']['0 PPtr<Component> second']['0 SInt64 m_PathID'] + '.json'))
        if (f['0 MonoBehaviour Base'] && f['0 MonoBehaviour Base']['0 Array stat'] && f['0 MonoBehaviour Base']['0 Array stat'].length > 0) {
          return {
            stats: f['0 MonoBehaviour Base']['0 Array stat'].map(v => {
              return {
                key: Object.keys(statEnum).map(e => {
                  if (statEnum[e] === v['0 Deity.Shared.Stat data']['0 int key']) return e
                  else return undefined
                }).filter(Boolean).join(''),
                equation: v['0 Deity.Shared.Stat data']['1 string equation'],
                value: v['0 Deity.Shared.Stat data']['0 float value'].toFixed(2)
              }
            })
          }
        } else if (f['0 MonoBehaviour Base'] && f['0 MonoBehaviour Base']['0 Deity.Shared.CollisionShape shape']) {
          return {
            bSlide: !!f['0 MonoBehaviour Base']['1 UInt8 bSlide'],
            bPlayer: !!f['0 MonoBehaviour Base']['1 UInt8 bPlayer'],
            bEnemy: !!f['0 MonoBehaviour Base']['1 UInt8 bEnemy'],
            bSkipWorld: !!f['0 MonoBehaviour Base']['1 UInt8 bSkipWorld'],
            bSlowedDownByWater: !!f['0 MonoBehaviour Base']['1 UInt8 bSlowedDownByWater'],
            bBlockedByLava: !!f['0 MonoBehaviour Base']['1 UInt8 bBlockedByLava'],
            bFlying: !!f['0 MonoBehaviour Base']['1 UInt8 bFlying']
          }
        } else return undefined
      }).filter(Boolean),
      zenithEffects: file['0 MonoBehaviour Base']['0 Array ZenithEffects'].map(v => {
        var z = require(path.join(__dirname, 'Other', v['0 PPtr<$StatusEffect> data']['0 SInt64 m_PathID'] + '.json'))
        return {
          name: z['0 MonoBehaviour Base']['1 string Name'],
          type: z['0 MonoBehaviour Base']['0 int Type'],
          duration: z['0 MonoBehaviour Base']['0 float Duration'].toFixed(2),
          stats: z['0 MonoBehaviour Base']['0 Array stat'].map(v => {
            return {
              key: Object.keys(statEnum).map(e => {
                if (statEnum[e] === v['0 Deity.Shared.Stat data']['0 int key']) return e
                else return undefined
              }).filter(Boolean).join(''),
              equation: v['0 Deity.Shared.Stat data']['1 string equation'],
              value: v['0 Deity.Shared.Stat data']['0 float value'].toFixed(2)
            }
          }),
          isBuff: !!z['0 MonoBehaviour Base']['1 UInt8 IsBuff'],
          isZenith: !!z['0 MonoBehaviour Base']['1 UInt8 IsZenith'],
          removeOnAttack: !!z['0 MonoBehaviour Base']['1 UInt8 RemoveOnAttack'],
          floatingText: z['0 MonoBehaviour Base']['1 string floatingText'],
          noTimeOut: !!z['0 MonoBehaviour Base']['1 UInt8 NoTimeOut'],
          coolDownTime: z['0 MonoBehaviour Base']['0 float CoolDownTime'].toFixed(2),
          isAccountWide: z['0 MonoBehaviour Base']['1 UInt8 IsAccountWide'],
        }
      }),
      category: Object.keys(categoryEnum).map(e => {
        if (categoryEnum[e] === file['0 MonoBehaviour Base']['0 int Category']) return e
        else return undefined
      }).filter(Boolean).join(''),
      element: Object.keys(elementEnum).map(e => {
        if (elementEnum[e] === file['0 MonoBehaviour Base']['0 int Element']) return e
        else return undefined
      }).filter(Boolean).join(''),
    }
    if (typeof count[monsterInfo.name] === 'number') count[monsterInfo.name]++
    else count[monsterInfo.name] = 0

    if (!fs.existsSync(path.join(__dirname, 'Parsed', folder3))) {
      fs.mkdirSync(path.join(__dirname, 'Parsed', folder3))
    }

    fs.writeFileSync(path.join(__dirname, 'Parsed', folder3, `${monsterInfo.name}-${count[monsterInfo.name]}.json`), JSON.stringify(monsterInfo))
  })
  console.log(folder3, 'Complete.')
})
