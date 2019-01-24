const fs = require('fs')
const path = require('path')
const rimraf = require('rimraf')

module.exports = () => {
  var patchDate = require(path.join(__dirname, 'patchDate.json'))['patchDate']
  var language = 'english'

  var statEnum = require(path.join(__dirname, 'StatEnum.json'))
  var categoryEnum = require(path.join(__dirname, 'AICategoryEnum.json'))
  var elementEnum = require(path.join(__dirname, 'ElementalEnum.json'))
  var itemClassEnum = require(path.join(__dirname, 'ItemClassEnum.json'))
  var classEnum = require(path.join(__dirname, 'ClassEnum.json'))
  var craftingCategoryEnum = require(path.join(__dirname, 'CraftingCategoryEnum.json'))
  var craftingRarityEnumAndValue = require(path.join(__dirname, 'CraftingRarityEnumAndValue.json'))
  var soundListEnum = require(path.join(__dirname, 'SoundListEnum.json'))
  var statusEffectEnum = require(path.join(__dirname, 'StatusEffectTypeEnum.json'))
  var ancestralRarityEnum = require(path.join(__dirname, 'AncestralRarityEnum.json'))
  var itemModifierCategoryEnum = require(path.join(__dirname, 'ItemModifierCategoryEnum.json'))
  var npcCategoryEnum = require(path.join(__dirname, 'NPCCategoryEnum.json'))
  var fileNameMap = require(path.join(__dirname, 'Raw data', patchDate, 'map.json'))
  var procTriggerEnum = require(path.join(__dirname, 'ProcTriggerEnum.json'))
  var procTriggerActionEnum = require(path.join(__dirname, 'ProcTriggerActionEnum.json'))
  var procTriggerChanceSourceEnum = require(path.join(__dirname, 'ProcTriggerChanceSourceEnum.json'))
  var biomeTypeEnum = require(path.join(__dirname, 'BiomeTypeEnum.json'))

  var translate = require(path.join(__dirname, `${language}.json`))

  function hasFlag(a, b) {
    return (a & b) === b;
  }

  if (!fs.existsSync(path.join(__dirname, 'Patch'))) {
    fs.mkdirSync(path.join(__dirname, 'Patch'), { recursive: true })
  } else {
    rimraf.sync(path.join(__dirname, 'Patch'))
    fs.mkdirSync(path.join(__dirname, 'Patch'), { recursive: true })
  }

  function fileMap(num) {
    /**
    * 4 = 0 
    * 0 = 4 
    * Should only be added if you only selected the one file in UABE named sharedassets2.assets.
    * if (num === 0) num = 4
    * else if (num === 4) num = 0
    */
    return fileNameMap.files.find(v => v.absFileID === num)['name'] + '-'
  }

  var folder = {
    'ItemDefinition': path.join(__dirname, 'Raw data', patchDate, 'ItemDefinition'),
    'Monster': path.join(__dirname, 'Raw data', patchDate, 'Monster'),
    'LootTable': path.join(__dirname, 'Raw data', patchDate, 'LootTable'),
    'Other': path.join(__dirname, 'Raw data', patchDate, 'Other'),
    'Ancestral': path.join(__dirname, 'Raw data', patchDate, 'Ancestral'),
    'CraftingRecipe': path.join(__dirname, 'Raw data', patchDate, 'CraftingRecipe'),
    'ItemModifier': path.join(__dirname, 'Raw data', patchDate, 'ItemModifier'),
    'LootBox': path.join(__dirname, 'Raw data', patchDate, 'LootBox'),
    'NPC': path.join(__dirname, 'Raw data', patchDate, 'NPC'),
    'Player': path.join(__dirname, 'Raw data', patchDate, 'Player'),
    'Challenge': path.join(__dirname, 'Raw data', patchDate, 'Challenge'),
    'SpawnerDef': path.join(__dirname, 'Raw data', patchDate, 'SpawnerDef')
  }

  let folderName1 = 'ItemDefinition'
  if (folder[folderName1]) {
    fs.mkdirSync(path.join(__dirname, 'Patch', folderName1))
    var count = 0
    var announceAtNextCount = 500
    fs.readdirSync(folder[folderName1]).forEach(val => {
      var file = require(path.join(folder[folderName1], val))
      var itemDefinition = {
        name: translate[file['0 MonoBehaviour Base']['1 string Name']] || file['0 MonoBehaviour Base']['1 string Name'].replace(/[\/?<>\\:*|"]/g, ''),
        alias: (translate[file['0 MonoBehaviour Base']['1 string Name']] || file['0 MonoBehaviour Base']['1 string Name']) === require(path.join(folder['Other'], fileMap(file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 int m_FileID']) + file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name']
          ? undefined
          : require(path.join(folder['Other'], fileMap(file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 int m_FileID']) + file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name'],
        description: translate[file['0 MonoBehaviour Base']['1 string Description']] || (file['0 MonoBehaviour Base']['1 string Description'].startsWith('string') ? '' : file['0 MonoBehaviour Base']['1 string Description']),
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
        data: require(path.join(folder['Other'], fileMap(file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 int m_FileID']) + file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['0 vector m_Component']['0 Array Array'].map(v => {
          if (!fs.existsSync(path.join(folder['Other'], fileMap(v['0 pair data']['0 PPtr<Component> second']['0 int m_FileID']) + v['0 pair data']['0 PPtr<Component> second']['0 SInt64 m_PathID'] + '.json'))) return undefined
          var f = require(path.join(folder['Other'], fileMap(v['0 pair data']['0 PPtr<Component> second']['0 int m_FileID']) + v['0 pair data']['0 PPtr<Component> second']['0 SInt64 m_PathID'] + '.json'))
          if (f['0 MonoBehaviour Base'] && typeof f['0 MonoBehaviour Base']['0 int netObjectType'] === 'number') return undefined
          if (f['0 MonoBehaviour Base'] && f['0 MonoBehaviour Base']['0 float CraftingTime'] > 0) {
            return {
              crafting: {
                craftingTime: parseFloat(f['0 MonoBehaviour Base']['0 float CraftingTime'].toFixed(2)),
                leveledRecipes: f['0 MonoBehaviour Base']['0 Array LeveledRecipes'].length > 0
                  ? f['0 MonoBehaviour Base']['0 Array LeveledRecipes'].map(v => {
                    return {
                      level: v['0 Deity.Shared.Recipe data']['0 int Level'],
                      craftingTime: parseFloat(v['0 Deity.Shared.Recipe data']['0 float CraftingTime'].toFixed(2)),
                      requiredItems: v['0 Deity.Shared.Recipe data']['0 Array RequiredItems'].map(v => {
                        var f = require(path.join(folder['ItemDefinition'], fileMap(v['0 Deity.Shared.CraftRecipeItem data']['0 PPtr<$ItemDefinition> item']['0 int m_FileID']) + v['0 Deity.Shared.CraftRecipeItem data']['0 PPtr<$ItemDefinition> item']['0 SInt64 m_PathID'] + '.json'))
                        return {
                          name: translate[f['0 MonoBehaviour Base']['1 string Name']] || f['0 MonoBehaviour Base']['1 string Name'],
                          count: v['0 Deity.Shared.CraftRecipeItem data']['0 unsigned int count'],
                          requiredLevel: v['0 Deity.Shared.CraftRecipeItem data']['0 unsigned int requiredLevel']
                        }
                      }),
                      craftCost: v['0 Deity.Shared.Recipe data']['0 int CraftCost'],
                      craftNowCost: v['0 Deity.Shared.Recipe data']['0 int CraftNowCost'],
                      craftingStat: Object.keys(statEnum).map(e => {
                        if (statEnum[e] === v['0 Deity.Shared.Recipe data']['CraftingStat']) return e
                        else return undefined
                      }).filter(Boolean).join('')
                    }
                  })
                  : undefined,
                requiredItems: f['0 MonoBehaviour Base']['0 Array RequiredItems'].map(v => {
                  var f = require(path.join(folder['ItemDefinition'], fileMap(v['0 Deity.Shared.CraftRecipeItem data']['0 PPtr<$ItemDefinition> item']['0 int m_FileID']) + v['0 Deity.Shared.CraftRecipeItem data']['0 PPtr<$ItemDefinition> item']['0 SInt64 m_PathID'] + '.json'))
                  return {
                    name: translate[f['0 MonoBehaviour Base']['1 string Name']] || f['0 MonoBehaviour Base']['1 string Name'],
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
          } else if (f['0 MonoBehaviour Base'] && typeof f['0 MonoBehaviour Base']['1 string estimatedPrice'] === 'string') {
            return {
              sale: {
                packName: f['0 MonoBehaviour Base']['1 string packName'].length > 0 ? f['0 MonoBehaviour Base']['1 string packName'] : undefined,
                estimatedPrice: f['0 MonoBehaviour Base']['1 string estimatedPrice'],
                price: f['0 MonoBehaviour Base']['1 string price']
              }
            }
          } else if (f['0 MonoBehaviour Base'] && f['0 MonoBehaviour Base']['0 PPtr<$Sprite> m_Sprite'] && f['0 MonoBehaviour Base']['0 PPtr<$Sprite> m_Sprite']['0 SInt64 m_PathID']) {
            var srd = require(path.join(folder['Other'], fileMap(f['0 MonoBehaviour Base']['0 PPtr<$Sprite> m_Sprite']['0 int m_FileID']) + f['0 MonoBehaviour Base']['0 PPtr<$Sprite> m_Sprite']['0 SInt64 m_PathID'] + '.json'))['0 Sprite Base']['1 SpriteRenderData m_RD']
            var s = require(path.join(folder['Other'], fileMap(srd['0 PPtr<Texture2D> texture']['0 int m_FileID']) + srd['0 PPtr<Texture2D> texture']['0 SInt64 m_PathID'] + '.json'))['0 Texture2D Base']
            return {
              sprite: {
                name: s['1 string m_Name'],
                baseSize: {
                  width: s['0 int m_Width'],
                  height: s['0 int m_Height']
                },
                textureRectangle: {
                  x: parseFloat(srd['0 Rectf textureRect']['0 float x'].toFixed(0)),
                  y: parseFloat(srd['0 Rectf textureRect']['0 float y'].toFixed(0)),
                  width: parseFloat(srd['0 Rectf textureRect']['0 float width'].toFixed(0)),
                  height: parseFloat(srd['0 Rectf textureRect']['0 float height'].toFixed(0))
                },
                textureOffset: {
                  x: parseFloat(srd['0 Vector2f textureRectOffset']['0 float x'].toFixed(0)),
                  y: parseFloat(srd['0 Vector2f textureRectOffset']['0 float y'].toFixed(0))
                },
                color: {
                  r: parseFloat(f['0 MonoBehaviour Base']['0 ColorRGBA m_Color']['0 float r'].toFixed(2)),
                  g: parseFloat(f['0 MonoBehaviour Base']['0 ColorRGBA m_Color']['0 float g'].toFixed(2)),
                  b: parseFloat(f['0 MonoBehaviour Base']['0 ColorRGBA m_Color']['0 float b'].toFixed(2)),
                  a: parseFloat(f['0 MonoBehaviour Base']['0 ColorRGBA m_Color']['0 float a'].toFixed(2)),
                }
              }
            }
          } else if (f['0 MonoBehaviour Base'] && f['0 MonoBehaviour Base']['0 float timeToFuse']) {
            return {
              socketableItem: {
                craftTime: parseFloat(f['0 MonoBehaviour Base']['0 float craftTime'].toFixed(2)),
                costToApply: f['0 MonoBehaviour Base']['0 int costToApply'],
                timeToFuse: parseFloat(f['0 MonoBehaviour Base']['0 float timeToFuse'].toFixed(2))
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
            value: parseFloat(v['0 Deity.Shared.Stat data']['0 float value'].toFixed(2))
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
        modifiers: file['0 MonoBehaviour Base']['0 Array initialModifiers'].length > 0
          ? file['0 MonoBehaviour Base']['0 Array initialModifiers'].map(v => {
            var f = require(path.join(folder['Other'], fileMap(v['0 PPtr<$ItemModifier> data']['0 int m_FileID']) + v['0 PPtr<$ItemModifier> data']['0 SInt64 m_PathID'] + '.json'))
            if (f['0 MonoBehaviour Base'] && f['0 MonoBehaviour Base']['0 PPtr<$EquipmentSet> Set']) {
              return {
                nameMod: f['0 MonoBehaviour Base']['1 string nameMod'].length > 0 ? translate[f['0 MonoBehaviour Base']['1 string nameMod']] || f['0 MonoBehaviour Base']['1 string nameMod'] : undefined,
                equipmentSet: f['0 MonoBehaviour Base']['0 PPtr<$EquipmentSet> Set']['0 SInt64 m_PathID']
                  ? (function () {
                    var e = require(path.join(folder['Other'], fileMap(f['0 MonoBehaviour Base']['0 PPtr<$EquipmentSet> Set']['0 int m_FileID']) + f['0 MonoBehaviour Base']['0 PPtr<$EquipmentSet> Set']['0 SInt64 m_PathID'] + '.json'))
                    return {
                      name: require(path.join(folder['Other'], fileMap(e['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 int m_FileID']) + e['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name'],
                      description: e['0 MonoBehaviour Base']['1 string Description'],
                      minimumRequiredAmount: e['0 MonoBehaviour Base']['0 int minimumNumberOfItemsToEnable'],
                      stats: e['0 MonoBehaviour Base']['0 Array stat'].map(v => {
                        return {
                          key: Object.keys(statEnum).map(e => {
                            if (statEnum[e] === v['0 Deity.Shared.Stat data']['0 int key']) return e
                            else return undefined
                          }).filter(Boolean).join(''),
                          equation: v['0 Deity.Shared.Stat data']['1 string equation'],
                          value: parseFloat(v['0 Deity.Shared.Stat data']['0 float value'].toFixed(2))
                        }
                      })
                    }
                  })()
                  : undefined,
                expireTime: parseFloat(f['0 MonoBehaviour Base']['0 float expireTime'].toFixed(2)),
                validClasses: Object.keys(classEnum).map(e => {
                  if (e !== 'None' && classEnum[e] === f['0 MonoBehaviour Base']['0 int validEquipMask']) return e
                  else if (e !== 'None' && hasFlag(f['0 MonoBehaviour Base']['0 int validEquipMask'], classEnum[e])) return e
                  else return undefined
                }).filter(Boolean),
                type: Object.keys(itemClassEnum).map(e => {
                  if (e !== 'None' && itemClassEnum[e] === f['0 MonoBehaviour Base']['0 int validClasses']) return e
                  else if (e !== 'None' && hasFlag(f['0 MonoBehaviour Base']['0 int validClasses'], itemClassEnum[e])) return e
                  else return undefined
                }).filter(Boolean),
                minTier: f['0 MonoBehaviour Base']['0 int minTier'],
                maxTier: f['0 MonoBehaviour Base']['0 int maxTier'],
                chanceToApply: parseFloat(f['0 MonoBehaviour Base']['0 float chanceToApply'].toFixed(2)),
                stats: f['0 MonoBehaviour Base']['0 Array stat'].length > 0 ? f['0 MonoBehaviour Base']['0 Array stat'].map(v => {
                  return {
                    key: Object.keys(statEnum).map(e => {
                      if (statEnum[e] === v['0 Deity.Shared.Stat data']['0 int key']) return e
                      else return undefined
                    }).filter(Boolean).join(''),
                    equation: v['0 Deity.Shared.Stat data']['1 string equation'],
                    value: parseFloat(v['0 Deity.Shared.Stat data']['0 float value'].toFixed(2))
                  }
                }) : undefined
              }
            } else return undefined
          })
          : undefined,
        bonusDismantleLoot: file['0 MonoBehaviour Base']['0 PPtr<$LootTable> BonusDismantleLoot']['0 SInt64 m_PathID']
          ? (function () {
            var lootTable = require(path.join(folder['LootTable'], fileMap(file['0 MonoBehaviour Base']['0 PPtr<$LootTable> BonusDismantleLoot']['0 int m_FileID']) + file['0 MonoBehaviour Base']['0 PPtr<$LootTable> BonusDismantleLoot']['0 SInt64 m_PathID'] + '.json'))
            return require(path.join(folder['Other'], fileMap(lootTable['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 int m_FileID']) + lootTable['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name']
          })()
          : undefined,
        fusionUpgradeItem: file['0 MonoBehaviour Base']['0 PPtr<$ItemDefinition> FusionUpgradeItem']['0 SInt64 m_PathID']
          ? (function () {
            var f = require(path.join(folder['ItemDefinition'], fileMap(file['0 MonoBehaviour Base']['0 PPtr<$ItemDefinition> FusionUpgradeItem']['0 int m_FileID']) + file['0 MonoBehaviour Base']['0 PPtr<$ItemDefinition> FusionUpgradeItem']['0 SInt64 m_PathID'] + '.json'))['0 MonoBehaviour Base']
            return translate[f['1 string Name']] || f['1 string Name']
          })()
          : undefined,
        bound: {
          account: !!file['0 MonoBehaviour Base']['1 UInt8 AlwaysSoulbound'],
          soul: !!file['0 MonoBehaviour Base']['1 UInt8 AlwaysAccountbound']
        },
        isHeirloom: !!file['0 MonoBehaviour Base']['1 UInt8 IsHeirloomItem'],
        requiresDiscovery: !!file['0 MonoBehaviour Base']['1 UInt8 RequiresDiscovery'],
        recoverCost: file['0 MonoBehaviour Base']['0 int RecoverCost'],
        insureCost: file['0 MonoBehaviour Base']['0 int InsureCost'],
        currency: file['0 MonoBehaviour Base']['0 PPtr<$GameObject> Currency']['0 SInt64 m_PathID']
          ? require(path.join(folder['Other'], fileMap(file['0 MonoBehaviour Base']['0 PPtr<$GameObject> Currency']['0 int m_FileID']) + file['0 MonoBehaviour Base']['0 PPtr<$GameObject> Currency']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name']
          : undefined,
        coolDown: parseFloat(file['0 MonoBehaviour Base']['0 float CoolDown'].toFixed(2)) ? parseFloat(file['0 MonoBehaviour Base']['0 float CoolDown'].toFixed(2)) : undefined,
        modifierChance: parseFloat(file['0 MonoBehaviour Base']['0 float ModifierChance'].toFixed(2)),
        craftingRarity: file['0 MonoBehaviour Base']['0 int craftingRarity']
          ? [
            craftingRarityEnumAndValue[Object.keys(craftingRarityEnumAndValue)[file['0 MonoBehaviour Base']['0 int craftingRarity']]],
            Object.keys(craftingRarityEnumAndValue)[file['0 MonoBehaviour Base']['0 int craftingRarity']]
          ]
          : undefined
      }

      var filename = path.join(__dirname, 'Patch', folderName1, `${itemDefinition.name}.json`)
      if (fs.existsSync(filename)) {
        var file = JSON.parse(fs.readFileSync(filename, 'utf-8'))
        file.push(itemDefinition)
        fs.writeFileSync(filename, JSON.stringify(file, null, 2))
      } else fs.writeFileSync(filename, JSON.stringify([itemDefinition], null, 2))
      count++
      if (count === announceAtNextCount) {
        announceAtNextCount += 500
        console.log(folderName1, 'at', count, '...')
      }
    })
    console.log(folderName1, 'completed', 'at', count)
  }

  let folderName2 = 'LootTable'
  if (folder[folderName2]) {
    fs.mkdirSync(path.join(__dirname, 'Patch', folderName2))
    var count = 0
    var announceAtNextCount = 500
    fs.readdirSync(folder[folderName2]).forEach(val => {
      var file = require(path.join(folder[folderName2], val))
      var lootTable = {
        from: require(path.join(folder['Other'], fileMap(file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 int m_FileID']) + file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name'],
        guaranteeItemCount: file['0 MonoBehaviour Base']['0 int guaranteeItemCount'],
        maximumItemCount: file['0 MonoBehaviour Base']['0 int maximumItemCount'],
        lootTable: file['0 MonoBehaviour Base']['0 Array lootTable'].map(v => {
          return {
            item: translate[require(path.join(folder['ItemDefinition'], fileMap(v['0 Deity.Shared.LootEntry data']['0 PPtr<$ItemDefinition> item']['0 int m_FileID']) + v['0 Deity.Shared.LootEntry data']['0 PPtr<$ItemDefinition> item']['0 SInt64 m_PathID'] + '.json'))['0 MonoBehaviour Base']['1 string Name']] || require(path.join(folder['ItemDefinition'], fileMap(v['0 Deity.Shared.LootEntry data']['0 PPtr<$ItemDefinition> item']['0 int m_FileID']) + v['0 Deity.Shared.LootEntry data']['0 PPtr<$ItemDefinition> item']['0 SInt64 m_PathID'] + '.json'))['0 MonoBehaviour Base']['1 string Name'],
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
          ? (function () {
            var lootTable = require(path.join(folder['LootTable'], fileMap(file['0 MonoBehaviour Base']['0 PPtr<$LootTable> ReferenceObject']['0 int m_FileID']) + file['0 MonoBehaviour Base']['0 PPtr<$LootTable> ReferenceObject']['0 SInt64 m_PathID'] + '.json'))
            return require(path.join(folder['Other'], fileMap(lootTable['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 int m_FileID']) + lootTable['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name']
          })()
          : undefined,
        questLootTable: file['0 MonoBehaviour Base']['0 PPtr<$GameObject> questTargetTrigger'] && file['0 MonoBehaviour Base']['0 PPtr<$GameObject> questTargetTrigger']['0 SInt64 m_PathID'] > 0
          ? (function () {
            var lootTable = require(path.join(folder['Other'], fileMap(file['0 MonoBehaviour Base']['0 PPtr<$GameObject> questTargetTrigger']['0 int m_FileID']) + file['0 MonoBehaviour Base']['0 PPtr<$GameObject> questTargetTrigger']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']
            return {
              name: lootTable['1 string m_Name']
            }
          })()
          : undefined
      }

      var filename = path.join(__dirname, 'Patch', folderName2, `${lootTable.from}.json`)
      if (fs.existsSync(filename)) {
        var file = JSON.parse(fs.readFileSync(filename, 'utf-8'))
        file.push(lootTable)
        fs.writeFileSync(filename, JSON.stringify(file, null, 2))
      } else fs.writeFileSync(filename, JSON.stringify([lootTable], null, 2))
      count++
      if (count === announceAtNextCount) {
        announceAtNextCount += 500
        console.log(folderName2, 'at', count, '...')
      }
    })
    console.log(folderName2, 'completed', 'at', count)
  }

  let folderName3 = 'Monster'
  if (folder[folderName3]) {
    fs.mkdirSync(path.join(__dirname, 'Patch', folderName3))
    var count = 0
    var announceAtNextCount = 500
    fs.readdirSync(folder[folderName3]).forEach(val => {
      var file = require(path.join(folder[folderName3], val))
      var monsterInfo = {
        name: file['0 MonoBehaviour Base']['1 string MonsterName'].length > 0
          ? translate[file['0 MonoBehaviour Base']['1 string MonsterName']] || file['0 MonoBehaviour Base']['1 string MonsterName'].replace(/[\/?<>\\:*|"]/g, '')
          : require(path.join(folder['Other'], fileMap(file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 int m_FileID']) + file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name'],
        alias: file['0 MonoBehaviour Base']['1 string MonsterName'].length > 0
          ? (translate[file['0 MonoBehaviour Base']['1 string MonsterName']] || file['0 MonoBehaviour Base']['1 string MonsterName']) === require(path.join(folder['Other'], fileMap(file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 int m_FileID']) + file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name']
            ? undefined
            : require(path.join(folder['Other'], fileMap(file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 int m_FileID']) + file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name']
          : undefined,
        description: translate[file['0 MonoBehaviour Base']['1 string MonsterDescription']] || file['0 MonoBehaviour Base']['1 string MonsterDescription'],
        isBoss: !!file['0 MonoBehaviour Base']['1 UInt8 IsBoss'],
        isElite: !!file['0 MonoBehaviour Base']['1 UInt8 IsElite'],
        isSetPieceMonster: !!file['0 MonoBehaviour Base']['1 UInt8 IsSetPieceMonster'],
        weapons: file['0 MonoBehaviour Base']['0 Array WeaponPrefabs'].map(v => {
          if (!fs.existsSync(path.join(folder['Other'], fileMap(v['0 PPtr<$GameObject> data']['0 int m_FileID']) + v['0 PPtr<$GameObject> data']['0 SInt64 m_PathID'] + '.json'))) return undefined
          var w = require(path.join(folder['Other'], fileMap(v['0 PPtr<$GameObject> data']['0 int m_FileID']) + v['0 PPtr<$GameObject> data']['0 SInt64 m_PathID'] + '.json'))
          if (w) return {
            name: w['0 GameObject Base']['1 string m_Name'],
            data: w['0 GameObject Base']['0 vector m_Component']['0 Array Array'].map(v => {
              if (!fs.existsSync(path.join(folder['Other'], fileMap(v['0 pair data']['0 PPtr<Component> second']['0 int m_FileID']) + v['0 pair data']['0 PPtr<Component> second']['0 SInt64 m_PathID'] + '.json'))) return undefined
              var f = require(path.join(folder['Other'], fileMap(v['0 pair data']['0 PPtr<Component> second']['0 int m_FileID']) + v['0 pair data']['0 PPtr<Component> second']['0 SInt64 m_PathID'] + '.json'))
              if (f['0 MonoBehaviour Base'] && f['0 MonoBehaviour Base']['1 string ProjectileName']) {
                return {
                  projectile: {
                    name: require(path.join(folder['Other'], fileMap(f['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 int m_FileID']) + f['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name'],
                    projectileName: f['0 MonoBehaviour Base']['1 string ProjectileName'],
                    speed: parseFloat(f['0 MonoBehaviour Base']['0 float Speed'].toFixed(2)),
                    acceleration: parseFloat(f['0 MonoBehaviour Base']['0 float Acceleration'].toFixed(2)) || undefined,
                    damage: f['0 MonoBehaviour Base']['0 int Damage'],
                    damageMultiplier: parseFloat(f['0 MonoBehaviour Base']['0 float DamageMultiplier'].toFixed(2)) || undefined,
                    essenceDamageMultiplier: parseFloat(f['0 MonoBehaviour Base']['0 float EssenceDamageMultiplier'].toFixed(2)) || undefined,
                    range: parseFloat(f['0 MonoBehaviour Base']['0 float Range'].toFixed(2)),
                    useTargetForRange: !!f['0 MonoBehaviour Base']['1 UInt8 UseTargetForRange'],
                    useRandomRange: !!f['0 MonoBehaviour Base']['1 UInt8 UseRandomRange'],
                    randomRangeMax: parseFloat(f['0 MonoBehaviour Base']['0 float RandomRangeMax'].toFixed(2)) || undefined,
                    maxHits: f['0 MonoBehaviour Base']['0 int MaxHits'],
                    arcSeparation: parseFloat(f['0 MonoBehaviour Base']['0 float ArcSeparation'].toFixed(2)) || undefined,
                    maxLifetime: parseFloat(f['0 MonoBehaviour Base']['0 float MaxLifetime'].toFixed(2)),
                    delayRate: parseFloat(f['0 MonoBehaviour Base']['0 float DelayRate'].toFixed(2)) || undefined,
                    rageMultiplier: f['0 MonoBehaviour Base']['0 float RageMultiplier'],
                    bounceBetweenEnemies: !!f['0 MonoBehaviour Base']['1 UInt8 BounceBetweenEnemies'],
                    pierceWorld: !!f['0 MonoBehaviour Base']['1 UInt8 PierceWorld'],
                    statusEffect: f['0 MonoBehaviour Base']['0 PPtr<$StatusEffect> statusEffect']['0 SInt64 m_PathID']
                      ? (function () {
                        var s = require(path.join(folder['Other'], fileMap(f['0 MonoBehaviour Base']['0 PPtr<$StatusEffect> statusEffect']['0 int m_FileID']) + f['0 MonoBehaviour Base']['0 PPtr<$StatusEffect> statusEffect']['0 SInt64 m_PathID'] + '.json'))
                        return {
                          name: s['0 MonoBehaviour Base']['1 string Name'],
                          type: Object.keys(statusEffectEnum).map(e => {
                            if (statusEffectEnum[e] === s['0 MonoBehaviour Base']['0 int Type']) return e
                            else return undefined
                          }).filter(Boolean).join(''),
                          duration: parseFloat(s['0 MonoBehaviour Base']['0 float Duration'].toFixed(2)),
                          stats: s['0 MonoBehaviour Base']['0 Array stat'].map(v => {
                            return {
                              key: Object.keys(statEnum).map(e => {
                                if (statEnum[e] === v['0 Deity.Shared.Stat data']['0 int key']) return e
                                else return undefined
                              }).filter(Boolean).join(''),
                              equation: v['0 Deity.Shared.Stat data']['1 string equation'],
                              value: parseFloat(v['0 Deity.Shared.Stat data']['0 float value'].toFixed(2))
                            }
                          }),
                          isBuff: !!s['0 MonoBehaviour Base']['1 UInt8 IsBuff'],
                          removeOnAttack: !!s['0 MonoBehaviour Base']['1 UInt8 RemoveOnAttack'],
                          coolDownTime: parseFloat(s['0 MonoBehaviour Base']['0 float CoolDownTime'].toFixed(2)),
                          floatingText: s['0 MonoBehaviour Base']['1 string floatingText'] || undefined,
                          noTimeOut: !!s['0 MonoBehaviour Base']['1 UInt8 NoTimeOut'],
                          screenFlashDuration: s['0 MonoBehaviour Base']['1 UInt8 fullscreenFlash'] ? parseFloat(s['0 MonoBehaviour Base']['0 float flashDuration'].toFixed(2)) : undefined
                        }
                      })()
                      : undefined,
                    color: {
                      r: parseFloat(f['0 MonoBehaviour Base']['0 ColorRGBA LightColor']['0 float r'].toFixed(2)),
                      g: parseFloat(f['0 MonoBehaviour Base']['0 ColorRGBA LightColor']['0 float g'].toFixed(2)),
                      b: parseFloat(f['0 MonoBehaviour Base']['0 ColorRGBA LightColor']['0 float b'].toFixed(2)),
                      a: parseFloat(f['0 MonoBehaviour Base']['0 ColorRGBA LightColor']['0 float a'].toFixed(2)),
                    }
                  }
                }
              } else if (f['0 SpriteRenderer Base'] && f['0 SpriteRenderer Base']['0 PPtr<Sprite> m_Sprite']['0 SInt64 m_PathID']) {
                var srd = require(path.join(folder['Other'], fileMap(f['0 SpriteRenderer Base']['0 PPtr<Sprite> m_Sprite']['0 int m_FileID']) + f['0 SpriteRenderer Base']['0 PPtr<Sprite> m_Sprite']['0 SInt64 m_PathID'] + '.json'))['0 Sprite Base']['1 SpriteRenderData m_RD']
                var s = require(path.join(folder['Other'], fileMap(srd['0 PPtr<Texture2D> texture']['0 int m_FileID']) + srd['0 PPtr<Texture2D> texture']['0 SInt64 m_PathID'] + '.json'))['0 Texture2D Base']
                return {
                  sprite: {
                    name: s['1 string m_Name'],
                    baseSize: {
                      width: s['0 int m_Width'],
                      height: s['0 int m_Height']
                    },
                    textureRectangle: {
                      x: parseFloat(srd['0 Rectf textureRect']['0 float x'].toFixed(0)),
                      y: parseFloat(srd['0 Rectf textureRect']['0 float y'].toFixed(0)),
                      width: parseFloat(srd['0 Rectf textureRect']['0 float width'].toFixed(0)),
                      height: parseFloat(srd['0 Rectf textureRect']['0 float height'].toFixed(0))
                    },
                    textureOffset: {
                      x: parseFloat(srd['0 Vector2f textureRectOffset']['0 float x'].toFixed(0)),
                      y: parseFloat(srd['0 Vector2f textureRectOffset']['0 float y'].toFixed(0))
                    },
                    color: {
                      r: parseFloat(f['0 SpriteRenderer Base']['1 ColorRGBA m_Color']['0 float r'].toFixed(2)),
                      g: parseFloat(f['0 SpriteRenderer Base']['1 ColorRGBA m_Color']['0 float g'].toFixed(2)),
                      b: parseFloat(f['0 SpriteRenderer Base']['1 ColorRGBA m_Color']['0 float b'].toFixed(2)),
                      a: parseFloat(f['0 SpriteRenderer Base']['1 ColorRGBA m_Color']['0 float a'].toFixed(2))
                    }
                  }
                }
              } else return undefined
            }).filter(Boolean)
          }
        }).filter(Boolean),
        data: require(path.join(folder['Other'], fileMap(file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 int m_FileID']) + file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['0 vector m_Component']['0 Array Array'].map(v => {
          if (fs.existsSync(path.join(folder['LootTable'], fileMap(v['0 pair data']['0 PPtr<Component> second']['0 int m_FileID']) + v['0 pair data']['0 PPtr<Component> second']['0 SInt64 m_PathID'] + '.json'))) {
            var f = require(path.join(folder['LootTable'], fileMap(v['0 pair data']['0 PPtr<Component> second']['0 int m_FileID']) + v['0 pair data']['0 PPtr<Component> second']['0 SInt64 m_PathID'] + '.json'))
            if (f['0 MonoBehaviour Base'] && (f['0 MonoBehaviour Base']['0 Array lootTable'].length > 0 || f['0 MonoBehaviour Base']['0 PPtr<$LootTable> ReferenceObject']['0 SInt64 m_PathID'] > 0)) {
              return {
                loot: {
                  lootTable: {
                    name: require(path.join(folder['Other'], fileMap(f['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 int m_FileID']) + f['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name']
                  },
                  // ...f['0 MonoBehaviour Base']['0 Array lootTable'].length > 0 ? {
                  // guaranteeItemCount: f['0 MonoBehaviour Base']['0 int guaranteeItemCount'],
                  // maximumItemCount: f['0 MonoBehaviour Base']['0 int maximumItemCount'],
                  // lootTable: f['0 MonoBehaviour Base']['0 Array lootTable'].map(v => {
                  //   return {
                  //     item: translate[require(path.join(folder['ItemDefinition'], fileMap(v['0 Deity.Shared.LootEntry data']['0 PPtr<$ItemDefinition> item']['0 int m_FileID']) + v['0 Deity.Shared.LootEntry data']['0 PPtr<$ItemDefinition> item']['0 SInt64 m_PathID'] + '.json'))['0 MonoBehaviour Base']['1 string Name']] || require(path.join(folder['ItemDefinition'], fileMap(v['0 Deity.Shared.LootEntry data']['0 PPtr<$ItemDefinition> item']['0 int m_FileID']) + v['0 Deity.Shared.LootEntry data']['0 PPtr<$ItemDefinition> item']['0 SInt64 m_PathID'] + '.json'))['0 MonoBehaviour Base']['1 string Name'],
                  //     count: {
                  //       dice: v['0 Deity.Shared.LootEntry data']['0 Deity.Shared.DiceParm count']['0 int dice'],
                  //       faces: v['0 Deity.Shared.LootEntry data']['0 Deity.Shared.DiceParm count']['0 int faces'],
                  //       add: v['0 Deity.Shared.LootEntry data']['0 Deity.Shared.DiceParm count']['0 int add']
                  //     },
                  //     chance: v['0 Deity.Shared.LootEntry data']['0 double chance'],
                  //     allowModifiers: !!v['0 Deity.Shared.LootEntry data']['1 UInt8 allowModifiers']
                  //   }
                  // })
                  // } : undefined
                }
              }
            }
          }
          if (!fs.existsSync(path.join(folder['Other'], fileMap(v['0 pair data']['0 PPtr<Component> second']['0 int m_FileID']) + v['0 pair data']['0 PPtr<Component> second']['0 SInt64 m_PathID'] + '.json'))) return undefined
          var f = require(path.join(folder['Other'], fileMap(v['0 pair data']['0 PPtr<Component> second']['0 int m_FileID']) + v['0 pair data']['0 PPtr<Component> second']['0 SInt64 m_PathID'] + '.json'))
          if (f['0 MonoBehaviour Base'] && typeof f['0 MonoBehaviour Base']['0 int netObjectType'] === 'number') return undefined
          else if (f['0 MonoBehaviour Base'] && f['0 MonoBehaviour Base']['0 Array stat'] && f['0 MonoBehaviour Base']['0 Array stat'].length > 0) {
            return {
              stats: f['0 MonoBehaviour Base']['0 Array stat'].map(v => {
                return {
                  key: Object.keys(statEnum).map(e => {
                    if (statEnum[e] === v['0 Deity.Shared.Stat data']['0 int key']) return e
                    else return undefined
                  }).filter(Boolean).join(''),
                  equation: v['0 Deity.Shared.Stat data']['1 string equation'],
                  value: parseFloat(v['0 Deity.Shared.Stat data']['0 float value'].toFixed(2))
                }
              })
            }
          } else if (f['0 MonoBehaviour Base'] && f['0 MonoBehaviour Base']['0 Deity.Shared.CollisionShape shape']) {
            return {
              bPlayerProjectile: !!f['0 MonoBehaviour Base']['1 UInt8 bPlayerProjectile'] || undefined,
              bEnemyProjectile: !!f['0 MonoBehaviour Base']['1 UInt8 bEnemyProjectile'] || undefined,
              bSlide: !!f['0 MonoBehaviour Base']['1 UInt8 bSlide'] || undefined,
              bPlayer: !!f['0 MonoBehaviour Base']['1 UInt8 bPlayer'] || undefined,
              bEnemy: !!f['0 MonoBehaviour Base']['1 UInt8 bEnemy'] || undefined,
              bSkipWorld: !!f['0 MonoBehaviour Base']['1 UInt8 bSkipWorld'] || undefined,
              bSlowedDownByWater: !!f['0 MonoBehaviour Base']['1 UInt8 bSlowedDownByWater'] || undefined,
              bBlockedByLava: !!f['0 MonoBehaviour Base']['1 UInt8 bBlockedByLava'] || undefined,
              bFlying: !!f['0 MonoBehaviour Base']['1 UInt8 bFlying'] || undefined
            }
          } else if (f['0 SpriteRenderer Base'] && f['0 SpriteRenderer Base']['0 PPtr<Sprite> m_Sprite']['0 SInt64 m_PathID']) {
            var srd = require(path.join(folder['Other'], fileMap(f['0 SpriteRenderer Base']['0 PPtr<Sprite> m_Sprite']['0 int m_FileID']) + f['0 SpriteRenderer Base']['0 PPtr<Sprite> m_Sprite']['0 SInt64 m_PathID'] + '.json'))['0 Sprite Base']['1 SpriteRenderData m_RD']
            var s = require(path.join(folder['Other'], fileMap(srd['0 PPtr<Texture2D> texture']['0 int m_FileID']) + srd['0 PPtr<Texture2D> texture']['0 SInt64 m_PathID'] + '.json'))['0 Texture2D Base']
            return {
              sprite: {
                name: s['1 string m_Name'],
                baseSize: {
                  width: s['0 int m_Width'],
                  height: s['0 int m_Height']
                },
                textureRectangle: {
                  x: parseFloat(srd['0 Rectf textureRect']['0 float x'].toFixed(0)),
                  y: parseFloat(srd['0 Rectf textureRect']['0 float y'].toFixed(0)),
                  width: parseFloat(srd['0 Rectf textureRect']['0 float width'].toFixed(0)),
                  height: parseFloat(srd['0 Rectf textureRect']['0 float height'].toFixed(0))
                },
                textureOffset: {
                  x: parseFloat(srd['0 Vector2f textureRectOffset']['0 float x'].toFixed(0)),
                  y: parseFloat(srd['0 Vector2f textureRectOffset']['0 float y'].toFixed(0))
                },
                color: {
                  r: parseFloat(f['0 SpriteRenderer Base']['1 ColorRGBA m_Color']['0 float r'].toFixed(2)),
                  g: parseFloat(f['0 SpriteRenderer Base']['1 ColorRGBA m_Color']['0 float g'].toFixed(2)),
                  b: parseFloat(f['0 SpriteRenderer Base']['1 ColorRGBA m_Color']['0 float b'].toFixed(2)),
                  a: parseFloat(f['0 SpriteRenderer Base']['1 ColorRGBA m_Color']['0 float a'].toFixed(2))
                }
              }
            }
          } else if (f['0 MonoBehaviour Base'] && f['0 MonoBehaviour Base']['0 Array snds'] && f['0 MonoBehaviour Base']['0 Array snds'].length > 0) {
            return {
              sound: {
                soundType: Object.keys(soundListEnum).map(e => {
                  if (soundListEnum[e] === f['0 MonoBehaviour Base']['0 int soundListType']) return e
                  else return undefined
                }).filter(Boolean).join(''),
                sounds: f['0 MonoBehaviour Base']['0 Array snds'].map(v => {
                  return v['1 string data']
                }),
              }
            }
          } else if (f['0 MonoBehaviour Base'] && f['0 MonoBehaviour Base']['0 Array healthDialogue'] && f['0 MonoBehaviour Base']['0 Array healthDialogue'].length > 0) {
            return {
              healthDialogue: f['0 MonoBehaviour Base']['0 Array healthDialogue'].map(v => {
                return {
                  healthPercentage: parseFloat(v['0 Deity.HealthDialogue data']['0 float percentage'].toFixed(2)),
                  message: translate[v['0 Deity.HealthDialogue data']['1 string dialogue']] || v['0 Deity.HealthDialogue data']['1 string dialogue']
                }
              })
            }
          } else if (f['0 MonoBehaviour Base'] && f['0 MonoBehaviour Base']['0 Array dialogue'] && f['0 MonoBehaviour Base']['0 Array dialogue'].length > 0) {
            return {
              dialogue: f['0 MonoBehaviour Base']['0 Array dialogue'].map(v => {
                var d = require(path.join(folder['Other'], fileMap(v['0 PPtr<$AudioMessage> data']['0 int m_FileID']) + v['0 PPtr<$AudioMessage> data']['0 SInt64 m_PathID'] + '.json'))['0 MonoBehaviour Base']
                return {
                  name: require(path.join(folder['Other'], fileMap(d['0 PPtr<GameObject> m_GameObject']['0 int m_FileID']) + d['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name'],
                  message: translate[d['1 string message']] || d['1 string message']
                }
              })
            }
          } else if (f['0 MonoBehaviour Base'] && f['0 MonoBehaviour Base']['0 Array lootTable'] && (f['0 MonoBehaviour Base']['0 Array lootTable'].length > 0 || f['0 MonoBehaviour Base']['0 PPtr<$LootTable> ReferenceObject']['0 SInt64 m_PathID'] > 0)) {
            return {
              loot: {
                inheritedLootTable: f['0 MonoBehaviour Base']['0 PPtr<$LootTable> ReferenceObject']['0 SInt64 m_PathID'] > 0
                  ? (function () {
                    var lootTable = require(path.join(folder['LootTable'], fileMap(f['0 MonoBehaviour Base']['0 PPtr<$LootTable> ReferenceObject']['0 int m_FileID']) + f['0 MonoBehaviour Base']['0 PPtr<$LootTable> ReferenceObject']['0 SInt64 m_PathID'] + '.json'))
                    return {
                      name: require(path.join(folder['Other'], fileMap(lootTable['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 int m_FileID']) + lootTable['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name']
                    }
                  })()
                  : undefined,
                ...f['0 MonoBehaviour Base']['0 Array lootTable'].length > 0 ? {
                  guaranteeItemCount: f['0 MonoBehaviour Base']['0 int guaranteeItemCount'],
                  maximumItemCount: f['0 MonoBehaviour Base']['0 int maximumItemCount'],
                  lootTable: f['0 MonoBehaviour Base']['0 Array lootTable'].map(v => {
                    return {
                      item: translate[require(path.join(folder['ItemDefinition'], fileMap(v['0 Deity.Shared.LootEntry data']['0 PPtr<$ItemDefinition> item']['0 int m_FileID']) + v['0 Deity.Shared.LootEntry data']['0 PPtr<$ItemDefinition> item']['0 SInt64 m_PathID'] + '.json'))['0 MonoBehaviour Base']['1 string Name']] || require(path.join(folder['ItemDefinition'], fileMap(v['0 Deity.Shared.LootEntry data']['0 PPtr<$ItemDefinition> item']['0 int m_FileID']) + v['0 Deity.Shared.LootEntry data']['0 PPtr<$ItemDefinition> item']['0 SInt64 m_PathID'] + '.json'))['0 MonoBehaviour Base']['1 string Name'],
                      count: {
                        dice: v['0 Deity.Shared.LootEntry data']['0 Deity.Shared.DiceParm count']['0 int dice'],
                        faces: v['0 Deity.Shared.LootEntry data']['0 Deity.Shared.DiceParm count']['0 int faces'],
                        add: v['0 Deity.Shared.LootEntry data']['0 Deity.Shared.DiceParm count']['0 int add']
                      },
                      chance: v['0 Deity.Shared.LootEntry data']['0 double chance'],
                      allowModifiers: !!v['0 Deity.Shared.LootEntry data']['1 UInt8 allowModifiers']
                    }
                  })
                }
                  : undefined,
                questLootTable: f['0 MonoBehaviour Base']['0 PPtr<$GameObject> questTargetTrigger'] && f['0 MonoBehaviour Base']['0 PPtr<$GameObject> questTargetTrigger']['0 SInt64 m_PathID'] > 0
                  ? (function () {
                    var lootTable = require(path.join(folder['Other'], fileMap(f['0 MonoBehaviour Base']['0 PPtr<$GameObject> questTargetTrigger']['0 int m_FileID']) + f['0 MonoBehaviour Base']['0 PPtr<$GameObject> questTargetTrigger']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']
                    return {
                      name: lootTable['1 string m_Name']
                    }
                  })()
                  : undefined
              }
            }
          } else return undefined
        }).filter(Boolean),
        zenithEffects: file['0 MonoBehaviour Base']['0 Array ZenithEffects'].map(v => {
          var z = require(path.join(folder['Other'], fileMap(v['0 PPtr<$StatusEffect> data']['0 int m_FileID']) + v['0 PPtr<$StatusEffect> data']['0 SInt64 m_PathID'] + '.json'))
          return {
            name: z['0 MonoBehaviour Base']['1 string Name'],
            type: Object.keys(statusEffectEnum).map(e => {
              if (statusEffectEnum[e] === z['0 MonoBehaviour Base']['0 int Type']) return e
              else return undefined
            }).filter(Boolean).join(''),
            duration: parseFloat(z['0 MonoBehaviour Base']['0 float Duration'].toFixed(2)),
            stats: z['0 MonoBehaviour Base']['0 Array stat'].map(v => {
              return {
                key: Object.keys(statEnum).map(e => {
                  if (statEnum[e] === v['0 Deity.Shared.Stat data']['0 int key']) return e
                  else return undefined
                }).filter(Boolean).join(''),
                equation: v['0 Deity.Shared.Stat data']['1 string equation'],
                value: parseFloat(v['0 Deity.Shared.Stat data']['0 float value'].toFixed(2))
              }
            }),
            isBuff: !!z['0 MonoBehaviour Base']['1 UInt8 IsBuff'],
            isZenith: !!z['0 MonoBehaviour Base']['1 UInt8 IsZenith'],
            removeOnAttack: !!z['0 MonoBehaviour Base']['1 UInt8 RemoveOnAttack'],
            floatingText: z['0 MonoBehaviour Base']['1 string floatingText'] || undefined,
            noTimeOut: !!z['0 MonoBehaviour Base']['1 UInt8 NoTimeOut'],
            coolDownTime: parseFloat(z['0 MonoBehaviour Base']['0 float CoolDownTime'].toFixed(2)),
            isAccountWide: z['0 MonoBehaviour Base']['1 UInt8 IsAccountWide'],
            screenFlashDuration: z['0 MonoBehaviour Base']['1 UInt8 fullscreenFlash'] ? parseFloat(z['0 MonoBehaviour Base']['0 float flashDuration'].toFixed(2)) : undefined
          }
        }),
        category: Object.keys(categoryEnum).map(e => {
          if (categoryEnum[e] === file['0 MonoBehaviour Base']['0 int Category']) return e
          else return undefined
        }).filter(Boolean).join(''),
        element: Object.keys(elementEnum).map(e => {
          if (elementEnum[e] === file['0 MonoBehaviour Base']['0 int Element']) return e
          else return undefined
        }).filter(Boolean).join('')
      }
      var filename = path.join(__dirname, 'Patch', folderName3, `${monsterInfo.name}.json`)
      if (fs.existsSync(filename)) {
        var file = JSON.parse(fs.readFileSync(filename, 'utf-8'))
        file.push(monsterInfo)
        fs.writeFileSync(filename, JSON.stringify(file, null, 2))
      } else fs.writeFileSync(filename, JSON.stringify([monsterInfo], null, 2))
      count++
      if (count === announceAtNextCount) {
        announceAtNextCount += 500
        console.log(folderName3, 'at', count, '...')
      }
    })
    console.log(folderName3, 'completed', 'at', count)
  }

  let folderName4 = 'Ancestral'
  if (folder[folderName4]) {
    fs.mkdirSync(path.join(__dirname, 'Patch', folderName4))
    var count = 0
    var announceAtNextCount = 500
    fs.readdirSync(folder[folderName4]).forEach(val => {
      var file = require(path.join(folder[folderName4], val))
      var ancestral = {
        name: translate[file['0 MonoBehaviour Base']['1 string displayName']] || file['0 MonoBehaviour Base']['1 string displayName'].replace(/[\/?<>\\:*|"]/g, ''),
        alias: require(path.join(folder['Other'], fileMap(file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 int m_FileID']) + file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name'],
        description: translate[file['0 MonoBehaviour Base']['1 string benefitDescription']],
        doNotAward: file['0 MonoBehaviour Base']['1 UInt8 DoNotAward'] > 0 ? true : false,
        data: file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID']
          ? require(path.join(folder['Other'], fileMap(file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 int m_FileID']) + file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['0 vector m_Component']['0 Array Array'].map(v => {
            if (!fs.existsSync(path.join(folder['Other'], fileMap(v['0 pair data']['0 PPtr<Component> second']['0 int m_FileID']) + v['0 pair data']['0 PPtr<Component> second']['0 SInt64 m_PathID'] + '.json'))) return undefined
            var f = require(path.join(folder['Other'], fileMap(v['0 pair data']['0 PPtr<Component> second']['0 int m_FileID']) + v['0 pair data']['0 PPtr<Component> second']['0 SInt64 m_PathID'] + '.json'))
            if (f['0 MonoBehaviour Base'] && f['0 MonoBehaviour Base']['0 Array triggers']) {
              return {
                proc: {
                  name: translate[f['0 MonoBehaviour Base']['1 string m_Name']] || require(path.join(folder['Other'], fileMap(f['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 int m_FileID']) + f['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name'],
                  description: translate[f['0 MonoBehaviour Base']['1 string Description']] || f['0 MonoBehaviour Base']['1 string Description'],
                  counterMax: f['0 MonoBehaviour Base']['0 int CounterMax'],
                  timerValue: parseFloat(f['0 MonoBehaviour Base']['0 float TimerValue'].toFixed(2)),
                  statusEffect: f['0 MonoBehaviour Base']['0 PPtr<$StatusEffect> StatusEffect']['0 SInt64 m_PathID']
                    ? (function () {
                      var s = require(path.join(folder['Other'], fileMap(f['0 MonoBehaviour Base']['0 PPtr<$StatusEffect> StatusEffect']['0 int m_FileID']) + f['0 MonoBehaviour Base']['0 PPtr<$StatusEffect> StatusEffect']['0 SInt64 m_PathID'] + '.json'))
                      return {
                        name: s['0 MonoBehaviour Base']['1 string Name'],
                        type: Object.keys(statusEffectEnum).map(e => {
                          if (statusEffectEnum[e] === s['0 MonoBehaviour Base']['0 int Type']) return e
                          else return undefined
                        }).filter(Boolean).join(''),
                        duration: parseFloat(s['0 MonoBehaviour Base']['0 float Duration'].toFixed(2)),
                        stats: s['0 MonoBehaviour Base']['0 Array stat'].map(v => {
                          return {
                            key: Object.keys(statEnum).map(e => {
                              if (statEnum[e] === v['0 Deity.Shared.Stat data']['0 int key']) return e
                              else return undefined
                            }).filter(Boolean).join(''),
                            equation: v['0 Deity.Shared.Stat data']['1 string equation'],
                            value: parseFloat(v['0 Deity.Shared.Stat data']['0 float value'].toFixed(2))
                          }
                        }),
                        isBuff: !!s['0 MonoBehaviour Base']['1 UInt8 IsBuff'],
                        removeOnAttack: !!s['0 MonoBehaviour Base']['1 UInt8 RemoveOnAttack'],
                        coolDownTime: parseFloat(s['0 MonoBehaviour Base']['0 float CoolDownTime'].toFixed(2)),
                        floatingText: s['0 MonoBehaviour Base']['1 string floatingText'] || undefined,
                        noTimeOut: !!s['0 MonoBehaviour Base']['1 UInt8 NoTimeOut'],
                        screenFlashDuration: s['0 MonoBehaviour Base']['1 UInt8 fullscreenFlash'] ? parseFloat(s['0 MonoBehaviour Base']['0 float flashDuration'].toFixed(2)) : undefined
                      }
                    })()
                    : undefined,
                  projectileDamageMultiplier: parseFloat(f['0 MonoBehaviour Base']['0 float ProjectileDamageMultiplier'].toFixed(2)),
                  useAncestralBenefitForDamage: !!f['0 MonoBehaviour Base']['0 UInt8 UseAncestralBenefitForDamage'],
                  triggers: f['0 MonoBehaviour Base']['0 Array triggers'].length > 0
                    ? f['0 MonoBehaviour Base']['0 Array triggers'].map(v => {
                      return {
                        trigger: Object.keys(procTriggerEnum).map(e => {
                          if (procTriggerEnum[e] === v['0 Deity.Shared.ProcTrigger data']['0 int trigger']) return e
                          else return undefined
                        }).filter(Boolean).join(''),
                        chance: parseFloat(v['0 Deity.Shared.ProcTrigger data']['0 double chance'].toFixed(2)),
                        chanceSource: Object.keys(procTriggerChanceSourceEnum).map(e => {
                          if (procTriggerChanceSourceEnum[e] === v['0 Deity.Shared.ProcTrigger data']['0 int chanceSource']) return e
                          else return undefined
                        }).filter(Boolean).join(''),
                        action: Object.keys(procTriggerActionEnum).map(e => {
                          if (procTriggerActionEnum[e] === v['0 Deity.Shared.ProcTrigger data']['0 int action']) return e
                          else return undefined
                        }).filter(Boolean).join('')
                      }
                    })
                    : undefined
                }
              }
            } else return undefined
          }).filter(Boolean)
          : undefined,
        validClasses: Object.keys(classEnum).map(e => {
          if (e !== 'None' && classEnum[e] === file['0 MonoBehaviour Base']['0 int validArchetypes']) return e
          else if (e !== 'None' && hasFlag(file['0 MonoBehaviour Base']['0 int validArchetypes'], classEnum[e])) return e
          else return undefined
        }).filter(Boolean),
        rarity: Object.keys(ancestralRarityEnum).map(e => {
          if (ancestralRarityEnum[e] === file['0 MonoBehaviour Base']['0 int rarity']) return e
          else return undefined
        }).filter(Boolean).join(''),
        stats: file['0 MonoBehaviour Base']['0 Array stat'].map(v => {
          return {
            key: Object.keys(statEnum).map(e => {
              if (statEnum[e] === v['0 Deity.Shared.Stat data']['0 int key']) return e
              else return undefined
            }).filter(Boolean).join(''),
            equation: v['0 Deity.Shared.Stat data']['1 string equation'],
            value: parseFloat(v['0 Deity.Shared.Stat data']['0 float value'].toFixed(2))
          }
        }),
        ordinaries: file['0 MonoBehaviour Base']['0 Array ordinaries'].length > 0
          ? file['0 MonoBehaviour Base']['0 Array ordinaries'].map(v => {
            if (!fs.existsSync(path.join(folder['Other'], fileMap(v['0 PPtr<$Sprite> data']['0 int m_FileID']) + v['0 PPtr<$Sprite> data']['0 SInt64 m_PathID']) + '.json')) return undefined
            var f = require(path.join(folder['Other'], fileMap(v['0 PPtr<$Sprite> data']['0 int m_FileID']) + v['0 PPtr<$Sprite> data']['0 SInt64 m_PathID']) + '.json')
            if (f['0 Sprite Base'] && f['0 Sprite Base']['1 SpriteRenderData m_RD']['0 PPtr<Texture2D> texture']['0 SInt64 m_PathID']) {
              var s = require(path.join(folder['Other'], fileMap(f['0 Sprite Base']['1 SpriteRenderData m_RD']['0 PPtr<Texture2D> texture']['0 int m_FileID']) + f['0 Sprite Base']['1 SpriteRenderData m_RD']['0 PPtr<Texture2D> texture']['0 SInt64 m_PathID'] + '.json'))['0 Texture2D Base']
              return {
                sprite: {
                  name: s['1 string m_Name'],
                  baseSize: {
                    width: s['0 int m_Width'],
                    height: s['0 int m_Height']
                  },
                  textureRectangle: {
                    x: parseFloat(f['0 Sprite Base']['1 SpriteRenderData m_RD']['0 Rectf textureRect']['0 float x'].toFixed(0)),
                    y: parseFloat(f['0 Sprite Base']['1 SpriteRenderData m_RD']['0 Rectf textureRect']['0 float y'].toFixed(0)),
                    width: parseFloat(f['0 Sprite Base']['1 SpriteRenderData m_RD']['0 Rectf textureRect']['0 float width'].toFixed(0)),
                    height: parseFloat(f['0 Sprite Base']['1 SpriteRenderData m_RD']['0 Rectf textureRect']['0 float height'].toFixed(0))
                  },
                  textureOffset: {
                    x: parseFloat(f['0 Sprite Base']['1 SpriteRenderData m_RD']['0 Vector2f textureRectOffset']['0 float x'].toFixed(0)),
                    y: parseFloat(f['0 Sprite Base']['1 SpriteRenderData m_RD']['0 Vector2f textureRectOffset']['0 float y'].toFixed(0))
                  }
                }
              }
            } else return undefined
          }).filter(Boolean)
          : undefined,
        sets: file['0 MonoBehaviour Base']['0 Array sets'].length > 0
          ? file['0 MonoBehaviour Base']['0 Array sets'].map(v => {
            if (!fs.existsSync(path.join(folder['Other'], fileMap(v['0 PPtr<$AncestralSet> data']['0 int m_FileID']) + v['0 PPtr<$AncestralSet> data']['0 SInt64 m_PathID'] + '.json'))) return undefined
            var f = require(path.join(folder['Other'], fileMap(v['0 PPtr<$AncestralSet> data']['0 int m_FileID']) + v['0 PPtr<$AncestralSet> data']['0 SInt64 m_PathID'] + '.json'))
            if (f['0 MonoBehaviour Base'] && f['0 MonoBehaviour Base']['0 Array setBonuses']) {
              var filename = path.join(__dirname, 'Patch', folderName4, 'Set bonuses', `${translate[f['0 MonoBehaviour Base']['1 string setName']] || f['0 MonoBehaviour Base']['1 string setName']}.json`)
              var setBonus = {
                name: translate[f['0 MonoBehaviour Base']['1 string setName']] || f['0 MonoBehaviour Base']['1 string setName'],
                alias: require(path.join(folder['Other'], fileMap(f['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 int m_FileID']) + f['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name'],
                setBonuses: f['0 MonoBehaviour Base']['0 Array setBonuses'].length > 0
                  ? f['0 MonoBehaviour Base']['0 Array setBonuses'].map(v => {
                    var f = require(path.join(folder['Other'], fileMap(v['0 PPtr<$AncestralSetBonus> data']['0 int m_FileID']) + v['0 PPtr<$AncestralSetBonus> data']['0 SInt64 m_PathID'] + '.json'))
                    return {
                      name: require(path.join(folder['Other'], fileMap(f['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 int m_FileID']) + f['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name'],
                      description: translate[f['0 MonoBehaviour Base']['1 string bonusText']] || f['0 MonoBehaviour Base']['1 string bonusText'],
                      requiredAmount: f['0 MonoBehaviour Base']['0 int requiredAmount'],
                      stats: f['0 MonoBehaviour Base']['0 Array stat'].map(v => {
                        return {
                          key: Object.keys(statEnum).map(e => {
                            if (statEnum[e] === v['0 Deity.Shared.Stat data']['0 int key']) return e
                            else return undefined
                          }).filter(Boolean).join(''),
                          equation: v['0 Deity.Shared.Stat data']['1 string equation'],
                          value: parseFloat(v['0 Deity.Shared.Stat data']['0 float value'].toFixed(2))
                        }
                      })
                    }
                  })
                  : undefined,
                sprite: (function () {
                  if (!fs.existsSync(path.join(folder['Other'], fileMap(f['0 MonoBehaviour Base']['0 PPtr<$Sprite> icon']['0 int m_FileID']) + f['0 MonoBehaviour Base']['0 PPtr<$Sprite> icon']['0 SInt64 m_PathID']) + '.json')) return undefined
                  var s = require(path.join(folder['Other'], fileMap(f['0 MonoBehaviour Base']['0 PPtr<$Sprite> icon']['0 int m_FileID']) + f['0 MonoBehaviour Base']['0 PPtr<$Sprite> icon']['0 SInt64 m_PathID']) + '.json')
                  if (s['0 Sprite Base'] && s['0 Sprite Base']['1 SpriteRenderData m_RD']['0 PPtr<Texture2D> texture']['0 SInt64 m_PathID']) {
                    var srd = require(path.join(folder['Other'], fileMap(s['0 Sprite Base']['1 SpriteRenderData m_RD']['0 PPtr<Texture2D> texture']['0 int m_FileID']) + s['0 Sprite Base']['1 SpriteRenderData m_RD']['0 PPtr<Texture2D> texture']['0 SInt64 m_PathID'] + '.json'))['0 Texture2D Base']
                    return {
                      name: srd['1 string m_Name'],
                      baseSize: {
                        width: srd['0 int m_Width'],
                        height: srd['0 int m_Height']
                      },
                      textureRectangle: {
                        x: parseFloat(s['0 Sprite Base']['1 SpriteRenderData m_RD']['0 Rectf textureRect']['0 float x'].toFixed(0)),
                        y: parseFloat(s['0 Sprite Base']['1 SpriteRenderData m_RD']['0 Rectf textureRect']['0 float y'].toFixed(0)),
                        width: parseFloat(s['0 Sprite Base']['1 SpriteRenderData m_RD']['0 Rectf textureRect']['0 float width'].toFixed(0)),
                        height: parseFloat(s['0 Sprite Base']['1 SpriteRenderData m_RD']['0 Rectf textureRect']['0 float height'].toFixed(0))
                      },
                      textureOffset: {
                        x: parseFloat(s['0 Sprite Base']['1 SpriteRenderData m_RD']['0 Vector2f textureRectOffset']['0 float x'].toFixed(0)),
                        y: parseFloat(s['0 Sprite Base']['1 SpriteRenderData m_RD']['0 Vector2f textureRectOffset']['0 float y'].toFixed(0))
                      }
                    }
                  } else return undefined
                })()
              }
              if (!fs.existsSync(path.join(__dirname, 'Patch', folderName4, 'Set bonuses'))) fs.mkdirSync(path.join(__dirname, 'Patch', folderName4, 'Set bonuses'))
              if (!fs.existsSync(filename)) {
                fs.writeFileSync(filename, JSON.stringify(setBonus, null, 2))
              }
              return {
                name: setBonus.name,
                alias: setBonus.alias,
                sprite: setBonus.sprite ? setBonus.sprite.name : undefined
              }
            } else return undefined
          }).filter(Boolean)
          : undefined,
        blockedBy: file['0 MonoBehaviour Base']['0 Array BlockedBy'].length > 0
          ? file['0 MonoBehaviour Base']['0 Array BlockedBy'].map(v => {
            return require(path.join(folder['Other'], fileMap(v['0 PPtr<$GameObject> data']['0 int m_FileID']) + v['0 PPtr<$GameObject> data']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name']
          })
          : undefined
      }

      var filename = path.join(__dirname, 'Patch', folderName4, `${ancestral.name}.json`)
      if (fs.existsSync(filename)) {
        var file = JSON.parse(fs.readFileSync(filename, 'utf-8'))
        file.push(ancestral)
        fs.writeFileSync(filename, JSON.stringify(file, null, 2))
      } else fs.writeFileSync(filename, JSON.stringify([ancestral], null, 2))
      count++
      if (count === announceAtNextCount) {
        announceAtNextCount += 500
        console.log(folderName4, 'at', count, '...')
      }
    })
    console.log(folderName4, 'completed', 'at', count)
  }

  let folderName5 = 'CraftingRecipe'
  if (folder[folderName5]) {
    fs.mkdirSync(path.join(__dirname, 'Patch', folderName5))
    var count = 0
    var announceAtNextCount = 500
    fs.readdirSync(folder[folderName5]).forEach(val => {
      var file = require(path.join(folder[folderName5], val))
      var gameObject = require(path.join(folder['Other'], fileMap(file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 int m_FileID']) + file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']
      var craftingRecipe = {
        name: gameObject['1 string m_Name'].split('_').pop(),
        interpretedType: gameObject['1 string m_Name'].split('_')[1],
        actualName: gameObject['1 string m_Name'],
        craftingTime: parseFloat(file['0 MonoBehaviour Base']['0 float CraftingTime'].toFixed(2)),
        leveledRecipes: file['0 MonoBehaviour Base']['0 Array LeveledRecipes'].map(v => {
          return {
            level: v['0 Deity.Shared.Recipe data']['0 int Level'],
            craftingTime: parseFloat(v['0 Deity.Shared.Recipe data']['0 float CraftingTime'].toFixed(2)),
            requiredItems: v['0 Deity.Shared.Recipe data']['0 Array RequiredItems'].map(v => {
              if (!fs.existsSync(path.join(folder['ItemDefinition'], fileMap(v['0 Deity.Shared.CraftRecipeItem data']['0 PPtr<$ItemDefinition> item']['0 int m_FileID']) + v['0 Deity.Shared.CraftRecipeItem data']['0 PPtr<$ItemDefinition> item']['0 SInt64 m_PathID'] + '.json'))) return undefined
              var f = require(path.join(folder['ItemDefinition'], fileMap(v['0 Deity.Shared.CraftRecipeItem data']['0 PPtr<$ItemDefinition> item']['0 int m_FileID']) + v['0 Deity.Shared.CraftRecipeItem data']['0 PPtr<$ItemDefinition> item']['0 SInt64 m_PathID'] + '.json'))
              return {
                name: translate[f['0 MonoBehaviour Base']['1 string Name']] || f['0 MonoBehaviour Base']['1 string Name'],
                count: v['0 Deity.Shared.CraftRecipeItem data']['0 unsigned int count'],
                requiredLevel: v['0 Deity.Shared.CraftRecipeItem data']['0 unsigned int requiredLevel']
              }
            }).filter(Boolean),
            craftCost: v['0 Deity.Shared.Recipe data']['0 int CraftCost'],
            craftNowCost: v['0 Deity.Shared.Recipe data']['0 int CraftNowCost'],
            craftingStat: Object.keys(statEnum).map(e => {
              if (statEnum[e] === v['0 Deity.Shared.Recipe data']['CraftingStat']) return e
              else return undefined
            }).filter(Boolean).join('')
          }
        }),
        craftCost: file['0 MonoBehaviour Base']['0 int CraftCost'],
        craftNowCost: file['0 MonoBehaviour Base']['0 int CraftNowCost'],
        craftingStat: Object.keys(statEnum).map(e => {
          if (statEnum[e] === file['0 MonoBehaviour Base']['0 int CraftingStat']) return e
          else return undefined
        }).filter(Boolean).join(''),
        craftingCategory: Object.keys(craftingCategoryEnum).map(e => {
          if (craftingCategoryEnum[e] === file['0 MonoBehaviour Base']['0 int craftingCategory']) return e
          else return undefined
        }).filter(Boolean).join('')
      }

      var filename = path.join(__dirname, 'Patch', folderName5, `${craftingRecipe.name}.json`)
      if (fs.existsSync(filename)) {
        var file = JSON.parse(fs.readFileSync(filename, 'utf-8'))
        file.push(craftingRecipe)
        fs.writeFileSync(filename, JSON.stringify(file, null, 2))
      } else fs.writeFileSync(filename, JSON.stringify([craftingRecipe], null, 2))
      count++
      if (count === announceAtNextCount) {
        announceAtNextCount += 500
        console.log(folderName5, 'at', count, '...')
      }
    })
    console.log(folderName5, 'completed', 'at', count)
  }

  let folderName6 = 'ItemModifier'
  if (folder[folderName6]) {
    fs.mkdirSync(path.join(__dirname, 'Patch', folderName6))
    var count = 0
    var announceAtNextCount = 500
    fs.readdirSync(folder[folderName6]).forEach(val => {
      var file = require(path.join(folder[folderName6], val))
      var itemModifier = {
        name: require(path.join(folder['Other'], fileMap(file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 int m_FileID']) + file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name'],
        alias: '',
        description: '',
        category: Object.keys(itemModifierCategoryEnum).map(e => {
          if (itemModifierCategoryEnum[e] === file['0 MonoBehaviour Base']['0 int category']) return e
          else return undefined
        }).filter(Boolean).join(''),
        data: (function () {
          if (file['0 MonoBehaviour Base']['0 Array availableModifiers'].length < 1) return undefined
          var dataObj = []
          for (let i = 0; i < file['0 MonoBehaviour Base']['0 Array availableModifiers'].length; i++) {
            var f = require(path.join(folder['Other'], fileMap(file['0 MonoBehaviour Base']['0 Array availableModifiers'][i]['0 PPtr<$GameObject> data']['0 int m_FileID']) + file['0 MonoBehaviour Base']['0 Array availableModifiers'][i]['0 PPtr<$GameObject> data']['0 SInt64 m_PathID'] + '.json'))
            f['0 GameObject Base']['0 vector m_Component']['0 Array Array'].map(v => {
              if (fs.existsSync(path.join(folder['Other'], fileMap(v['0 pair data']['0 PPtr<Component> second']['0 int m_FileID']) + v['0 pair data']['0 PPtr<Component> second']['0 SInt64 m_PathID'] + '.json'))) {
                var f = require(path.join(folder['Other'], fileMap(v['0 pair data']['0 PPtr<Component> second']['0 int m_FileID']) + v['0 pair data']['0 PPtr<Component> second']['0 SInt64 m_PathID'] + '.json'))
                if (f['0 MonoBehaviour Base'] && f['0 MonoBehaviour Base']['0 PPtr<$EquipmentSet> Set']) {
                  if (i === 0) dataObj.push({
                    nameMod: f['0 MonoBehaviour Base']['1 string nameMod'].length > 0 ? translate[f['0 MonoBehaviour Base']['1 string nameMod']] || f['0 MonoBehaviour Base']['1 string nameMod'] : undefined,
                    expireTime: parseFloat(f['0 MonoBehaviour Base']['0 float expireTime'].toFixed(2)),
                    chanceToApply: parseFloat(f['0 MonoBehaviour Base']['0 float chanceToApply'].toFixed(2)),
                    minTier: f['0 MonoBehaviour Base']['0 int minTier'],
                    maxTier: f['0 MonoBehaviour Base']['0 int maxTier']
                  })
                  return dataObj.push({
                    craftingRecipe: (function () {
                      var g = require(path.join(folder['Other'], fileMap(f['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 int m_FileID']) + f['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))
                      var craftingRecipe
                      for (let i = 0; i < g['0 GameObject Base']['0 vector m_Component']['0 Array Array'].length; i++) {
                        var v = g['0 GameObject Base']['0 vector m_Component']['0 Array Array'][i]
                        if (!fs.existsSync(path.join(folder['CraftingRecipe'], fileMap(v['0 pair data']['0 PPtr<Component> second']['0 int m_FileID']) + v['0 pair data']['0 PPtr<Component> second']['0 SInt64 m_PathID'] + '.json'))) continue
                        var cr = require(path.join(folder['CraftingRecipe'], fileMap(v['0 pair data']['0 PPtr<Component> second']['0 int m_FileID']) + v['0 pair data']['0 PPtr<Component> second']['0 SInt64 m_PathID'] + '.json'))
                        if (cr['0 MonoBehaviour Base']['0 Array LeveledRecipes']) {
                          craftingRecipe = {}
                          craftingRecipe.name = g['0 GameObject Base']['1 string m_Name'].split('_').pop()
                          craftingRecipe.interpretedType = g['0 GameObject Base']['1 string m_Name'].split('_')[1]
                        }
                      }
                      return craftingRecipe
                    })(),
                    equipmentSet: f['0 MonoBehaviour Base']['0 PPtr<$EquipmentSet> Set']['0 SInt64 m_PathID']
                      ? (function () {
                        var e = require(path.join(folder['Other'], fileMap(f['0 MonoBehaviour Base']['0 PPtr<$EquipmentSet> Set']['0 int m_FileID']) + f['0 MonoBehaviour Base']['0 PPtr<$EquipmentSet> Set']['0 SInt64 m_PathID'] + '.json'))
                        return {
                          name: require(path.join(folder['Other'], fileMap(e['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 int m_FileID']) + e['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name'],
                          description: e['0 MonoBehaviour Base']['1 string Description'],
                          minimumRequiredAmount: e['0 MonoBehaviour Base']['0 int minimumNumberOfItemsToEnable'],
                          stats: e['0 MonoBehaviour Base']['0 Array stat'].map(v => {
                            return {
                              key: Object.keys(statEnum).map(e => {
                                if (statEnum[e] === v['0 Deity.Shared.Stat data']['0 int key']) return e
                                else return undefined
                              }).filter(Boolean).join(''),
                              equation: v['0 Deity.Shared.Stat data']['1 string equation'],
                              value: parseFloat(v['0 Deity.Shared.Stat data']['0 float value'].toFixed(2))
                            }
                          })
                        }
                      })()
                      : undefined,
                    validClasses: Object.keys(classEnum).map(e => {
                      if (e !== 'None' && classEnum[e] === f['0 MonoBehaviour Base']['0 int validEquipMask']) return e
                      else if (e !== 'None' && hasFlag(f['0 MonoBehaviour Base']['0 int validEquipMask'], classEnum[e])) return e
                      else return undefined
                    }).filter(Boolean),
                    type: Object.keys(itemClassEnum).map(e => {
                      if (e !== 'None' && itemClassEnum[e] === f['0 MonoBehaviour Base']['0 int validClasses']) return e
                      else if (e !== 'None' && hasFlag(f['0 MonoBehaviour Base']['0 int validClasses'], itemClassEnum[e])) return e
                      else return undefined
                    }).filter(Boolean),
                    stats: f['0 MonoBehaviour Base']['0 Array stat'].length > 0 ? f['0 MonoBehaviour Base']['0 Array stat'].map(v => {
                      return {
                        key: Object.keys(statEnum).map(e => {
                          if (statEnum[e] === v['0 Deity.Shared.Stat data']['0 int key']) return e
                          else return undefined
                        }).filter(Boolean).join(''),
                        equation: v['0 Deity.Shared.Stat data']['1 string equation'],
                        value: parseFloat(v['0 Deity.Shared.Stat data']['0 float value'].toFixed(2))
                      }
                    }) : undefined
                  })
                } else return undefined
              } else return undefined
            }).filter(Boolean)
          }
          return dataObj
        })()
      }
      var arr = require(path.join(folder['Other'], fileMap(file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 int m_FileID']) + file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['0 vector m_Component']['0 Array Array']
      for (let i = 0; i < arr.length; i++) {
        const v = arr[i]
        if (fs.existsSync(path.join(folder['ItemDefinition'], fileMap(v['0 pair data']['0 PPtr<Component> second']['0 int m_FileID']) + v['0 pair data']['0 PPtr<Component> second']['0 SInt64 m_PathID'] + '.json'))) {
          var f = require(path.join(folder['ItemDefinition'], fileMap(v['0 pair data']['0 PPtr<Component> second']['0 int m_FileID']) + v['0 pair data']['0 PPtr<Component> second']['0 SInt64 m_PathID'] + '.json'))
          itemModifier.alias = translate[f['0 MonoBehaviour Base']['1 string Name']] || f['0 MonoBehaviour Base']['1 string Name']
          itemModifier.description = translate[f['0 MonoBehaviour Base']['1 string Description']] || f['0 MonoBehaviour Base']['1 string Description']
          break
        }
      }

      var filename = path.join(__dirname, 'Patch', folderName6, `${itemModifier.name}.json`)
      if (fs.existsSync(filename)) {
        var file = JSON.parse(fs.readFileSync(filename, 'utf-8'))
        file.push(itemModifier)
        fs.writeFileSync(filename, JSON.stringify(file, null, 2))
      } else fs.writeFileSync(filename, JSON.stringify([itemModifier], null, 2))
      count++
      if (count === announceAtNextCount) {
        announceAtNextCount += 500
        console.log(folderName6, 'at', count, '...')
      }
    })
    console.log(folderName6, 'completed', 'at', count)
  }

  let folderName7 = 'LootBox'
  if (folder[folderName7]) {
    fs.mkdirSync(path.join(__dirname, 'Patch', folderName7))
    var count = 0
    var announceAtNextCount = 500
    fs.readdirSync(folder[folderName7]).forEach(val => {
      var file = require(path.join(folder[folderName7], val))
      var lootBox = {
        name: translate[file['0 MonoBehaviour Base']['1 string FloatingLabelText']] || require(path.join(folder['Other'], fileMap(file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 int m_FileID']) + file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name'],
        key: file['0 MonoBehaviour Base']['0 PPtr<$ItemDefinition> Key']['0 SInt64 m_PathID']
          ? (function () {
            var f = require(path.join(folder['ItemDefinition'], fileMap(file['0 MonoBehaviour Base']['0 PPtr<$ItemDefinition> Key']['0 int m_FileID']) + file['0 MonoBehaviour Base']['0 PPtr<$ItemDefinition> Key']['0 SInt64 m_PathID'] + '.json'))['0 MonoBehaviour Base']
            return {
              name: translate[f['1 string Name']] || f['1 string Name'],
              description: translate[f['1 string Description']] || f['1 string Description'],
              price: f['0 int Price'],
              currency: require(path.join(folder['Other'], fileMap(f['0 PPtr<$GameObject> Currency']['0 int m_FileID']) + f['0 PPtr<$GameObject> Currency']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name']
            }
          })()
          : undefined,
        lootTable: require(path.join(folder['Other'], fileMap(file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 int m_FileID']) + file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name'],
        containBloodStone: !!file['0 MonoBehaviour Base']['1 UInt8 shouldContainBloodstone']
      }

      var filename = path.join(__dirname, 'Patch', folderName7, `${lootBox.name}.json`)
      if (fs.existsSync(filename)) {
        var file = JSON.parse(fs.readFileSync(filename, 'utf-8'))
        file.push(lootBox)
        fs.writeFileSync(filename, JSON.stringify(file, null, 2))
      } else fs.writeFileSync(filename, JSON.stringify([lootBox], null, 2))
      count++
      if (count === announceAtNextCount) {
        announceAtNextCount += 500
        console.log(folderName7, 'at', count, '...')
      }
    })
    console.log(folderName7, 'completed', 'at', count)
  }

  let folderName8 = 'NPC'
  if (folder[folderName8]) {
    fs.mkdirSync(path.join(__dirname, 'Patch', folderName8))
    var count = 0
    var announceAtNextCount = 500
    fs.readdirSync(folder[folderName8]).forEach(val => {
      var file = require(path.join(folder[folderName8], val))
      var npc = {
        name: file['0 MonoBehaviour Base']['1 string NPCName'].length > 0
          ? translate[file['0 MonoBehaviour Base']['1 string NPCName']] || file['0 MonoBehaviour Base']['1 string NPCName']
          : require(path.join(folder['Other'], fileMap(file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 int m_FileID']) + file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name'],
        alias: file['0 MonoBehaviour Base']['1 string NPCName'].length > 0
          ? (translate[file['0 MonoBehaviour Base']['1 string NPCName']] || file['0 MonoBehaviour Base']['1 string NPCName']) === require(path.join(folder['Other'], fileMap(file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 int m_FileID']) + file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name']
            ? undefined
            : require(path.join(folder['Other'], fileMap(file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 int m_FileID']) + file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name']
          : undefined,
        category: Object.keys(npcCategoryEnum).map(e => {
          if (npcCategoryEnum[e] === file['0 MonoBehaviour Base']['0 int Category']) return e
          else return undefined
        }).filter(Boolean).join(''),
        weapons: file['0 MonoBehaviour Base']['0 Array WeaponPrefabs'].map(v => {
          if (!fs.existsSync(path.join(folder['Other'], fileMap(v['0 PPtr<$GameObject> data']['0 int m_FileID']) + v['0 PPtr<$GameObject> data']['0 SInt64 m_PathID'] + '.json'))) return undefined
          var w = require(path.join(folder['Other'], fileMap(v['0 PPtr<$GameObject> data']['0 int m_FileID']) + v['0 PPtr<$GameObject> data']['0 SInt64 m_PathID'] + '.json'))
          if (w) return {
            name: w['0 GameObject Base']['1 string m_Name'],
            data: w['0 GameObject Base']['0 vector m_Component']['0 Array Array'].map(v => {
              if (!fs.existsSync(path.join(folder['Other'], fileMap(v['0 pair data']['0 PPtr<Component> second']['0 int m_FileID']) + v['0 pair data']['0 PPtr<Component> second']['0 SInt64 m_PathID'] + '.json'))) return undefined
              var f = require(path.join(folder['Other'], fileMap(v['0 pair data']['0 PPtr<Component> second']['0 int m_FileID']) + v['0 pair data']['0 PPtr<Component> second']['0 SInt64 m_PathID'] + '.json'))
              if (f['0 MonoBehaviour Base'] && f['0 MonoBehaviour Base']['1 string ProjectileName']) {
                return {
                  projectile: {
                    name: require(path.join(folder['Other'], fileMap(f['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 int m_FileID']) + f['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name'],
                    projectileName: f['0 MonoBehaviour Base']['1 string ProjectileName'],
                    speed: parseFloat(f['0 MonoBehaviour Base']['0 float Speed'].toFixed(2)),
                    acceleration: parseFloat(f['0 MonoBehaviour Base']['0 float Acceleration'].toFixed(2)) || undefined,
                    damage: f['0 MonoBehaviour Base']['0 int Damage'],
                    damageMultiplier: parseFloat(f['0 MonoBehaviour Base']['0 float DamageMultiplier'].toFixed(2)) || undefined,
                    essenceDamageMultiplier: parseFloat(f['0 MonoBehaviour Base']['0 float EssenceDamageMultiplier'].toFixed(2)) || undefined,
                    range: parseFloat(f['0 MonoBehaviour Base']['0 float Range'].toFixed(2)),
                    useTargetForRange: !!f['0 MonoBehaviour Base']['1 UInt8 UseTargetForRange'],
                    useRandomRange: !!f['0 MonoBehaviour Base']['1 UInt8 UseRandomRange'],
                    randomRangeMax: parseFloat(f['0 MonoBehaviour Base']['0 float RandomRangeMax'].toFixed(2)) || undefined,
                    maxHits: f['0 MonoBehaviour Base']['0 int MaxHits'],
                    arcSeparation: parseFloat(f['0 MonoBehaviour Base']['0 float ArcSeparation'].toFixed(2)) || undefined,
                    maxLifetime: parseFloat(f['0 MonoBehaviour Base']['0 float MaxLifetime'].toFixed(2)),
                    delayRate: parseFloat(f['0 MonoBehaviour Base']['0 float DelayRate'].toFixed(2)) || undefined,
                    rageMultiplier: f['0 MonoBehaviour Base']['0 float RageMultiplier'],
                    bounceBetweenEnemies: !!f['0 MonoBehaviour Base']['1 UInt8 BounceBetweenEnemies'],
                    pierceWorld: !!f['0 MonoBehaviour Base']['1 UInt8 PierceWorld'],
                    statusEffect: f['0 MonoBehaviour Base']['0 PPtr<$StatusEffect> statusEffect']['0 SInt64 m_PathID']
                      ? (function () {
                        var s = require(path.join(folder['Other'], fileMap(f['0 MonoBehaviour Base']['0 PPtr<$StatusEffect> statusEffect']['0 int m_FileID']) + f['0 MonoBehaviour Base']['0 PPtr<$StatusEffect> statusEffect']['0 SInt64 m_PathID'] + '.json'))
                        return {
                          name: s['0 MonoBehaviour Base']['1 string Name'],
                          type: Object.keys(statusEffectEnum).map(e => {
                            if (statusEffectEnum[e] === s['0 MonoBehaviour Base']['0 int Type']) return e
                            else return undefined
                          }).filter(Boolean).join(''),
                          duration: parseFloat(s['0 MonoBehaviour Base']['0 float Duration'].toFixed(2)),
                          stats: s['0 MonoBehaviour Base']['0 Array stat'].map(v => {
                            return {
                              key: Object.keys(statEnum).map(e => {
                                if (statEnum[e] === v['0 Deity.Shared.Stat data']['0 int key']) return e
                                else return undefined
                              }).filter(Boolean).join(''),
                              equation: v['0 Deity.Shared.Stat data']['1 string equation'],
                              value: parseFloat(v['0 Deity.Shared.Stat data']['0 float value'].toFixed(2))
                            }
                          }),
                          isBuff: !!s['0 MonoBehaviour Base']['1 UInt8 IsBuff'],
                          removeOnAttack: !!z['0 MonoBehaviour Base']['1 UInt8 RemoveOnAttack'],
                          coolDownTime: parseFloat(s['0 MonoBehaviour Base']['0 float CoolDownTime'].toFixed(2)),
                          floatingText: s['0 MonoBehaviour Base']['1 string floatingText'] || undefined,
                          noTimeOut: !!s['0 MonoBehaviour Base']['1 UInt8 NoTimeOut'],
                          screenFlashDuration: s['0 MonoBehaviour Base']['1 UInt8 fullscreenFlash'] ? parseFloat(s['0 MonoBehaviour Base']['0 float flashDuration'].toFixed(2)) : undefined
                        }
                      })()
                      : undefined,
                    color: {
                      r: parseFloat(f['0 MonoBehaviour Base']['0 ColorRGBA LightColor']['0 float r'].toFixed(2)),
                      g: parseFloat(f['0 MonoBehaviour Base']['0 ColorRGBA LightColor']['0 float g'].toFixed(2)),
                      b: parseFloat(f['0 MonoBehaviour Base']['0 ColorRGBA LightColor']['0 float b'].toFixed(2)),
                      a: parseFloat(f['0 MonoBehaviour Base']['0 ColorRGBA LightColor']['0 float a'].toFixed(2)),
                    }
                  }
                }
              } else if (f['0 SpriteRenderer Base'] && f['0 SpriteRenderer Base']['0 PPtr<Sprite> m_Sprite']['0 SInt64 m_PathID']) {
                var srd = require(path.join(folder['Other'], fileMap(f['0 SpriteRenderer Base']['0 PPtr<Sprite> m_Sprite']['0 int m_FileID']) + f['0 SpriteRenderer Base']['0 PPtr<Sprite> m_Sprite']['0 SInt64 m_PathID'] + '.json'))['0 Sprite Base']['1 SpriteRenderData m_RD']
                var s = require(path.join(folder['Other'], fileMap(srd['0 PPtr<Texture2D> texture']['0 int m_FileID']) + srd['0 PPtr<Texture2D> texture']['0 SInt64 m_PathID'] + '.json'))['0 Texture2D Base']
                return {
                  sprite: {
                    name: s['1 string m_Name'],
                    baseSize: {
                      width: s['0 int m_Width'],
                      height: s['0 int m_Height']
                    },
                    textureRectangle: {
                      x: parseFloat(srd['0 Rectf textureRect']['0 float x'].toFixed(0)),
                      y: parseFloat(srd['0 Rectf textureRect']['0 float y'].toFixed(0)),
                      width: parseFloat(srd['0 Rectf textureRect']['0 float width'].toFixed(0)),
                      height: parseFloat(srd['0 Rectf textureRect']['0 float height'].toFixed(0))
                    },
                    textureOffset: {
                      x: parseFloat(srd['0 Vector2f textureRectOffset']['0 float x'].toFixed(0)),
                      y: parseFloat(srd['0 Vector2f textureRectOffset']['0 float y'].toFixed(0))
                    },
                    color: {
                      r: parseFloat(f['0 SpriteRenderer Base']['1 ColorRGBA m_Color']['0 float r'].toFixed(2)),
                      g: parseFloat(f['0 SpriteRenderer Base']['1 ColorRGBA m_Color']['0 float g'].toFixed(2)),
                      b: parseFloat(f['0 SpriteRenderer Base']['1 ColorRGBA m_Color']['0 float b'].toFixed(2)),
                      a: parseFloat(f['0 SpriteRenderer Base']['1 ColorRGBA m_Color']['0 float a'].toFixed(2))
                    }
                  }
                }
              } else return undefined
            }).filter(Boolean)
          }
        }).filter(Boolean),
        data: require(path.join(folder['Other'], fileMap(file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 int m_FileID']) + file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['0 vector m_Component']['0 Array Array'].map(v => {
          if (fs.existsSync(path.join(folder['LootTable'], fileMap(v['0 pair data']['0 PPtr<Component> second']['0 int m_FileID']) + v['0 pair data']['0 PPtr<Component> second']['0 SInt64 m_PathID'] + '.json'))) {
            var f = require(path.join(folder['LootTable'], fileMap(v['0 pair data']['0 PPtr<Component> second']['0 int m_FileID']) + v['0 pair data']['0 PPtr<Component> second']['0 SInt64 m_PathID'] + '.json'))
            if (f['0 MonoBehaviour Base'] && f['0 MonoBehaviour Base']['0 Array lootTable']) {
              return {
                loot: f['0 MonoBehaviour Base']['0 PPtr<$LootTable> ReferenceObject']['0 SInt64 m_PathID'] > 0
                  ? (function () {
                    var lootTable = require(path.join(folder['LootTable'], fileMap(f['0 MonoBehaviour Base']['0 PPtr<$LootTable> ReferenceObject']['0 int m_FileID']) + f['0 MonoBehaviour Base']['0 PPtr<$LootTable> ReferenceObject']['0 SInt64 m_PathID'] + '.json'))
                    return {
                      name: require(path.join(folder['Other'], fileMap(lootTable['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 int m_FileID']) + lootTable['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name']
                    }
                  })()
                  : {
                    guaranteeItemCount: f['0 MonoBehaviour Base']['0 int guaranteeItemCount'],
                    maximumItemCount: f['0 MonoBehaviour Base']['0 int maximumItemCount'],
                    lootTable: f['0 MonoBehaviour Base']['0 Array lootTable'].map(v => {
                      return {
                        item: translate[require(path.join(folder['ItemDefinition'], fileMap(v['0 Deity.Shared.LootEntry data']['0 PPtr<$ItemDefinition> item']['0 int m_FileID']) + v['0 Deity.Shared.LootEntry data']['0 PPtr<$ItemDefinition> item']['0 SInt64 m_PathID'] + '.json'))['0 MonoBehaviour Base']['1 string Name']] || require(path.join(folder['ItemDefinition'], fileMap(v['0 Deity.Shared.LootEntry data']['0 PPtr<$ItemDefinition> item']['0 int m_FileID']) + v['0 Deity.Shared.LootEntry data']['0 PPtr<$ItemDefinition> item']['0 SInt64 m_PathID'] + '.json'))['0 MonoBehaviour Base']['1 string Name'],
                        count: {
                          dice: v['0 Deity.Shared.LootEntry data']['0 Deity.Shared.DiceParm count']['0 int dice'],
                          faces: v['0 Deity.Shared.LootEntry data']['0 Deity.Shared.DiceParm count']['0 int faces'],
                          add: v['0 Deity.Shared.LootEntry data']['0 Deity.Shared.DiceParm count']['0 int add']
                        },
                        chance: v['0 Deity.Shared.LootEntry data']['0 double chance'],
                        allowModifiers: !!v['0 Deity.Shared.LootEntry data']['1 UInt8 allowModifiers']
                      }
                    })
                  }
              }
            }
          } else if (!fs.existsSync(path.join(folder['Other'], fileMap(v['0 pair data']['0 PPtr<Component> second']['0 int m_FileID']) + v['0 pair data']['0 PPtr<Component> second']['0 SInt64 m_PathID'] + '.json'))) return undefined
          var f = require(path.join(folder['Other'], fileMap(v['0 pair data']['0 PPtr<Component> second']['0 int m_FileID']) + v['0 pair data']['0 PPtr<Component> second']['0 SInt64 m_PathID'] + '.json'))
          if (f['0 MonoBehaviour Base'] && typeof f['0 MonoBehaviour Base']['0 int netObjectType'] === 'number') return undefined
          else if (f['0 MonoBehaviour Base'] && f['0 MonoBehaviour Base']['0 Array stat'] && f['0 MonoBehaviour Base']['0 Array stat'].length > 0) {
            return {
              stats: f['0 MonoBehaviour Base']['0 Array stat'].map(v => {
                return {
                  key: Object.keys(statEnum).map(e => {
                    if (statEnum[e] === v['0 Deity.Shared.Stat data']['0 int key']) return e
                    else return undefined
                  }).filter(Boolean).join(''),
                  equation: v['0 Deity.Shared.Stat data']['1 string equation'],
                  value: parseFloat(v['0 Deity.Shared.Stat data']['0 float value'].toFixed(2))
                }
              })
            }
          } else if (f['0 MonoBehaviour Base'] && f['0 MonoBehaviour Base']['0 Deity.Shared.CollisionShape shape']) {
            return {
              bPlayerProjectile: !!f['0 MonoBehaviour Base']['1 UInt8 bPlayerProjectile'] || undefined,
              bEnemyProjectile: !!f['0 MonoBehaviour Base']['1 UInt8 bEnemyProjectile'] || undefined,
              bSlide: !!f['0 MonoBehaviour Base']['1 UInt8 bSlide'] || undefined,
              bPlayer: !!f['0 MonoBehaviour Base']['1 UInt8 bPlayer'] || undefined,
              bEnemy: !!f['0 MonoBehaviour Base']['1 UInt8 bEnemy'] || undefined,
              bSkipWorld: !!f['0 MonoBehaviour Base']['1 UInt8 bSkipWorld'] || undefined,
              bSlowedDownByWater: !!f['0 MonoBehaviour Base']['1 UInt8 bSlowedDownByWater'] || undefined,
              bBlockedByLava: !!f['0 MonoBehaviour Base']['1 UInt8 bBlockedByLava'] || undefined,
              bFlying: !!f['0 MonoBehaviour Base']['1 UInt8 bFlying'] || undefined
            }
          } else if (f['0 SpriteRenderer Base'] && f['0 SpriteRenderer Base']['0 PPtr<Sprite> m_Sprite']['0 SInt64 m_PathID']) {
            var srd = require(path.join(folder['Other'], fileMap(f['0 SpriteRenderer Base']['0 PPtr<Sprite> m_Sprite']['0 int m_FileID']) + f['0 SpriteRenderer Base']['0 PPtr<Sprite> m_Sprite']['0 SInt64 m_PathID'] + '.json'))['0 Sprite Base']['1 SpriteRenderData m_RD']
            var s = require(path.join(folder['Other'], fileMap(srd['0 PPtr<Texture2D> texture']['0 int m_FileID']) + srd['0 PPtr<Texture2D> texture']['0 SInt64 m_PathID'] + '.json'))['0 Texture2D Base']
            return {
              sprite: {
                name: s['1 string m_Name'],
                baseSize: {
                  width: s['0 int m_Width'],
                  height: s['0 int m_Height']
                },
                textureRectangle: {
                  x: parseFloat(srd['0 Rectf textureRect']['0 float x'].toFixed(0)),
                  y: parseFloat(srd['0 Rectf textureRect']['0 float y'].toFixed(0)),
                  width: parseFloat(srd['0 Rectf textureRect']['0 float width'].toFixed(0)),
                  height: parseFloat(srd['0 Rectf textureRect']['0 float height'].toFixed(0))
                },
                textureOffset: {
                  x: parseFloat(srd['0 Vector2f textureRectOffset']['0 float x'].toFixed(0)),
                  y: parseFloat(srd['0 Vector2f textureRectOffset']['0 float y'].toFixed(0))
                },
                color: {
                  r: parseFloat(f['0 SpriteRenderer Base']['1 ColorRGBA m_Color']['0 float r'].toFixed(2)),
                  g: parseFloat(f['0 SpriteRenderer Base']['1 ColorRGBA m_Color']['0 float g'].toFixed(2)),
                  b: parseFloat(f['0 SpriteRenderer Base']['1 ColorRGBA m_Color']['0 float b'].toFixed(2)),
                  a: parseFloat(f['0 SpriteRenderer Base']['1 ColorRGBA m_Color']['0 float a'].toFixed(2))
                }
              }
            }
          } else if (f['0 MonoBehaviour Base'] && f['0 MonoBehaviour Base']['0 Array snds'] && f['0 MonoBehaviour Base']['0 Array snds'].length > 0) {
            return {
              sound: {
                soundType: Object.keys(soundListEnum).map(e => {
                  if (soundListEnum[e] === f['0 MonoBehaviour Base']['0 int soundListType']) return e
                  else return undefined
                }).filter(Boolean).join(''),
                sounds: f['0 MonoBehaviour Base']['0 Array snds'].map(v => {
                  return v['1 string data']
                }),
              }
            }
          } else if (f['0 MonoBehaviour Base'] && f['0 MonoBehaviour Base']['0 Array dialogue'] && f['0 MonoBehaviour Base']['0 Array dialogue'].length > 0) {
            return {
              dialogue: f['0 MonoBehaviour Base']['0 Array dialogue'].map(v => {
                var d = require(path.join(folder['Other'], fileMap(v['0 PPtr<$AudioMessage> data']['0 int m_FileID']) + v['0 PPtr<$AudioMessage> data']['0 SInt64 m_PathID'] + '.json'))['0 MonoBehaviour Base']
                return {
                  name: require(path.join(folder['Other'], fileMap(d['0 PPtr<GameObject> m_GameObject']['0 int m_FileID']) + d['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name'],
                  message: translate[d['1 string message']] || d['1 string message']
                }
              })
            }
          } /*else if (f['0 MonoBehaviour Base'] && f['0 MonoBehaviour Base']['0 Array dialogues'] && f['0 MonoBehaviour Base']['0 Array dialogues'].length > 0) {
            return {
              dialogues: {
                
              }
            }
          }*/ else return undefined
        }).filter(Boolean)
      }

      var filename = path.join(__dirname, 'Patch', folderName8, `${npc.name}.json`)
      if (fs.existsSync(filename)) {
        var file = JSON.parse(fs.readFileSync(filename, 'utf-8'))
        file.push(npc)
        fs.writeFileSync(filename, JSON.stringify(file, null, 2))
      } else fs.writeFileSync(filename, JSON.stringify([npc], null, 2))
      count++
      if (count === announceAtNextCount) {
        announceAtNextCount += 500
        console.log(folderName8, 'at', count, '...')
      }
    })
    console.log(folderName8, 'completed', 'at', count)
  }

  let folderName9 = 'Player'
  if (folder[folderName9]) {
    fs.mkdirSync(path.join(__dirname, 'Patch', folderName9))
    var count = 0
    var announceAtNextCount = 500
    fs.readdirSync(folder[folderName9]).forEach(val => {
      var file = require(path.join(folder[folderName9], val))
      var player = {
        name: require(path.join(folder['Other'], fileMap(file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 int m_FileID']) + file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name'],
        description: translate[file['0 MonoBehaviour Base']['1 string description']] || file['0 MonoBehaviour Base']['1 string description'],
        primaryStat: Object.keys(statEnum).map(e => {
          if (statEnum[e] === file['0 MonoBehaviour Base']['0 int PrimaryStat']) return e
          else return undefined
        }).filter(Boolean).join(''),
        moveRate: parseFloat(file['0 MonoBehaviour Base']['0 float MoveRate'].toFixed(2)),
        interactionRange: parseFloat(file['0 MonoBehaviour Base']['0 float InteractionRange'].toFixed(2)),
        experiencePerLevel: file['0 MonoBehaviour Base']['0 Array ExperiencePerLevel'].map(v => {
          return v['0 int data']
        }),
        data: require(path.join(folder['Other'], fileMap(file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 int m_FileID']) + file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['0 vector m_Component']['0 Array Array'].map(v => {
          if (!fs.existsSync(path.join(folder['Other'], fileMap(v['0 pair data']['0 PPtr<Component> second']['0 int m_FileID']) + v['0 pair data']['0 PPtr<Component> second']['0 SInt64 m_PathID'] + '.json'))) return undefined
          var f = require(path.join(folder['Other'], fileMap(v['0 pair data']['0 PPtr<Component> second']['0 int m_FileID']) + v['0 pair data']['0 PPtr<Component> second']['0 SInt64 m_PathID'] + '.json'))
          if (f['0 MonoBehaviour Base'] && typeof f['0 MonoBehaviour Base']['0 int netObjectType'] === 'number') return undefined
          else if (f['0 MonoBehaviour Base'] && f['0 MonoBehaviour Base']['0 Array stat'] && f['0 MonoBehaviour Base']['0 Array stat'].length > 0) {
            return {
              stats: f['0 MonoBehaviour Base']['0 Array stat'].map(v => {
                return {
                  key: Object.keys(statEnum).map(e => {
                    if (statEnum[e] === v['0 Deity.Shared.Stat data']['0 int key']) return e
                    else return undefined
                  }).filter(Boolean).join(''),
                  equation: v['0 Deity.Shared.Stat data']['1 string equation'],
                  value: parseFloat(v['0 Deity.Shared.Stat data']['0 float value'].toFixed(2))
                }
              })
            }
          } else if (f['0 MonoBehaviour Base'] && f['0 MonoBehaviour Base']['0 Deity.Shared.CollisionShape shape']) {
            return {
              bPlayerProjectile: !!f['0 MonoBehaviour Base']['1 UInt8 bPlayerProjectile'] || undefined,
              bEnemyProjectile: !!f['0 MonoBehaviour Base']['1 UInt8 bEnemyProjectile'] || undefined,
              bSlide: !!f['0 MonoBehaviour Base']['1 UInt8 bSlide'] || undefined,
              bPlayer: !!f['0 MonoBehaviour Base']['1 UInt8 bPlayer'] || undefined,
              bEnemy: !!f['0 MonoBehaviour Base']['1 UInt8 bEnemy'] || undefined,
              bSkipWorld: !!f['0 MonoBehaviour Base']['1 UInt8 bSkipWorld'] || undefined,
              bSlowedDownByWater: !!f['0 MonoBehaviour Base']['1 UInt8 bSlowedDownByWater'] || undefined,
              bBlockedByLava: !!f['0 MonoBehaviour Base']['1 UInt8 bBlockedByLava'] || undefined,
              bFlying: !!f['0 MonoBehaviour Base']['1 UInt8 bFlying'] || undefined
            }
          } else if (f['0 MonoBehaviour Base'] && f['0 MonoBehaviour Base']['0 Array snds'] && f['0 MonoBehaviour Base']['0 Array snds'].length > 0) {
            return {
              sound: {
                soundType: Object.keys(soundListEnum).map(e => {
                  if (soundListEnum[e] === f['0 MonoBehaviour Base']['0 int soundListType']) return e
                  else return undefined
                }).filter(Boolean).join(''),
                sounds: f['0 MonoBehaviour Base']['0 Array snds'].map(v => {
                  return v['1 string data']
                }),
              }
            }
          } else return undefined
        }).filter(Boolean),
        topStats: require(path.join(folder['Other'], fileMap(file['0 MonoBehaviour Base']['0 PPtr<$Stats> TopStats']['0 int m_FileID']) + file['0 MonoBehaviour Base']['0 PPtr<$Stats> TopStats']['0 SInt64 m_PathID'] + '.json'))['0 MonoBehaviour Base']['0 Array stat'].map(v => {
          return {
            key: Object.keys(statEnum).map(e => {
              if (statEnum[e] === v['0 Deity.Shared.Stat data']['0 int key']) return e
              else return undefined
            }).filter(Boolean).join(''),
            equation: v['0 Deity.Shared.Stat data']['1 string equation'],
            value: parseFloat(v['0 Deity.Shared.Stat data']['0 float value'].toFixed(2))
          }
        }),
        skins: file['0 MonoBehaviour Base']['0 Array skins'].map(v => {
          var f = require(path.join(folder['Other'], fileMap(v['0 Deity.Shared.PlayerSkin data']['0 PPtr<$Skin> Skin']['0 int m_FileID']) + v['0 Deity.Shared.PlayerSkin data']['0 PPtr<$Skin> Skin']['0 SInt64 m_PathID'] + '.json'))['0 MonoBehaviour Base']
          return {
            name: require(path.join(folder['Other'], fileMap(f['0 PPtr<GameObject> m_GameObject']['0 int m_FileID']) + f['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['1 string m_Name'],
            offerID: v['0 Deity.Shared.PlayerSkin data']['1 string OfferId'],
            sprite: (function () {
              var srd = require(path.join(folder['Other'], fileMap(f['0 PPtr<$Sprite> SkinIcon']['0 int m_FileID']) + f['0 PPtr<$Sprite> SkinIcon']['0 SInt64 m_PathID'] + '.json'))['0 Sprite Base']['1 SpriteRenderData m_RD']
              var s = require(path.join(folder['Other'], fileMap(srd['0 PPtr<Texture2D> texture']['0 int m_FileID']) + srd['0 PPtr<Texture2D> texture']['0 SInt64 m_PathID'] + '.json'))['0 Texture2D Base']
              return {
                name: s['1 string m_Name'],
                baseSize: {
                  width: s['0 int m_Width'],
                  height: s['0 int m_Height']
                },
                textureRectangle: {
                  x: parseFloat(srd['0 Rectf textureRect']['0 float x'].toFixed(0)),
                  y: parseFloat(srd['0 Rectf textureRect']['0 float y'].toFixed(0)),
                  width: parseFloat(srd['0 Rectf textureRect']['0 float width'].toFixed(0)),
                  height: parseFloat(srd['0 Rectf textureRect']['0 float height'].toFixed(0))
                },
                textureOffset: {
                  x: parseFloat(srd['0 Vector2f textureRectOffset']['0 float x'].toFixed(0)),
                  y: parseFloat(srd['0 Vector2f textureRectOffset']['0 float y'].toFixed(0))
                }
              }
            })()
          }
        })
      }

      var filename = path.join(__dirname, 'Patch', folderName9, `${player.name}.json`)
      if (fs.existsSync(filename)) {
        var file = JSON.parse(fs.readFileSync(filename, 'utf-8'))
        file.push(player)
        fs.writeFileSync(filename, JSON.stringify(file, null, 2))
      } else fs.writeFileSync(filename, JSON.stringify([player], null, 2))
      count++
      if (count === announceAtNextCount) {
        announceAtNextCount += 500
        console.log(folderName9, 'at', count, '...')
      }
    })
    console.log(folderName9, 'completed', 'at', count)
  }

  let folderName10 = 'Challenge'
  if (folder[folderName10]) {
    fs.mkdirSync(path.join(__dirname, 'Patch', folderName10))
    var count = 0
    var announceAtNextCount = 500
    fs.readdirSync(folder[folderName10]).forEach(val => {
      var file = require(path.join(folder[folderName10], val))
      var challenge = {
        name: require(path.join(folder['Other'], fileMap(file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 int m_FileID']) + file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name'],
        questText: translate[file['0 MonoBehaviour Base']['1 string QuestText']] || file['0 MonoBehaviour Base']['1 string QuestText'],
        completeText: translate[file['0 MonoBehaviour Base']['1 string QuestCompleteText']] || file['0 MonoBehaviour Base']['1 string QuestCompleteText'],
        title: translate[file['0 MonoBehaviour Base']['1 string ChallengeTitle']] || file['0 MonoBehaviour Base']['1 string ChallengeTitle'],
        description: translate[file['0 MonoBehaviour Base']['1 string ChallengeDescription']] || file['0 MonoBehaviour Base']['1 string ChallengeDescription'],
        challengeValueSuffix: translate[file['0 MonoBehaviour Base']['1 string ChallengeValueSuffix']] || file['0 MonoBehaviour Base']['1 string ChallengeValueSuffix'],
        challengeType: Object.keys(statEnum).map(e => {
          if (statEnum[e] === file['0 MonoBehaviour Base']['0 int challengeType']) return e
          else return undefined
        }).filter(Boolean).join(''),
        challengeTarget: file['0 MonoBehaviour Base']['0 PPtr<$GameObject> challengeTarget']['0 SInt64 m_PathID']
          ? require(path.join(folder['Other'], fileMap(file['0 MonoBehaviour Base']['0 PPtr<$GameObject> challengeTarget']['0 int m_FileID']) + file['0 MonoBehaviour Base']['0 PPtr<$GameObject> challengeTarget']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name']
          : undefined,
        achievement: !!file['0 MonoBehaviour Base']['1 UInt8 accountAchievement'],
        prerequisites: file['0 MonoBehaviour Base']['0 Array prerequisites'].length > 0
          ? file['0 MonoBehaviour Base']['0 Array prerequisites'].map(v => {
            var p = require(path.join(folder['Challenge'], fileMap(v['0 PPtr<$Challenge> data']['0 int m_FileID']) + v['0 PPtr<$Challenge> data']['0 SInt64 m_PathID'] + '.json'))['0 MonoBehaviour Base']
            return [translate[p['1 string ChallengeTitle']] || p['1 string ChallengeTitle'], require(path.join(folder['Other'], fileMap(p['0 PPtr<GameObject> m_GameObject']['0 int m_FileID']) + p['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name']]
          })
          : undefined,
        data: require(path.join(folder['Other'], fileMap(file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 int m_FileID']) + file['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['0 vector m_Component']['0 Array Array'].map(v => {
          if (fs.existsSync(path.join(folder['LootTable'], fileMap(v['0 pair data']['0 PPtr<Component> second']['0 int m_FileID']) + v['0 pair data']['0 PPtr<Component> second']['0 SInt64 m_PathID'] + '.json'))) {
            var f = require(path.join(folder['LootTable'], fileMap(v['0 pair data']['0 PPtr<Component> second']['0 int m_FileID']) + v['0 pair data']['0 PPtr<Component> second']['0 SInt64 m_PathID'] + '.json'))
            if (f['0 MonoBehaviour Base'] && f['0 MonoBehaviour Base']['0 Array lootTable']) {
              return {
                loot: {
                  lootTable: {
                    name: require(path.join(folder['Other'], fileMap(f['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 int m_FileID']) + f['0 MonoBehaviour Base']['0 PPtr<GameObject> m_GameObject']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']['1 string m_Name']
                  }
                }
              }
            }
          } else return undefined
        }).filter(Boolean)
      }

      var filename = path.join(__dirname, 'Patch', folderName10, `${challenge.name}.json`)
      if (fs.existsSync(filename)) {
        var file = JSON.parse(fs.readFileSync(filename, 'utf-8'))
        file.push(challenge)
        fs.writeFileSync(filename, JSON.stringify(file, null, 2))
      } else fs.writeFileSync(filename, JSON.stringify([challenge], null, 2))
      count++
      if (count === announceAtNextCount) {
        announceAtNextCount += 500
        console.log(folderName10, 'at', count, '...')
      }
    })
    console.log(folderName10, 'completed', 'at', count)
  }

  let folderName11 = 'SpawnerDef'
  if (folder[folderName11]) {
    var timeOfDayEnum = {
      "All": 0,
	    "Day": 1,
	    "Night": 2
    }
    fs.mkdirSync(path.join(__dirname, 'Patch', folderName11))
    var count = 0
    var announceAtNextCount = 500
    fs.readdirSync(folder[folderName11]).forEach(val => {
      var file = require(path.join(folder[folderName11], val))
      var m = '0 MonoBehaviour Base'
      var spawnerDef = {
        name: file[m]['1 string m_Name'],
        biome: Object.keys(biomeTypeEnum).map(e => {
          if (biomeTypeEnum[e] === file[m]['0 int biome']) return e
          else return undefined
        }).filter(Boolean).join(''),
        difficulty: {
          min: parseFloat(file[m]['0 float difficultyMin'].toFixed(2)),
          max: parseFloat(file[m]['0 float difficultyMax'].toFixed(2))
        },
        spawnRadius: parseFloat(file[m]['0 float spawnRadius'].toFixed(2)),
        spawnDelayed: !!file[m]['1 UInt8 spawnDelayed'],
        quotaRadius: parseFloat(file[m]['0 float quotaRadius'].toFixed(2)),
        rechargeTime: parseFloat(file[m]['0 float rechargeTime'].toFixed(2)),
        isBoss: !!file[m]['1 UInt8 isBoss'],
        autoPopulate: !!file[m]['1 UInt8 autoPopulate'],
        manuallyPlaced: !!file[m]['1 UInt8 manuallyPlaced'],
        floraOrFaunaSpawner: !!file[m]['1 UInt8 floraOrFaunaSpawner'],
        spawnList: file[m]['0 Array spawnList'].length > 0 ? file[m]['0 Array spawnList'].map(v => {
          var monster = v['0 Deity.Shared.MonsterToSpawn data']
          if (!fs.existsSync(path.join(folder['Other'], fileMap(monster['0 PPtr<$GameObject> MonsterPrefab']['0 int m_FileID']) + monster['0 PPtr<$GameObject> MonsterPrefab']['0 SInt64 m_PathID'] + '.json'))) return undefined
          var f = require(path.join(folder['Other'], fileMap(monster['0 PPtr<$GameObject> MonsterPrefab']['0 int m_FileID']) + monster['0 PPtr<$GameObject> MonsterPrefab']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']
          return {
            monsterName: (function () {
              var monData
              for (let i = 0; i < f['0 vector m_Component']['0 Array Array'].length; i++) {
                const entry = f['0 vector m_Component']['0 Array Array'][i]['0 pair data']
                if (fs.existsSync(path.join(folder['Monster'], fileMap(entry['0 PPtr<Component> second']['0 int m_FileID']) + entry['0 PPtr<Component> second']['0 SInt64 m_PathID'] + '.json'))) {
                  monData = require(path.join(folder['Monster'], fileMap(entry['0 PPtr<Component> second']['0 int m_FileID']) + entry['0 PPtr<Component> second']['0 SInt64 m_PathID'] + '.json'))
                  break
                }
              }
              return translate[monData['0 MonoBehaviour Base']['1 string MonsterName']] || monData['0 MonoBehaviour Base']['1 string MonsterName']
            })(),
            monsterAlias: f['1 string m_Name'],
            spawnChance: parseFloat(monster['0 float spawnChance'].toFixed(2)),
            spawnQuota: monster['0 int spawnQuota'],
            timeOfDay: Object.keys(timeOfDayEnum).map(e => {
              if (timeOfDayEnum[e] === monster['0 int timeOfDay']) return e
              else return undefined
            }).filter(Boolean).join('')
          }
        }).filter(Boolean) : undefined,
        comboSpawnList: file[m]['0 Array comboSpawnList'].length > 0 ? file[m]['0 Array comboSpawnList'].map(v => {
          var monsterArray = v['0 Deity.Shared.MonsterComboPack data']['0 Array Monsters']
          return monsterArray.map(v => {
            var monster = v['0 Deity.Shared.MonsterToSpawn data']
            if (!fs.existsSync(path.join(folder['Other'], fileMap(monster['0 PPtr<$GameObject> MonsterPrefab']['0 int m_FileID']) + monster['0 PPtr<$GameObject> MonsterPrefab']['0 SInt64 m_PathID'] + '.json'))) return undefined
            var f = require(path.join( folder['Other'], fileMap(monster['0 PPtr<$GameObject> MonsterPrefab']['0 int m_FileID']) + monster['0 PPtr<$GameObject> MonsterPrefab']['0 SInt64 m_PathID'] + '.json'))['0 GameObject Base']
            return {
              monsterName: (function () {
                var monData
                for (let i = 0; i < f['0 vector m_Component']['0 Array Array'].length; i++) {
                  const entry = f['0 vector m_Component']['0 Array Array'][i]['0 pair data']
                  if (fs.existsSync(path.join(folder['Monster'], fileMap(entry['0 PPtr<Component> second']['0 int m_FileID']) + entry['0 PPtr<Component> second']['0 SInt64 m_PathID'] + '.json'))) {
                    monData = require(path.join(folder['Monster'], fileMap(entry['0 PPtr<Component> second']['0 int m_FileID']) + entry['0 PPtr<Component> second']['0 SInt64 m_PathID'] + '.json'))
                    break
                  }
                }
                return translate[monData['0 MonoBehaviour Base']['1 string MonsterName']] || monData['0 MonoBehaviour Base']['1 string MonsterName']
              })(),
              monsterAlias: f['1 string m_Name'],
              spawnChance: parseFloat(monster['0 float spawnChance'].toFixed(2)),
              spawnQuota: monster['0 int spawnQuota'],
              timeOfDay: Object.keys(timeOfDayEnum).map(e => {
                if (timeOfDayEnum[e] === monster['0 int timeOfDay']) return e
                else return undefined
              }).filter(Boolean).join('')
            }
          }).filter(Boolean)
        }).filter(Boolean) : undefined,
        oneTimeTrigger: !!file[m]['1 UInt8 oneTimeTrigger'],
        areaMax: file[m]['0 int areaMax'],
        areaRadius: file[m]['0 int areaRadius']/* ,
        comboArrangement: [] */
      }

      var filename = path.join(__dirname, 'Patch', folderName11, `${spawnerDef.name}.json`)
      if (fs.existsSync(filename)) {
        var file = JSON.parse(fs.readFileSync(filename, 'utf-8'))
        file.push(spawnerDef)
        fs.writeFileSync(filename, JSON.stringify(file, null, 2))
      } else fs.writeFileSync(filename, JSON.stringify([spawnerDef], null, 2))
      count++
      if (count === announceAtNextCount) {
        announceAtNextCount += 500
        console.log(folderName11, 'at', count, '...')
      }
    })
    console.log(folderName11, 'completed', 'at', count)
  }
}
