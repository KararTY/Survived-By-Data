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

  let folder = {
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
    'SpawnerDef': path.join(__dirname, 'Raw data', patchDate, 'SpawnerDef'),
    'WeeklyChallenge': path.join(__dirname, 'Raw data', patchDate, 'WeeklyChallenge'),
    'StatusEffect': path.join(__dirname, 'Raw data', patchDate, 'StatusEffect')
    //'Quest': path.join(__dirname, 'Raw data', patchDate, 'Quest')
  }


  var mono = '0 MonoBehaviour Base'
  var game = '0 GameObject Base'
  var fileID = '0 int m_FileID'
  var pathID = '0 SInt64 m_PathID'
  var pairData = '0 pair data'
  var componentSecond = '0 PPtr<Component> second'
  var ptrGameObject = '0 PPtr<GameObject> m_GameObject'
  var ptrGameObjectData = '0 PPtr<$GameObject> data'
  var array = '0 Array Array'
  var stringName = '1 string m_Name'
  var vectorComponent = '0 vector m_Component'

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


  function statusEffect(f, z) {
    if (f) f[mono]['0 PPtr<$StatusEffect> StatusEffect'] = f[mono]['0 PPtr<$StatusEffect> StatusEffect'] ? f[mono]['0 PPtr<$StatusEffect> StatusEffect'] : f[mono]['0 PPtr<$StatusEffect> statusEffect']
    let s = z ? z : require(path.join(folder['StatusEffect'], fileMap(f[mono]['0 PPtr<$StatusEffect> StatusEffect'][fileID]) + f[mono]['0 PPtr<$StatusEffect> StatusEffect'][pathID] + '.json'))
    let go = require(path.join(folder['Other'], fileMap(s[mono][ptrGameObject][fileID]) + s[mono][ptrGameObject][pathID] + '.json'))
    return {
      name: s[mono]['1 string Name'].length > 0 ? (s[mono]['1 string Name'].startsWith('string') ? translate[s[mono]['1 string Name']] : s[mono]['1 string Name']) : go[game][stringName],
      alias: (s[mono]['1 string Name'].length > 0 ? (s[mono]['1 string Name'].startsWith('string') ? translate[s[mono]['1 string Name']] : s[mono]['1 string Name']) : go[game][stringName]) !== go[game][stringName] ? go[game][stringName] : undefined,
      floatingText: s[mono]['1 string floatingText'] || undefined,
      type: Object.keys(statusEffectEnum).map(e => {
        if (statusEffectEnum[e] === s[mono]['0 int Type']) return e
        else return undefined
      }).filter(Boolean).join(''),
      duration: parseFloat(s[mono]['0 float Duration'].toFixed(2)),
      stats: s[mono]['0 Array stat'].map(v => {
        return {
          key: Object.keys(statEnum).map(e => {
            if (statEnum[e] === v['0 Deity.Shared.Stat data']['0 int key']) return e
            else return undefined
          }).filter(Boolean).join(''),
          equation: v['0 Deity.Shared.Stat data']['1 string equation'],
          value: parseFloat(v['0 Deity.Shared.Stat data']['0 float value'].toFixed(2))
        }
      }),
      relatedLevelStat: s[mono]['0 int RelatedLevelStat'] > -1 ? Object.keys(statEnum).map(e => {
        if (statEnum[e] === s[mono]['0 int RelatedLevelStat']) return e
        else return undefined
      }).filter(Boolean).join('') : undefined,
      characterEffectPrefab: s[mono]['0 PPtr<$GameObject> CharacterEffectPrefab'][pathID] ? {
        name: require(path.join(folder['Other'], fileMap(s[mono]['0 PPtr<$GameObject> CharacterEffectPrefab'][fileID]) + s[mono]['0 PPtr<$GameObject> CharacterEffectPrefab'][pathID] + '.json'))[game][stringName]
      } : undefined,
      projectile: s[mono]['0 int Projectile'] > -1 ? s[mono]['0 int Projectile'] : undefined,
      // skin: {},
      // ignoreIf : s[mono]['0 Array IgnoreIf'].length > 0 ? s[mono]['0 int Projectile'][array].map(v => {
      //   
      //   return statusEffect()
      // }) : undefined,
      // overwrite: s[mono]['0 Array Overwrite'].length > 0 ? s[mono]['0 Array Overwrite'].map(v => {
      //   return statusEffect()
      // }) : undefined,
      nextStackingStatusEffect: s[mono]['0 PPtr<$StatusEffect> NextStackingStatusEffect'][pathID]
        ? statusEffect(null, require(path.join(folder['StatusEffect'], fileMap(s[mono]['0 PPtr<$StatusEffect> NextStackingStatusEffect'][fileID]) + s[mono]['0 PPtr<$StatusEffect> NextStackingStatusEffect'][pathID] + '.json')))
        : undefined,
      statusEffectOnExpire: s[mono]['0 PPtr<$StatusEffect> StatusEffectOnExpire'][pathID]
        ? statusEffect(null, require(path.join(folder['StatusEffect'], fileMap(s[mono]['0 PPtr<$StatusEffect> StatusEffectOnExpire'][fileID]) + s[mono]['0 PPtr<$StatusEffect> StatusEffectOnExpire'][pathID] + '.json')))
        : undefined,
      disableSpecialAbility: !!s[mono]['1 UInt8 DisableSpecialAbility'] || undefined,
      doesNotStackWithSelf: !!s[mono]['1 UInt8 DoesntStackWithSelf'] || undefined,
      doNotRefresh: !!s[mono]['1 UInt8 DoNotRefresh'] || undefined,
      hasLevels: !!s[mono]['1 UInt8 HasLevels'] || undefined,
      isAccountWide: !!s[mono]['1 UInt8 IsAccountWide'] || undefined,
      trackedForChallenge: !!s[mono]['1 UInt8 TrackedForChallenge'] || undefined,
      ignoreDurationModifiers: (typeof s[mono]['1 UInt8 IgnoreDurrationModifiers'] === 'number' ? !!s[mono]['1 UInt8 IgnoreDurrationModifiers'] : !!s[mono]['1 UInt8 IgnoreDurationModifiers']) || undefined,
      isBuff: !!s[mono]['1 UInt8 IsBuff'] || undefined,
      removeOnAttack: !!s[mono]['1 UInt8 RemoveOnAttack'] || undefined,
      coolDownTime: s[mono]['0 float CoolDownTime'] ? parseFloat(s[mono]['0 float CoolDownTime'].toFixed(2)) : undefined,
      noTimeOut: !!s[mono]['1 UInt8 NoTimeOut'] || undefined,
      flashDuration: s[mono]['0 float flashDuration'] ? parseFloat(s[mono]['0 float flashDuration'].toFixed(2)) : undefined,
      isFullscreenFlash: s[mono]['0 float flashDuration'] ? !!s[mono]['1 UInt8 fullscreenFlash'] : undefined
    }
  }

  function projectile (f, z) {
    return {
      projectile: {
        name: require(path.join(folder['Other'], fileMap(f[mono][ptrGameObject][fileID]) + f[mono][ptrGameObject][pathID] + '.json'))[game][stringName],
        projectileName: f[mono]['1 string ProjectileName'],
        rotationSpeed: f[mono]['0 float RotationSpeed'] ? parseFloat(f[mono]['0 float RotationSpeed'].toFixed(2)) : undefined,
        orbitSpeed: f[mono]['0 float orbitSpeed'] ? parseFloat(f[mono]['0 float orbitSpeed'].toFixed(2)) : undefined,
        launchOffset: f[mono]['0 Vector2f launchOffset'] ? {
          x: parseFloat(f[mono]['0 Vector2f launchOffset']['0 float x'].toFixed(2)),
          y: parseFloat(f[mono]['0 Vector2f launchOffset']['0 float y'].toFixed(2))
        } : undefined,
        launchOffsetDistance: f[mono]['0 float launchOffsetDistance'] ? parseFloat(f[mono]['0 float launchOffsetDistance'].toFixed(2)) : undefined,
        lightScale: f[mono]['0 float LightScale'] ? parseFloat(f[mono]['0 float LightScale'].toFixed(2)) : undefined,
        tangentProjectileFireRate: f[mono]['0 float TangentProjectileFireRate'] ? parseFloat(f[mono]['0 float TangentProjectileFireRate'].toFixed(2)) : undefined,
        waveFrequency: f[mono]['0 float WaveFrequency'] ? parseFloat(f[mono]['0 float WaveFrequency'].toFixed(2)) : undefined,
        nextProjectileIndex: f[mono]['0 int NextProjectileIndex'] > -1 ? f[mono]['0 int NextProjectileIndex'] : undefined,
        tangentProjectileIndex: f[mono]['0 int TangentProjectileIndex'] > -1 ? f[mono]['0 int TangentProjectileIndex'] : undefined,
        repeatHitTime: f[mono]['0 float RepeatHitTime'] ? parseFloat(f[mono]['0 float RepeatHitTime'].toFixed(2)) : undefined,
        alignToDirection: !!f[mono]['1 UInt8 AlignToDirection'] || undefined,
        isNextProjectileGlobal: !!f[mono]['1 UInt8 IsNextProjectileGlobal'] || undefined,
        isTangentProjectileGlobal: !!f[mono]['1 UInt8 IsTangentProjectileGlobal'] || undefined,
        maintainOrbitRange: !!f[mono]['1 UInt8 maintainOrbitRange'] || undefined,
        ownerRelative: !!f[mono]['1 UInt8 OwnerRelative'] || undefined,
        sineWaveMotion: !!f[mono]['1 UInt8 SineWaveMotion'] || undefined,
        /** MISSING
         * 0 PPtr<$GAMEOBJECT> ESSENCEPARTICLE,
         * 0 PPtr<$GAMEOBJECT> EXPLOSION,
         * 0 PPtr<$GAMEOBJECT> FIZZLE,
         * 0 PPtr<$GAMEOBJECT> LIGHTPREFAB,
         * 0 PPtr<$SOUNDLIST> PROJECTILESPAWNER,
         * 0 PPtr<$TILESYSTEMBODY2D> body
         * 1 UInt16 DefIndex
         */
        essenceDamageMultiplier: f[mono]['0 float EssenceDamageMultiplier'] ? parseFloat(f[mono]['0 float EssenceDamageMultiplier'].toFixed(2)) : undefined, // Made constant in patch 2019-02-20
        speed: parseFloat(f[mono]['0 float Speed'].toFixed(2)),
        acceleration: f[mono]['0 float Acceleration'] ? parseFloat(f[mono]['0 float Acceleration'].toFixed(2)) : undefined,
        damage: f[mono]['0 int Damage'],
        damageMultiplier: f[mono]['0 float DamageMultiplier'] ? parseFloat(f[mono]['0 float DamageMultiplier'].toFixed(2)) : undefined,
        range: parseFloat(f[mono]['0 float Range'].toFixed(2)),
        useTargetForRange: !!f[mono]['1 UInt8 UseTargetForRange'] || undefined,
        useRandomRange: !!f[mono]['1 UInt8 UseRandomRange'] || undefined,
        randomRangeMax: f[mono]['0 float RandomRangeMax'] ? parseFloat(f[mono]['0 float RandomRangeMax'].toFixed(2)) : undefined,
        maxHits: f[mono]['0 int MaxHits'],
        arcSeparation: f[mono]['0 float ArcSeparation'] ? parseFloat(f[mono]['0 float ArcSeparation'].toFixed(2)) : undefined,
        /*maxLifetime: parseFloat(f[mono]['0 float MaxLifetime'].toFixed(2)),*/ // Deleted in patch 2019-02-20
        lifeTime: f[mono]['0 float Lifetime'] ? parseFloat(f[mono]['0 float Lifetime'].toFixed(2)) : undefined,
        delayRate: f[mono]['0 float DelayRate'] ? parseFloat(f[mono]['0 float DelayRate'].toFixed(2)) : undefined,
        rageMultiplier: f[mono]['0 float RageMultiplier'],
        bounceBetweenEnemies: !!f[mono]['1 UInt8 BounceBetweenEnemies'],
        pierceWorld: !!f[mono]['1 UInt8 PierceWorld'] || undefined,
        statusEffect: f[mono]['0 PPtr<$StatusEffect> statusEffect'][pathID]
          ? statusEffect(f)
          : undefined,
        color: {
          r: parseFloat(f[mono]['0 ColorRGBA LightColor']['0 float r'].toFixed(2)),
          g: parseFloat(f[mono]['0 ColorRGBA LightColor']['0 float g'].toFixed(2)),
          b: parseFloat(f[mono]['0 ColorRGBA LightColor']['0 float b'].toFixed(2)),
          a: parseFloat(f[mono]['0 ColorRGBA LightColor']['0 float a'].toFixed(2)),
        }
      }
    }
  }

  function collision (f) {
    return {
      bPlayerProjectile: !!f[mono]['1 UInt8 bPlayerProjectile'] || undefined,
      bEnemyProjectile: !!f[mono]['1 UInt8 bEnemyProjectile'] || undefined,
      bSlide: !!f[mono]['1 UInt8 bSlide'] || undefined,
      bPlayer: !!f[mono]['1 UInt8 bPlayer'] || undefined,
      bEnemy: !!f[mono]['1 UInt8 bEnemy'] || undefined,
      bSkipWorld: !!f[mono]['1 UInt8 bSkipWorld'] || undefined,
      bSlowedDownByWater: !!f[mono]['1 UInt8 bSlowedDownByWater'] || undefined,
      bBlockedByLava: !!f[mono]['1 UInt8 bBlockedByLava'] || undefined,
      bFlying: !!f[mono]['1 UInt8 bFlying'] || undefined
    }
  }


  let folderName1 = 'ItemDefinition'
  if (folder[folderName1]) {
    fs.mkdirSync(path.join(__dirname, 'Patch', folderName1))
    var count = 0
    var announceAtNextCount = 500
    fs.readdirSync(folder[folderName1]).forEach(val => {
      var file = require(path.join(folder[folderName1], val))
      var itemDefinition = {
        name: (translate[file[mono]['1 string Name']] || file[mono]['1 string Name']),
        alias: (translate[file[mono]['1 string Name']] || file[mono]['1 string Name']) === require(path.join(folder['Other'], fileMap(file[mono][ptrGameObject][fileID]) + file[mono][ptrGameObject][pathID] + '.json'))[game][stringName]
          ? undefined
          : require(path.join(folder['Other'], fileMap(file[mono][ptrGameObject][fileID]) + file[mono][ptrGameObject][pathID] + '.json'))[game][stringName],
        description: file[mono]['1 string Description'].length > 0 ? typeof translate[file[mono]['1 string Description']] === 'string' ? translate[file[mono]['1 string Description']] : file[mono]['1 string Description'] : undefined,
        premiumOffer: file[mono]['1 string PremiumOffer'].length > 0 ? (translate[file[mono]['1 string PremiumOffer']] || file[mono]['1 string PremiumOffer']) : undefined,
        price: file[mono]['0 int Price'] || undefined,
        sellPrice: file[mono]['0 int SellPrice'] || undefined,
        consumable: !!file[mono]['1 UInt8 bConsumable'] || undefined,
        consumableEffect: file[mono]['0 PPtr<$StatusEffect> ConsumableEffectPrefab'][pathID] ?
          statusEffect(null, require(path.join(folder['StatusEffect'], fileMap(file[mono]['0 PPtr<$StatusEffect> ConsumableEffectPrefab'][fileID]) + file[mono]['0 PPtr<$StatusEffect> ConsumableEffectPrefab'][pathID] + '.json')))
          : undefined,
        requiredLevel: file[mono]['0 int RequiredLevel'],
        type: Object.keys(itemClassEnum).map(e => {
          if (itemClassEnum[e] === file[mono]['0 int Class']) return e
          else return undefined
        }).filter(Boolean).join(''),
        autoRedeem: !!file[mono]['1 UInt8 autoRedeem'] || undefined,
        ability: file[mono]['0 PPtr<$BaseSpecialAbility> Ability'][pathID] ? (function () {
          var f = require(path.join(folder['Other'], fileMap(file[mono]['0 PPtr<$BaseSpecialAbility> Ability'][fileID]) + file[mono]['0 PPtr<$BaseSpecialAbility> Ability'][pathID] + '.json'))
          return {
            name: require(path.join(folder['Other'], fileMap(f[mono][ptrGameObject][fileID]) + f[mono][ptrGameObject][pathID] + '.json'))[game][stringName],
            pets: f[mono]['0 Array pets'] && f[mono]['0 Array pets'].length > 0
              ? f[mono]['0 Array pets'].map(v => {
                return {
                  alias: require(path.join(folder['Other'], fileMap(v['0 Deity.Shared.PetOptions data']['0 PPtr<$GameObject> PetPrefab'][fileID]) + v['0 Deity.Shared.PetOptions data']['0 PPtr<$GameObject> PetPrefab'][pathID] + '.json'))[game][stringName]
                }
              }) : undefined,
            markPrefab: f[mono]['0 PPtr<$GameObject> MarkPrefab'] && f[mono]['0 PPtr<$GameObject> MarkPrefab'][pathID]
              ? {
                alias: require(path.join(folder['Other'], fileMap(f[mono]['0 PPtr<$GameObject> MarkPrefab'][fileID]) + f[mono]['0 PPtr<$GameObject> MarkPrefab'][pathID] + '.json'))[game][stringName]
              }
              : undefined,
            /* f[mono]['0 PPtr<$PlayerOwnedObject> prefab'] Ward, needed? */
            projectilesOnActivate: f[mono]['0 Array ProjectilesOnActivate'] && f[mono]['0 Array ProjectilesOnActivate'].length > 0
              ? f[mono]['0 Array ProjectilesOnActivate'].map(v => {
                return v['0 int data']
              }) : undefined,
            statusEffectsOnActivate: f[mono]['0 Array StatusEffectsOnActivate'] && f[mono]['0 Array StatusEffectsOnActivate'].length > 0
              ? f[mono]['0 Array StatusEffectsOnActivate'].map(v => {
                var z = require(path.join(folder['StatusEffect'], fileMap(v['0 PPtr<$StatusEffect> data'][fileID]) + v['0 PPtr<$StatusEffect> data'][pathID] + '.json'))
                return statusEffect(null, z)
              }) : undefined,
            statusEffectsOnDeactivate: f[mono]['0 Array StatusEffectsOnDeactivate'] && f[mono]['0 Array StatusEffectsOnDeactivate'].length > 0
              ? f[mono]['0 Array StatusEffectsOnDeactivate'].map(v => {
                var z = require(path.join(folder['StatusEffect'], fileMap(v['0 PPtr<$StatusEffect> data'][fileID]) + v['0 PPtr<$StatusEffect> data'][pathID] + '.json'))
                return statusEffect(null, z)
              }) : undefined,
            statusEffectWhenCharging: f[mono]['0 Array StatusEffectsWhenCharging'] && f[mono]['0 Array StatusEffectsWhenCharging'].length > 0
              ? f[mono]['0 Array StatusEffectsWhenCharging'].map(v => {
                var z = require(path.join(folder['StatusEffect'], fileMap(v['0 PPtr<$StatusEffect> data'][fileID]) + v['0 PPtr<$StatusEffect> data'][pathID] + '.json'))
                return statusEffect(null, z)
              }) : undefined,
            chargingProjectileAutoFireRate: f[mono]['0 float ChargingProjectileAutoFireRate'] ? parseFloat(f[mono]['0 float ChargingProjectileAutoFireRate'].toFixed(2)) : undefined,
            specialAbilityDuration: f[mono]['0 float SpecialAbilityDuration'] ? parseFloat(f[mono]['0 float SpecialAbilityDuration'].toFixed(2)) : undefined,
            timeToPauseAfterCharge: f[mono]['0 float TimeToPauseAfterCharge'] ? parseFloat(f[mono]['0 float TimeToPauseAfterCharge'].toFixed(2)) : undefined,
            chargingAnimType: f[mono]['0 int ChargingAnimType'] ? parseFloat(f[mono]['0 int ChargingAnimType'].toFixed(2)) : undefined,
            useDelay: f[mono]['0 float UseDelay'] ? parseFloat(f[mono]['0 float UseDelay'].toFixed(2)) : undefined,
            projectileIndex: f[mono]['0 int ProjectileIndex'],
            minionProjectileIndex: f[mono]['0 int MinionProjectileIndex'] > -1 ? f[mono]['0 int MinionProjectileIndex'] : undefined,
            mode: f[mono]['0 int Mode'],
            projectileOnDeactivate: f[mono]['0 int ProjectileOnDeactivate'] && f[mono]['0 int ProjectileOnDeactivate'] > -1 ? f[mono]['0 int ProjectileOnDeactivate'] : undefined,
            projectileWhenActive: f[mono]['0 int ProjectileWhenActive'] && f[mono]['0 int ProjectileWhenActive'] > -1 ? f[mono]['0 int ProjectileWhenActive'] : undefined,
            projectileWhenCharging: f[mono]['0 int ProjectileWhenCharging'] && f[mono]['0 int ProjectileWhenCharging'] > -1 ? f[mono]['0 int ProjectileWhenCharging'] : undefined,
            activateSnd: f[mono]['1 string activateSnd'] && f[mono]['1 string activateSnd'].length > 0 ? f[mono]['1 string activateSnd'] : undefined,
            aimSnd: f[mono]['1 string aimSnd'] && f[mono]['1 string aimSnd'].length > 0 ? f[mono]['1 string aimSnd'] : undefined,
            fireSnd: f[mono]['1 string fireSnd'] && f[mono]['1 string fireSnd'].length > 0 ? f[mono]['1 string fireSnd'] : undefined,
            markSnd: f[mono]['1 string markSnd'] && f[mono]['1 string markSnd'].length > 0 ? f[mono]['1 string markSnd'] : undefined,
            disableOtherSpecials: !!f[mono]['1 UInt8 disableOtherSpecials'] || undefined,
            secondaryTogglesOff: !!f[mono]['1 UInt8 SecondaryTogglesOff'] || undefined,
            autoTarget: f[mono]['1 UInt8 AutoTarget'] ? !!f[mono]['1 UInt8 AutoTarget'] : undefined,
            range: f[mono]['0 float Range'] ? parseFloat(f[mono]['0 float Range'].toFixed(2)) : undefined,
            maxTargets: f[mono]['0 int MaxTargets'] || undefined
          }
        })() : undefined,
        maxStack: file[mono]['0 int MaxStackAmount'],
        tier: file[mono]['0 int Tier'],
        data: require(path.join(folder['Other'], fileMap(file[mono][ptrGameObject][fileID]) + file[mono][ptrGameObject][pathID] + '.json'))[game][vectorComponent][array].map(v => {
          if (!fs.existsSync(path.join(folder['Other'], fileMap(v[pairData][componentSecond][fileID]) + v[pairData][componentSecond][pathID] + '.json'))) return undefined
          var f = require(path.join(folder['Other'], fileMap(v[pairData][componentSecond][fileID]) + v[pairData][componentSecond][pathID] + '.json'))
          if (f[mono] && typeof f[mono]['0 int netObjectType'] === 'number') return undefined
          if (f[mono] && f[mono]['0 float CraftingTime'] > 0) {
            return {
              crafting: {
                craftingTime: parseFloat(f[mono]['0 float CraftingTime'].toFixed(2)),
                leveledRecipes: f[mono]['0 Array LeveledRecipes'].length > 0
                  ? f[mono]['0 Array LeveledRecipes'].map(v => {
                    return {
                      level: v['0 Deity.Shared.Recipe data']['0 int Level'],
                      craftingTime: parseFloat(v['0 Deity.Shared.Recipe data']['0 float CraftingTime'].toFixed(2)),
                      requiredItems: v['0 Deity.Shared.Recipe data']['0 Array RequiredItems'].map(v => {
                        var f = require(path.join(folder['ItemDefinition'], fileMap(v['0 Deity.Shared.CraftRecipeItem data']['0 PPtr<$ItemDefinition> item'][fileID]) + v['0 Deity.Shared.CraftRecipeItem data']['0 PPtr<$ItemDefinition> item'][pathID] + '.json'))
                        return {
                          name: translate[f[mono]['1 string Name']] || f[mono]['1 string Name'],
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
                requiredItems: f[mono]['0 Array RequiredItems'].map(v => {
                  var f = require(path.join(folder['ItemDefinition'], fileMap(v['0 Deity.Shared.CraftRecipeItem data']['0 PPtr<$ItemDefinition> item'][fileID]) + v['0 Deity.Shared.CraftRecipeItem data']['0 PPtr<$ItemDefinition> item'][pathID] + '.json'))
                  return {
                    name: translate[f[mono]['1 string Name']] || f[mono]['1 string Name'],
                    count: v['0 Deity.Shared.CraftRecipeItem data']['0 unsigned int count'],
                    requiredLevel: v['0 Deity.Shared.CraftRecipeItem data']['0 unsigned int requiredLevel']
                  }
                }),
                craftCost: f[mono]['0 int CraftCost'],
                craftNowCost: f[mono]['0 int CraftNowCost'],
                craftingStat: Object.keys(statEnum).map(e => {
                  if (statEnum[e] === f[mono]['0 int CraftingStat']) return e
                  else return undefined
                }).filter(Boolean).join(''),
                craftingCategory: Object.keys(craftingCategoryEnum).map(e => {
                  if (craftingCategoryEnum[e] === f[mono]['0 int craftingCategory']) return e
                  else return undefined
                }).filter(Boolean).join('')
              }
            }
          } else if (f[mono] && typeof f[mono]['1 string estimatedPrice'] === 'string') {
            return {
              sale: {
                packName: f[mono]['1 string packName'].length > 0 ? f[mono]['1 string packName'] : undefined,
                estimatedPrice: f[mono]['1 string estimatedPrice'],
                price: f[mono]['1 string price']
              }
            }
          } else if (f[mono] && f[mono]['1 UInt8 IsAccountBound']) {
            return {
              isAccountBound: !!f[mono]['1 UInt8 IsAccountBound']
            }
          } else if (f[mono] && f[mono]['0 Array snds']) {
            return {
              sounds: f[mono]['0 Array snds'].map(sound => sound['1 string data'])
            }
          } else if (f[mono] && f[mono]['1 UInt8 isCardPack']) {
            return {
              isCardPack: !!f[mono]['1 UInt8 isCardPack']
            }
          } else if (f[mono] && typeof f[mono]['0 float timeToFuse'] === 'number') {
            return {
              socketableItem: {
                craftTime: parseFloat(f[mono]['0 float craftTime'].toFixed(2)),
                costToApply: f[mono]['0 int costToApply'],
                timeToFuse: parseFloat(f[mono]['0 float timeToFuse'].toFixed(2)),
                isGenericCharm: !!f[mono]['1 UInt8 IsGenericCharm'] || undefined
              }
            }
          } else if (f[mono] && f[mono]['0 Array NearbySpawnersToActivate']) {
            return {
              nearbySpawnersToActivate: {
                spawners: f[mono]['0 Array NearbySpawnersToActivate'].map(v => {
                  var f = require(path.join(folder['Other'], fileMap(v['0 PPtr<$Spawner> data'][fileID]) + v['0 PPtr<$Spawner> data'][pathID] + '.json'))
                  return {
                    name: require(path.join(folder['Other'], fileMap(f[mono][ptrGameObject][fileID]) + f[mono][ptrGameObject][pathID] + '.json'))[game][stringName]
                  }
                }),
                nearbySpawnerRange: f[mono]['0 int NearbySpawnerRange']
              }
            }
          } else if (f[mono] && f[mono]['0 Array prequisites']) {
            return f[mono]['0 Array prequisites'].length > 0 ? {
              prequisites: f[mono]['0 Array prequisites'].map(v => {
                var f = require(path.join(folder['Other'], fileMap(v['0 PPtr<$Relic> data'][fileID]) + v['0 PPtr<$Relic> data'][pathID] + '.json'))
                return {
                  alias: require(path.join(folder['Other'], fileMap(f[mono][ptrGameObject][fileID]) + f[mono][ptrGameObject][pathID] + '.json'))[game][stringName]
                }
              })
            } : undefined
          } else if (f[mono] && f[mono]['0 PPtr<$ItemModifier> temporaryModifierToApply']) {
            var f = require(path.join(folder['Other'], fileMap(f[mono]['0 PPtr<$ItemModifier> temporaryModifierToApply'][fileID]) + f[mono]['0 PPtr<$ItemModifier> temporaryModifierToApply'][pathID] + '.json'))
            return {
              temporaryModifierToApply: {
                craftLevelDeduction: f[mono]['0 int craftLevelDeduction'],
                nameMod: f[mono]['1 string nameMod'].length > 0 ? translate[f[mono]['1 string nameMod']] || f[mono]['1 string nameMod'] : undefined,
                equipmentSet: f[mono]['0 PPtr<$EquipmentSet> Set'][pathID]
                  ? (function () {
                    var e = require(path.join(folder['Other'], fileMap(f[mono]['0 PPtr<$EquipmentSet> Set'][fileID]) + f[mono]['0 PPtr<$EquipmentSet> Set'][pathID] + '.json'))
                    return {
                      name: require(path.join(folder['Other'], fileMap(e[mono][ptrGameObject][fileID]) + e[mono][ptrGameObject][pathID] + '.json'))[game][stringName],
                      description: translate[e[mono]['1 string Description']] || e[mono]['1 string Description'],
                      minimumRequiredAmount: e[mono]['0 int minimumNumberOfItemsToEnable'],
                      stats: e[mono]['0 Array stat'].map(v => {
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
                expireTime: parseFloat(f[mono]['0 float expireTime'].toFixed(2)),
                validClasses: Object.keys(classEnum).map(e => {
                  if (e !== 'None' && classEnum[e] === f[mono]['0 int validEquipMask']) return e
                  else if (e !== 'None' && hasFlag(f[mono]['0 int validEquipMask'], classEnum[e])) return e
                  else return undefined
                }).filter(Boolean),
                type: Object.keys(itemClassEnum).map(e => {
                  if (e !== 'None' && itemClassEnum[e] === f[mono]['0 int validClasses']) return e
                  else if (e !== 'None' && hasFlag(f[mono]['0 int validClasses'], itemClassEnum[e])) return e
                  else return undefined
                }).filter(Boolean),
                minTier: f[mono]['0 int minTier'],
                maxTier: f[mono]['0 int maxTier'],
                chanceToApply: parseFloat(f[mono]['0 float chanceToApply'].toFixed(2)),
                stats: f[mono]['0 Array stat'].length > 0 ? f[mono]['0 Array stat'].map(v => {
                  return {
                    key: Object.keys(statEnum).map(e => {
                      if (statEnum[e] === v['0 Deity.Shared.Stat data']['0 int key']) return e
                      else return undefined
                    }).filter(Boolean).join(''),
                    equation: v['0 Deity.Shared.Stat data']['1 string equation'],
                    value: parseFloat(v['0 Deity.Shared.Stat data']['0 float value'].toFixed(2))
                  }
                }) : undefined,
                category: Object.keys(itemModifierCategoryEnum).map(e => {
                  if (itemModifierCategoryEnum[e] === f[mono]['0 int category']) return e
                  else return undefined
                }).filter(Boolean).join('')
              }
            }
          } else if (f[mono] && f[mono]['1 string emojiCode']) {
            return {
              emoji: {
                displayName: translate[f[mono]['1 string displayName']] || f[mono]['1 string displayName'],
                emojiCode: f[mono]['1 string emojiCode']
              }
            }
          } else if (f[mono] && typeof f[mono]['0 int unlockTier'] === 'number') {
            return {
              unlockTier: f[mono]['0 int unlockTier']
            }
          } else if (f[mono] && f[mono]['0 PPtr<$Sprite> m_Sprite'] && f[mono]['0 PPtr<$Sprite> m_Sprite'][pathID]) {
            var srd = require(path.join(folder['Other'], fileMap(f[mono]['0 PPtr<$Sprite> m_Sprite'][fileID]) + f[mono]['0 PPtr<$Sprite> m_Sprite'][pathID] + '.json'))['0 Sprite Base']['1 SpriteRenderData m_RD']
            var s = require(path.join(folder['Other'], fileMap(srd['0 PPtr<Texture2D> texture'][fileID]) + srd['0 PPtr<Texture2D> texture'][pathID] + '.json'))['0 Texture2D Base']
            return {
              sprite: {
                name: s[stringName],
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
                  r: parseFloat(f[mono]['0 ColorRGBA m_Color']['0 float r'].toFixed(2)),
                  g: parseFloat(f[mono]['0 ColorRGBA m_Color']['0 float g'].toFixed(2)),
                  b: parseFloat(f[mono]['0 ColorRGBA m_Color']['0 float b'].toFixed(2)),
                  a: parseFloat(f[mono]['0 ColorRGBA m_Color']['0 float a'].toFixed(2)),
                }
              }
            }
          } else return undefined
        }).filter(Boolean),
        stats: file[mono]['0 Array stat'].length > 0 ? file[mono]['0 Array stat'].map(v => {
          return {
            key: Object.keys(statEnum).map(e => {
              if (statEnum[e] === v['0 Deity.Shared.Stat data']['0 int key']) return e
              else return undefined
            }).filter(Boolean).join(''),
            equation: v['0 Deity.Shared.Stat data']['1 string equation'],
            value: parseFloat(v['0 Deity.Shared.Stat data']['0 float value'].toFixed(2))
          }
        }) : undefined,
        experiencePerLevel: file[mono]['0 Array ExperiencePerLevel'].map(v => {
          return v['0 int data']
        }),
        class: file[mono]['0 int EquipMask'] ? Object.keys(classEnum).map(e => {
          if (e !== 'None' && classEnum[e] === file[mono]['0 int EquipMask']) return e
          else if (e !== 'None' && hasFlag(file[mono]['0 int EquipMask'], classEnum[e])) return e
          else return undefined
        }).filter(Boolean) : undefined,
        modifiers: file[mono]['0 Array initialModifiers'].length > 0
          ? file[mono]['0 Array initialModifiers'].map(v => {
            var f = require(path.join(folder['Other'], fileMap(v['0 PPtr<$ItemModifier> data'][fileID]) + v['0 PPtr<$ItemModifier> data'][pathID] + '.json'))
            if (f[mono] && f[mono]['0 PPtr<$EquipmentSet> Set']) {
              return {
                nameMod: f[mono]['1 string nameMod'].length > 0 ? translate[f[mono]['1 string nameMod']] || f[mono]['1 string nameMod'] : undefined,
                equipmentSet: f[mono]['0 PPtr<$EquipmentSet> Set'][pathID]
                  ? (function () {
                    var e = require(path.join(folder['Other'], fileMap(f[mono]['0 PPtr<$EquipmentSet> Set'][fileID]) + f[mono]['0 PPtr<$EquipmentSet> Set'][pathID] + '.json'))
                    return {
                      name: require(path.join(folder['Other'], fileMap(e[mono][ptrGameObject][fileID]) + e[mono][ptrGameObject][pathID] + '.json'))[game][stringName],
                      description: translate[e[mono]['1 string Description']] || e[mono]['1 string Description'],
                      minimumRequiredAmount: e[mono]['0 int minimumNumberOfItemsToEnable'],
                      stats: e[mono]['0 Array stat'].map(v => {
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
                expireTime: parseFloat(f[mono]['0 float expireTime'].toFixed(2)),
                validClasses: Object.keys(classEnum).map(e => {
                  if (e !== 'None' && classEnum[e] === f[mono]['0 int validEquipMask']) return e
                  else if (e !== 'None' && hasFlag(f[mono]['0 int validEquipMask'], classEnum[e])) return e
                  else return undefined
                }).filter(Boolean),
                type: Object.keys(itemClassEnum).map(e => {
                  if (e !== 'None' && itemClassEnum[e] === f[mono]['0 int validClasses']) return e
                  else if (e !== 'None' && hasFlag(f[mono]['0 int validClasses'], itemClassEnum[e])) return e
                  else return undefined
                }).filter(Boolean),
                minTier: f[mono]['0 int minTier'],
                maxTier: f[mono]['0 int maxTier'],
                chanceToApply: parseFloat(f[mono]['0 float chanceToApply'].toFixed(2)),
                stats: f[mono]['0 Array stat'].length > 0 ? f[mono]['0 Array stat'].map(v => {
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
        bonusDismantleLoot: file[mono]['0 PPtr<$LootTable> BonusDismantleLoot'][pathID]
          ? (function () {
            var lootTable = require(path.join(folder['LootTable'], fileMap(file[mono]['0 PPtr<$LootTable> BonusDismantleLoot'][fileID]) + file[mono]['0 PPtr<$LootTable> BonusDismantleLoot'][pathID] + '.json'))
            return require(path.join(folder['Other'], fileMap(lootTable[mono][ptrGameObject][fileID]) + lootTable[mono][ptrGameObject][pathID] + '.json'))[game][stringName]
          })()
          : undefined,
        fusionUpgradeItem: file[mono]['0 PPtr<$ItemDefinition> FusionUpgradeItem'][pathID]
          ? (function () {
            var f = require(path.join(folder['ItemDefinition'], fileMap(file[mono]['0 PPtr<$ItemDefinition> FusionUpgradeItem'][fileID]) + file[mono]['0 PPtr<$ItemDefinition> FusionUpgradeItem'][pathID] + '.json'))[mono]
            return translate[f['1 string Name']] || f['1 string Name']
          })()
          : undefined,
        bound: file[mono]['1 UInt8 AlwaysSoulbound'] || file[mono]['1 UInt8 AlwaysAccountbound'] ? {
          account: file[mono]['1 UInt8 AlwaysSoulbound'] ? !!file[mono]['1 UInt8 AlwaysSoulbound'] : undefined,
          soul: file[mono]['1 UInt8 AlwaysAccountbound'] ? !!file[mono]['1 UInt8 AlwaysAccountbound'] : undefined
        } : undefined,
        isHeirloom: file[mono]['1 UInt8 IsHeirloomItem'] ? !!file[mono]['1 UInt8 IsHeirloomItem'] : undefined,
        requiresDiscovery: file[mono]['1 UInt8 RequiresDiscovery'] ? !!file[mono]['1 UInt8 RequiresDiscovery'] : undefined,
        recoverCost: file[mono]['0 int RecoverCost'] || undefined,
        insureCost: file[mono]['0 int InsureCost'] || undefined,
        currency: file[mono]['0 PPtr<$GameObject> Currency'][pathID]
          ? require(path.join(folder['Other'], fileMap(file[mono]['0 PPtr<$GameObject> Currency'][fileID]) + file[mono]['0 PPtr<$GameObject> Currency'][pathID] + '.json'))[game][stringName]
          : undefined,
        coolDown: parseFloat(file[mono]['0 float CoolDown'].toFixed(2)) ? parseFloat(file[mono]['0 float CoolDown'].toFixed(2)) : undefined,
        craftNowCostMultiplier: parseFloat(file[mono]['0 float CraftNowCostMultiplier'].toFixed(2)) === 1 ? undefined : parseFloat(file[mono]['0 float CraftNowCostMultiplier'].toFixed(2)),
        modifierChance: parseFloat(file[mono]['0 float ModifierChance'].toFixed(2)),
        craftingRarity: file[mono]['0 int craftingRarity']
          ? [
            craftingRarityEnumAndValue[Object.keys(craftingRarityEnumAndValue)[file[mono]['0 int craftingRarity']]],
            Object.keys(craftingRarityEnumAndValue)[file[mono]['0 int craftingRarity']]
          ]
          : undefined,
        doesNotCountTowardMax: file[mono]['1 UInt8 DoesntCountTowardMax'] ? !!file[mono]['1 UInt8 DoesntCountTowardMax'] : undefined
      }

      var filename = path.join(__dirname, 'Patch', folderName1, `${itemDefinition.name.replace(/[\/\?\<\>\\\:\*\|\"]/g, '')}.json`)
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
        from: require(path.join(folder['Other'], fileMap(file[mono][ptrGameObject][fileID]) + file[mono][ptrGameObject][pathID] + '.json'))[game][stringName],
        guaranteeItemCount: file[mono]['0 int guaranteeItemCount'],
        maximumItemCount: file[mono]['0 int maximumItemCount'],
        lootTable: file[mono]['0 Array lootTable'].map(v => {
          return {
            item: translate[require(path.join(folder['ItemDefinition'], fileMap(v['0 Deity.Shared.LootEntry data']['0 PPtr<$ItemDefinition> item'][fileID]) + v['0 Deity.Shared.LootEntry data']['0 PPtr<$ItemDefinition> item'][pathID] + '.json'))[mono]['1 string Name']] || require(path.join(folder['ItemDefinition'], fileMap(v['0 Deity.Shared.LootEntry data']['0 PPtr<$ItemDefinition> item'][fileID]) + v['0 Deity.Shared.LootEntry data']['0 PPtr<$ItemDefinition> item'][pathID] + '.json'))[mono]['1 string Name'],
            count: {
              dice: v['0 Deity.Shared.LootEntry data']['0 Deity.Shared.DiceParm count']['0 int dice'],
              faces: v['0 Deity.Shared.LootEntry data']['0 Deity.Shared.DiceParm count']['0 int faces'],
              add: v['0 Deity.Shared.LootEntry data']['0 Deity.Shared.DiceParm count']['0 int add']
            },
            chance: v['0 Deity.Shared.LootEntry data']['0 double chance'],
            allowModifiers: !!v['0 Deity.Shared.LootEntry data']['1 UInt8 allowModifiers'] || undefined
          }
        }),
        reference: file[mono]['0 PPtr<$LootTable> ReferenceObject'][pathID] > 0
          ? (function () {
            var lootTable = require(path.join(folder['LootTable'], fileMap(file[mono]['0 PPtr<$LootTable> ReferenceObject'][fileID]) + file[mono]['0 PPtr<$LootTable> ReferenceObject'][pathID] + '.json'))
            return require(path.join(folder['Other'], fileMap(lootTable[mono][ptrGameObject][fileID]) + lootTable[mono][ptrGameObject][pathID] + '.json'))[game][stringName]
          })()
          : undefined,
        questLootTable: file[mono]['0 PPtr<$GameObject> questTargetTrigger'] && file[mono]['0 PPtr<$GameObject> questTargetTrigger'][pathID] > 0
          ? (function () {
            var lootTable = require(path.join(folder['Other'], fileMap(file[mono]['0 PPtr<$GameObject> questTargetTrigger'][fileID]) + file[mono]['0 PPtr<$GameObject> questTargetTrigger'][pathID] + '.json'))[game]
            return {
              name: lootTable[stringName]
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
        name: file[mono]['1 string MonsterName'].length > 0
          ? (translate[file[mono]['1 string MonsterName']] || file[mono]['1 string MonsterName'])
          : require(path.join(folder['Other'], fileMap(file[mono][ptrGameObject][fileID]) + file[mono][ptrGameObject][pathID] + '.json'))[game][stringName],
        alias: file[mono]['1 string MonsterName'].length > 0
          ? (translate[file[mono]['1 string MonsterName']] || file[mono]['1 string MonsterName']) === require(path.join(folder['Other'], fileMap(file[mono][ptrGameObject][fileID]) + file[mono][ptrGameObject][pathID] + '.json'))[game][stringName]
            ? undefined
            : require(path.join(folder['Other'], fileMap(file[mono][ptrGameObject][fileID]) + file[mono][ptrGameObject][pathID] + '.json'))[game][stringName]
          : undefined,
        description: file[mono]['1 string MonsterDescription'].length > 0 ? translate[file[mono]['1 string MonsterDescription']] || file[mono]['1 string MonsterDescription'] : undefined,
        isBoss: !!file[mono]['1 UInt8 IsBoss'] || undefined,
        isElite: !!file[mono]['1 UInt8 IsElite'] || undefined,
        isSetPieceMonster: !!file[mono]['1 UInt8 IsSetPieceMonster'] || undefined,
        weapons: file[mono]['0 Array WeaponPrefabs'].map(v => {
          if (!fs.existsSync(path.join(folder['Other'], fileMap(v[ptrGameObjectData][fileID]) + v[ptrGameObjectData][pathID] + '.json'))) return undefined
          var w = require(path.join(folder['Other'], fileMap(v[ptrGameObjectData][fileID]) + v[ptrGameObjectData][pathID] + '.json'))
          if (w) return {
            name: w[game][stringName],
            data: w[game][vectorComponent][array].map(v => {
              if (!fs.existsSync(path.join(folder['Other'], fileMap(v[pairData][componentSecond][fileID]) + v[pairData][componentSecond][pathID] + '.json'))) return undefined
              var f = require(path.join(folder['Other'], fileMap(v[pairData][componentSecond][fileID]) + v[pairData][componentSecond][pathID] + '.json'))
              if (f[mono] && f[mono]['1 string ProjectileName']) {
                return projectile(f)
              } else if (f['0 SpriteRenderer Base'] && f['0 SpriteRenderer Base']['0 PPtr<Sprite> m_Sprite'][pathID]) {
                var srd = require(path.join(folder['Other'], fileMap(f['0 SpriteRenderer Base']['0 PPtr<Sprite> m_Sprite'][fileID]) + f['0 SpriteRenderer Base']['0 PPtr<Sprite> m_Sprite'][pathID] + '.json'))['0 Sprite Base']['1 SpriteRenderData m_RD']
                var s = require(path.join(folder['Other'], fileMap(srd['0 PPtr<Texture2D> texture'][fileID]) + srd['0 PPtr<Texture2D> texture'][pathID] + '.json'))['0 Texture2D Base']
                return {
                  sprite: {
                    name: s[stringName],
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
        data: require(path.join(folder['Other'], fileMap(file[mono][ptrGameObject][fileID]) + file[mono][ptrGameObject][pathID] + '.json'))[game][vectorComponent][array].map(v => {
          if (fs.existsSync(path.join(folder['LootTable'], fileMap(v[pairData][componentSecond][fileID]) + v[pairData][componentSecond][pathID] + '.json'))) {
            var f = require(path.join(folder['LootTable'], fileMap(v[pairData][componentSecond][fileID]) + v[pairData][componentSecond][pathID] + '.json'))
            if (f[mono] && (f[mono]['0 Array lootTable'].length > 0 || f[mono]['0 PPtr<$LootTable> ReferenceObject'][pathID] > 0)) {
              return {
                loot: {
                  lootTable: {
                    name: require(path.join(folder['Other'], fileMap(f[mono][ptrGameObject][fileID]) + f[mono][ptrGameObject][pathID] + '.json'))[game][stringName]
                  },
                  // ...f[mono]['0 Array lootTable'].length > 0 ? {
                  // guaranteeItemCount: f[mono]['0 int guaranteeItemCount'],
                  // maximumItemCount: f[mono]['0 int maximumItemCount'],
                  // lootTable: f[mono]['0 Array lootTable'].map(v => {
                  //   return {
                  //     item: translate[require(path.join(folder['ItemDefinition'], fileMap(v['0 Deity.Shared.LootEntry data']['0 PPtr<$ItemDefinition> item'][fileID]) + v['0 Deity.Shared.LootEntry data']['0 PPtr<$ItemDefinition> item'][pathID] + '.json'))[mono]['1 string Name']] || require(path.join(folder['ItemDefinition'], fileMap(v['0 Deity.Shared.LootEntry data']['0 PPtr<$ItemDefinition> item'][fileID]) + v['0 Deity.Shared.LootEntry data']['0 PPtr<$ItemDefinition> item'][pathID] + '.json'))[mono]['1 string Name'],
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
          if (!fs.existsSync(path.join(folder['Other'], fileMap(v[pairData][componentSecond][fileID]) + v[pairData][componentSecond][pathID] + '.json'))) return undefined
          var f = require(path.join(folder['Other'], fileMap(v[pairData][componentSecond][fileID]) + v[pairData][componentSecond][pathID] + '.json'))
          if (f[mono] && typeof f[mono]['0 int netObjectType'] === 'number') return undefined
          else if (f[mono] && f[mono]['0 Array stat'] && f[mono]['0 Array stat'].length > 0) {
            return {
              stats: f[mono]['0 Array stat'].map(v => {
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
          } else if (f[mono] && f[mono]['0 Deity.Shared.CollisionShape shape']) {
            return collision(f)
          } else if (f['0 SpriteRenderer Base'] && f['0 SpriteRenderer Base']['0 PPtr<Sprite> m_Sprite'][pathID]) {
            var srd = require(path.join(folder['Other'], fileMap(f['0 SpriteRenderer Base']['0 PPtr<Sprite> m_Sprite'][fileID]) + f['0 SpriteRenderer Base']['0 PPtr<Sprite> m_Sprite'][pathID] + '.json'))['0 Sprite Base']['1 SpriteRenderData m_RD']
            var s = require(path.join(folder['Other'], fileMap(srd['0 PPtr<Texture2D> texture'][fileID]) + srd['0 PPtr<Texture2D> texture'][pathID] + '.json'))['0 Texture2D Base']
            return {
              sprite: {
                name: s[stringName],
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
          } else if (f[mono] && f[mono]['0 Array snds'] && f[mono]['0 Array snds'].length > 0) {
            return {
              sound: {
                soundType: Object.keys(soundListEnum).map(e => {
                  if (soundListEnum[e] === f[mono]['0 int soundListType']) return e
                  else return undefined
                }).filter(Boolean).join(''),
                sounds: f[mono]['0 Array snds'].map(v => {
                  return v['1 string data']
                }),
              }
            }
          } else if (f[mono] && f[mono]['0 Array healthDialogue'] && f[mono]['0 Array healthDialogue'].length > 0) {
            return {
              healthDialogue: f[mono]['0 Array healthDialogue'].map(v => {
                return {
                  healthPercentage: parseFloat(v['0 Deity.HealthDialogue data']['0 float percentage'].toFixed(2)),
                  message: translate[v['0 Deity.HealthDialogue data']['1 string dialogue']] || v['0 Deity.HealthDialogue data']['1 string dialogue']
                }
              })
            }
          } else if (f[mono] && f[mono]['0 Array dialogue'] && f[mono]['0 Array dialogue'].length > 0) {
            return {
              dialogue: f[mono]['0 Array dialogue'].map(v => {
                var d = require(path.join(folder['Other'], fileMap(v['0 PPtr<$AudioMessage> data'][fileID]) + v['0 PPtr<$AudioMessage> data'][pathID] + '.json'))[mono]
                return {
                  name: require(path.join(folder['Other'], fileMap(d[ptrGameObject][fileID]) + d[ptrGameObject][pathID] + '.json'))[game][stringName],
                  message: translate[d['1 string message']] || d['1 string message']
                }
              })
            }
          } else if (f[mono] && f[mono]['0 Array lootTable'] && (f[mono]['0 Array lootTable'].length > 0 || f[mono]['0 PPtr<$LootTable> ReferenceObject'][pathID] > 0)) {
            return {
              loot: {
                inheritedLootTable: f[mono]['0 PPtr<$LootTable> ReferenceObject'][pathID] > 0
                  ? (function () {
                    var lootTable = require(path.join(folder['LootTable'], fileMap(f[mono]['0 PPtr<$LootTable> ReferenceObject'][fileID]) + f[mono]['0 PPtr<$LootTable> ReferenceObject'][pathID] + '.json'))
                    return {
                      name: require(path.join(folder['Other'], fileMap(lootTable[mono][ptrGameObject][fileID]) + lootTable[mono][ptrGameObject][pathID] + '.json'))[game][stringName]
                    }
                  })()
                  : undefined,
                ...f[mono]['0 Array lootTable'].length > 0 ? {
                  guaranteeItemCount: f[mono]['0 int guaranteeItemCount'],
                  maximumItemCount: f[mono]['0 int maximumItemCount'],
                  lootTable: f[mono]['0 Array lootTable'].map(v => {
                    return {
                      item: translate[require(path.join(folder['ItemDefinition'], fileMap(v['0 Deity.Shared.LootEntry data']['0 PPtr<$ItemDefinition> item'][fileID]) + v['0 Deity.Shared.LootEntry data']['0 PPtr<$ItemDefinition> item'][pathID] + '.json'))[mono]['1 string Name']] || require(path.join(folder['ItemDefinition'], fileMap(v['0 Deity.Shared.LootEntry data']['0 PPtr<$ItemDefinition> item'][fileID]) + v['0 Deity.Shared.LootEntry data']['0 PPtr<$ItemDefinition> item'][pathID] + '.json'))[mono]['1 string Name'],
                      count: {
                        dice: v['0 Deity.Shared.LootEntry data']['0 Deity.Shared.DiceParm count']['0 int dice'],
                        faces: v['0 Deity.Shared.LootEntry data']['0 Deity.Shared.DiceParm count']['0 int faces'],
                        add: v['0 Deity.Shared.LootEntry data']['0 Deity.Shared.DiceParm count']['0 int add']
                      },
                      chance: v['0 Deity.Shared.LootEntry data']['0 double chance'],
                      allowModifiers: !!v['0 Deity.Shared.LootEntry data']['1 UInt8 allowModifiers'] || undefined
                    }
                  })
                }
                  : undefined,
                questLootTable: f[mono]['0 PPtr<$GameObject> questTargetTrigger'] && f[mono]['0 PPtr<$GameObject> questTargetTrigger'][pathID] > 0
                  ? (function () {
                    var lootTable = require(path.join(folder['Other'], fileMap(f[mono]['0 PPtr<$GameObject> questTargetTrigger'][fileID]) + f[mono]['0 PPtr<$GameObject> questTargetTrigger'][pathID] + '.json'))[game]
                    return {
                      name: lootTable[stringName]
                    }
                  })()
                  : undefined
              }
            }
          } else return undefined
        }).filter(Boolean),
        zenithEffects: file[mono]['0 Array ZenithEffects'].map(v => {
          var z = require(path.join(folder['StatusEffect'], fileMap(v['0 PPtr<$StatusEffect> data'][fileID]) + v['0 PPtr<$StatusEffect> data'][pathID] + '.json'))
          return statusEffect(null, z)
        }),
        category: Object.keys(categoryEnum).map(e => {
          if (categoryEnum[e] === file[mono]['0 int Category']) return e
          else return undefined
        }).filter(Boolean).join(''),
        element: Object.keys(elementEnum).map(e => {
          if (elementEnum[e] === file[mono]['0 int Element']) return e
          else return undefined
        }).filter(Boolean).join('')
      }
      var filename = path.join(__dirname, 'Patch', folderName3, `${monsterInfo.name.replace(/[\/\?\<\>\\\:\*\|\"]/g, '')}.json`)
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
        name: (translate[file[mono]['1 string displayName']] || file[mono]['1 string displayName']),
        alias: require(path.join(folder['Other'], fileMap(file[mono][ptrGameObject][fileID]) + file[mono][ptrGameObject][pathID] + '.json'))[game][stringName],
        description: translate[file[mono]['1 string benefitDescription']] || file[mono]['1 string benefitDescription'],
        doNotAward: file[mono]['1 UInt8 DoNotAward'] > 0 ? true : false,
        data: file[mono][ptrGameObject][pathID]
          ? require(path.join(folder['Other'], fileMap(file[mono][ptrGameObject][fileID]) + file[mono][ptrGameObject][pathID] + '.json'))[game][vectorComponent][array].map(v => {
            if (!fs.existsSync(path.join(folder['Other'], fileMap(v[pairData][componentSecond][fileID]) + v[pairData][componentSecond][pathID] + '.json'))) return undefined
            var f = require(path.join(folder['Other'], fileMap(v[pairData][componentSecond][fileID]) + v[pairData][componentSecond][pathID] + '.json'))
            if (f[mono] && f[mono]['0 Array triggers']) {
              return {
                proc: {
                  name: translate[f[mono][stringName]] || require(path.join(folder['Other'], fileMap(f[mono][ptrGameObject][fileID]) + f[mono][ptrGameObject][pathID] + '.json'))[game][stringName],
                  description: translate[f[mono]['1 string Description']] || f[mono]['1 string Description'],
                  counterMax: f[mono]['0 int CounterMax'],
                  timerValue: parseFloat(f[mono]['0 float TimerValue'].toFixed(2)),
                  statusEffect: f[mono]['0 PPtr<$StatusEffect> StatusEffect'][pathID]
                    ? statusEffect(f)
                    : undefined,
                  /*projectileDamageMultiplier: parseFloat(f[mono]['0 float ProjectileDamageMultiplier'].toFixed(2)),*/ // Obscured by anti-cheat added in 2019-02-20 (? Why).
                  useAncestralBenefitForDamage: !!f[mono]['0 UInt8 UseAncestralBenefitForDamage'] || undefined,
                  triggers: f[mono]['0 Array triggers'].length > 0
                    ? f[mono]['0 Array triggers'].map(v => {
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
          if (e !== 'None' && classEnum[e] === file[mono]['0 int validArchetypes']) return e
          else if (e !== 'None' && hasFlag(file[mono]['0 int validArchetypes'], classEnum[e])) return e
          else return undefined
        }).filter(Boolean),
        rarity: Object.keys(ancestralRarityEnum).map(e => {
          if (ancestralRarityEnum[e] === file[mono]['0 int rarity']) return e
          else return undefined
        }).filter(Boolean).join(''),
        stats: file[mono]['0 Array stat'].map(v => {
          return {
            key: Object.keys(statEnum).map(e => {
              if (statEnum[e] === v['0 Deity.Shared.Stat data']['0 int key']) return e
              else return undefined
            }).filter(Boolean).join(''),
            equation: v['0 Deity.Shared.Stat data']['1 string equation'],
            value: parseFloat(v['0 Deity.Shared.Stat data']['0 float value'].toFixed(2))
          }
        }),
        ordinaries: file[mono]['0 Array ordinaries'].length > 0
          ? file[mono]['0 Array ordinaries'].map(v => {
            if (!fs.existsSync(path.join(folder['Other'], fileMap(v['0 PPtr<$Sprite> data'][fileID]) + v['0 PPtr<$Sprite> data'][pathID]) + '.json')) return undefined
            var f = require(path.join(folder['Other'], fileMap(v['0 PPtr<$Sprite> data'][fileID]) + v['0 PPtr<$Sprite> data'][pathID]) + '.json')
            if (f['0 Sprite Base'] && f['0 Sprite Base']['1 SpriteRenderData m_RD']['0 PPtr<Texture2D> texture'][pathID]) {
              var s = require(path.join(folder['Other'], fileMap(f['0 Sprite Base']['1 SpriteRenderData m_RD']['0 PPtr<Texture2D> texture'][fileID]) + f['0 Sprite Base']['1 SpriteRenderData m_RD']['0 PPtr<Texture2D> texture'][pathID] + '.json'))['0 Texture2D Base']
              return {
                sprite: {
                  name: s[stringName],
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
        sets: file[mono]['0 Array sets'].length > 0
          ? file[mono]['0 Array sets'].map(v => {
            if (!fs.existsSync(path.join(folder['Other'], fileMap(v['0 PPtr<$AncestralSet> data'][fileID]) + v['0 PPtr<$AncestralSet> data'][pathID] + '.json'))) return undefined
            var f = require(path.join(folder['Other'], fileMap(v['0 PPtr<$AncestralSet> data'][fileID]) + v['0 PPtr<$AncestralSet> data'][pathID] + '.json'))
            if (f[mono] && f[mono]['0 Array setBonuses']) {
              var filename = path.join(__dirname, 'Patch', folderName4, 'Set bonuses', `${translate[f[mono]['1 string setName']] || f[mono]['1 string setName']}.json`)
              var setBonus = {
                name: translate[f[mono]['1 string setName']] || f[mono]['1 string setName'],
                alias: require(path.join(folder['Other'], fileMap(f[mono][ptrGameObject][fileID]) + f[mono][ptrGameObject][pathID] + '.json'))[game][stringName],
                setBonuses: f[mono]['0 Array setBonuses'].length > 0
                  ? f[mono]['0 Array setBonuses'].map(v => {
                    var f = require(path.join(folder['Other'], fileMap(v['0 PPtr<$AncestralSetBonus> data'][fileID]) + v['0 PPtr<$AncestralSetBonus> data'][pathID] + '.json'))
                    return {
                      name: require(path.join(folder['Other'], fileMap(f[mono][ptrGameObject][fileID]) + f[mono][ptrGameObject][pathID] + '.json'))[game][stringName],
                      description: translate[f[mono]['1 string bonusText']] || f[mono]['1 string bonusText'],
                      requiredAmount: f[mono]['0 int requiredAmount'],
                      stats: f[mono]['0 Array stat'].map(v => {
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
                  if (!fs.existsSync(path.join(folder['Other'], fileMap(f[mono]['0 PPtr<$Sprite> icon'][fileID]) + f[mono]['0 PPtr<$Sprite> icon'][pathID]) + '.json')) return undefined
                  var s = require(path.join(folder['Other'], fileMap(f[mono]['0 PPtr<$Sprite> icon'][fileID]) + f[mono]['0 PPtr<$Sprite> icon'][pathID]) + '.json')
                  if (s['0 Sprite Base'] && s['0 Sprite Base']['1 SpriteRenderData m_RD']['0 PPtr<Texture2D> texture'][pathID]) {
                    var srd = require(path.join(folder['Other'], fileMap(s['0 Sprite Base']['1 SpriteRenderData m_RD']['0 PPtr<Texture2D> texture'][fileID]) + s['0 Sprite Base']['1 SpriteRenderData m_RD']['0 PPtr<Texture2D> texture'][pathID] + '.json'))['0 Texture2D Base']
                    return {
                      name: srd[stringName],
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
        blockedBy: file[mono]['0 Array BlockedBy'].length > 0
          ? file[mono]['0 Array BlockedBy'].map(v => {
            return require(path.join(folder['Other'], fileMap(v[ptrGameObjectData][fileID]) + v[ptrGameObjectData][pathID] + '.json'))[game][stringName]
          })
          : undefined
      }

      var filename = path.join(__dirname, 'Patch', folderName4, `${ancestral.name.replace(/[\/\?\<\>\\\:\*\|\"]/g, '')}.json`)
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
      var gameObject = require(path.join(folder['Other'], fileMap(file[mono][ptrGameObject][fileID]) + file[mono][ptrGameObject][pathID] + '.json'))[game]
      var craftingRecipe = {
        name: gameObject[stringName].split('_').pop(),
        interpretedType: gameObject[stringName].split('_')[1],
        actualName: gameObject[stringName],
        craftingTime: parseFloat(file[mono]['0 float CraftingTime'].toFixed(2)),
        leveledRecipes: file[mono]['0 Array LeveledRecipes'].map(v => {
          return {
            level: v['0 Deity.Shared.Recipe data']['0 int Level'],
            craftingTime: parseFloat(v['0 Deity.Shared.Recipe data']['0 float CraftingTime'].toFixed(2)),
            requiredItems: v['0 Deity.Shared.Recipe data']['0 Array RequiredItems'].map(v => {
              if (!fs.existsSync(path.join(folder['ItemDefinition'], fileMap(v['0 Deity.Shared.CraftRecipeItem data']['0 PPtr<$ItemDefinition> item'][fileID]) + v['0 Deity.Shared.CraftRecipeItem data']['0 PPtr<$ItemDefinition> item'][pathID] + '.json'))) return undefined
              var f = require(path.join(folder['ItemDefinition'], fileMap(v['0 Deity.Shared.CraftRecipeItem data']['0 PPtr<$ItemDefinition> item'][fileID]) + v['0 Deity.Shared.CraftRecipeItem data']['0 PPtr<$ItemDefinition> item'][pathID] + '.json'))
              return {
                name: translate[f[mono]['1 string Name']] || f[mono]['1 string Name'],
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
        craftCost: file[mono]['0 int CraftCost'],
        craftNowCost: file[mono]['0 int CraftNowCost'],
        craftingStat: Object.keys(statEnum).map(e => {
          if (statEnum[e] === file[mono]['0 int CraftingStat']) return e
          else return undefined
        }).filter(Boolean).join(''),
        craftingCategory: Object.keys(craftingCategoryEnum).map(e => {
          if (craftingCategoryEnum[e] === file[mono]['0 int craftingCategory']) return e
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
        name: require(path.join(folder['Other'], fileMap(file[mono][ptrGameObject][fileID]) + file[mono][ptrGameObject][pathID] + '.json'))[game][stringName],
        alias: '',
        description: '',
        category: Object.keys(itemModifierCategoryEnum).map(e => {
          if (itemModifierCategoryEnum[e] === file[mono]['0 int category']) return e
          else return undefined
        }).filter(Boolean).join(''),
        data: (function () {
          if (file[mono]['0 Array availableModifiers'].length < 1) return undefined
          var dataObj = []
          for (let i = 0; i < file[mono]['0 Array availableModifiers'].length; i++) {
            var f = require(path.join(folder['Other'], fileMap(file[mono]['0 Array availableModifiers'][i][ptrGameObjectData][fileID]) + file[mono]['0 Array availableModifiers'][i][ptrGameObjectData][pathID] + '.json'))
            f[game][vectorComponent][array].map(v => {
              if (fs.existsSync(path.join(folder['Other'], fileMap(v[pairData][componentSecond][fileID]) + v[pairData][componentSecond][pathID] + '.json'))) {
                var f = require(path.join(folder['Other'], fileMap(v[pairData][componentSecond][fileID]) + v[pairData][componentSecond][pathID] + '.json'))
                if (f[mono] && f[mono]['0 PPtr<$EquipmentSet> Set']) {
                  if (i === 0) dataObj.push({
                    nameMod: f[mono]['1 string nameMod'].length > 0 ? translate[f[mono]['1 string nameMod']] || f[mono]['1 string nameMod'] : undefined,
                    expireTime: parseFloat(f[mono]['0 float expireTime'].toFixed(2)),
                    chanceToApply: parseFloat(f[mono]['0 float chanceToApply'].toFixed(2)),
                    minTier: f[mono]['0 int minTier'],
                    maxTier: f[mono]['0 int maxTier']
                  })
                  return dataObj.push({
                    craftingRecipe: (function () {
                      var g = require(path.join(folder['Other'], fileMap(f[mono][ptrGameObject][fileID]) + f[mono][ptrGameObject][pathID] + '.json'))
                      var craftingRecipe
                      for (let i = 0; i < g[game][vectorComponent][array].length; i++) {
                        var v = g[game][vectorComponent][array][i]
                        if (!fs.existsSync(path.join(folder['CraftingRecipe'], fileMap(v[pairData][componentSecond][fileID]) + v[pairData][componentSecond][pathID] + '.json'))) continue
                        var cr = require(path.join(folder['CraftingRecipe'], fileMap(v[pairData][componentSecond][fileID]) + v[pairData][componentSecond][pathID] + '.json'))
                        if (cr[mono]['0 Array LeveledRecipes']) {
                          craftingRecipe = {}
                          craftingRecipe.name = g[game][stringName].split('_').pop()
                          craftingRecipe.interpretedType = g[game][stringName].split('_')[1]
                        }
                      }
                      return craftingRecipe
                    })(),
                    equipmentSet: f[mono]['0 PPtr<$EquipmentSet> Set'][pathID]
                      ? (function () {
                        var e = require(path.join(folder['Other'], fileMap(f[mono]['0 PPtr<$EquipmentSet> Set'][fileID]) + f[mono]['0 PPtr<$EquipmentSet> Set'][pathID] + '.json'))
                        return {
                          name: require(path.join(folder['Other'], fileMap(e[mono][ptrGameObject][fileID]) + e[mono][ptrGameObject][pathID] + '.json'))[game][stringName],
                          description: e[mono]['1 string Description'],
                          minimumRequiredAmount: e[mono]['0 int minimumNumberOfItemsToEnable'],
                          stats: e[mono]['0 Array stat'].map(v => {
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
                      if (e !== 'None' && classEnum[e] === f[mono]['0 int validEquipMask']) return e
                      else if (e !== 'None' && hasFlag(f[mono]['0 int validEquipMask'], classEnum[e])) return e
                      else return undefined
                    }).filter(Boolean),
                    type: Object.keys(itemClassEnum).map(e => {
                      if (e !== 'None' && itemClassEnum[e] === f[mono]['0 int validClasses']) return e
                      else if (e !== 'None' && hasFlag(f[mono]['0 int validClasses'], itemClassEnum[e])) return e
                      else return undefined
                    }).filter(Boolean),
                    stats: f[mono]['0 Array stat'].length > 0 ? f[mono]['0 Array stat'].map(v => {
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
      var arr = require(path.join(folder['Other'], fileMap(file[mono][ptrGameObject][fileID]) + file[mono][ptrGameObject][pathID] + '.json'))[game][vectorComponent][array]
      for (let i = 0; i < arr.length; i++) {
        const v = arr[i]
        if (fs.existsSync(path.join(folder['ItemDefinition'], fileMap(v[pairData][componentSecond][fileID]) + v[pairData][componentSecond][pathID] + '.json'))) {
          var f = require(path.join(folder['ItemDefinition'], fileMap(v[pairData][componentSecond][fileID]) + v[pairData][componentSecond][pathID] + '.json'))
          itemModifier.alias = translate[f[mono]['1 string Name']] || f[mono]['1 string Name']
          itemModifier.description = translate[f[mono]['1 string Description']] || f[mono]['1 string Description']
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
        name: translate[file[mono]['1 string FloatingLabelText']] || require(path.join(folder['Other'], fileMap(file[mono][ptrGameObject][fileID]) + file[mono][ptrGameObject][pathID] + '.json'))[game][stringName],
        key: file[mono]['0 PPtr<$ItemDefinition> Key'][pathID]
          ? (function () {
            var f = require(path.join(folder['ItemDefinition'], fileMap(file[mono]['0 PPtr<$ItemDefinition> Key'][fileID]) + file[mono]['0 PPtr<$ItemDefinition> Key'][pathID] + '.json'))[mono]
            return {
              name: translate[f['1 string Name']] || f['1 string Name'],
              description: translate[f['1 string Description']] || f['1 string Description'],
              price: f['0 int Price'],
              currency: require(path.join(folder['Other'], fileMap(f['0 PPtr<$GameObject> Currency'][fileID]) + f['0 PPtr<$GameObject> Currency'][pathID] + '.json'))[game][stringName]
            }
          })()
          : undefined,
        lootTable: require(path.join(folder['Other'], fileMap(file[mono][ptrGameObject][fileID]) + file[mono][ptrGameObject][pathID] + '.json'))[game][stringName],
        containBloodStone: !!file[mono]['1 UInt8 shouldContainBloodstone'] || undefined
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
        name: file[mono]['1 string NPCName'].length > 0
          ? translate[file[mono]['1 string NPCName']] || file[mono]['1 string NPCName']
          : require(path.join(folder['Other'], fileMap(file[mono][ptrGameObject][fileID]) + file[mono][ptrGameObject][pathID] + '.json'))[game][stringName],
        alias: file[mono]['1 string NPCName'].length > 0
          ? (translate[file[mono]['1 string NPCName']] || file[mono]['1 string NPCName']) === require(path.join(folder['Other'], fileMap(file[mono][ptrGameObject][fileID]) + file[mono][ptrGameObject][pathID] + '.json'))[game][stringName]
            ? undefined
            : require(path.join(folder['Other'], fileMap(file[mono][ptrGameObject][fileID]) + file[mono][ptrGameObject][pathID] + '.json'))[game][stringName]
          : undefined,
        category: Object.keys(npcCategoryEnum).map(e => {
          if (npcCategoryEnum[e] === file[mono]['0 int Category']) return e
          else return undefined
        }).filter(Boolean).join(''),
        weapons: file[mono]['0 Array WeaponPrefabs'].map(v => {
          if (!fs.existsSync(path.join(folder['Other'], fileMap(v[ptrGameObjectData][fileID]) + v[ptrGameObjectData][pathID] + '.json'))) return undefined
          var w = require(path.join(folder['Other'], fileMap(v[ptrGameObjectData][fileID]) + v[ptrGameObjectData][pathID] + '.json'))
          if (w) return {
            name: w[game][stringName],
            data: w[game][vectorComponent][array].map(v => {
              if (!fs.existsSync(path.join(folder['Other'], fileMap(v[pairData][componentSecond][fileID]) + v[pairData][componentSecond][pathID] + '.json'))) return undefined
              var f = require(path.join(folder['Other'], fileMap(v[pairData][componentSecond][fileID]) + v[pairData][componentSecond][pathID] + '.json'))
              if (f[mono] && f[mono]['1 string ProjectileName']) {
                return projectile(f)
              } else if (f['0 SpriteRenderer Base'] && f['0 SpriteRenderer Base']['0 PPtr<Sprite> m_Sprite'][pathID]) {
                var srd = require(path.join(folder['Other'], fileMap(f['0 SpriteRenderer Base']['0 PPtr<Sprite> m_Sprite'][fileID]) + f['0 SpriteRenderer Base']['0 PPtr<Sprite> m_Sprite'][pathID] + '.json'))['0 Sprite Base']['1 SpriteRenderData m_RD']
                var s = require(path.join(folder['Other'], fileMap(srd['0 PPtr<Texture2D> texture'][fileID]) + srd['0 PPtr<Texture2D> texture'][pathID] + '.json'))['0 Texture2D Base']
                return {
                  sprite: {
                    name: s[stringName],
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
        data: require(path.join(folder['Other'], fileMap(file[mono][ptrGameObject][fileID]) + file[mono][ptrGameObject][pathID] + '.json'))[game][vectorComponent][array].map(v => {
          if (fs.existsSync(path.join(folder['LootTable'], fileMap(v[pairData][componentSecond][fileID]) + v[pairData][componentSecond][pathID] + '.json'))) {
            var f = require(path.join(folder['LootTable'], fileMap(v[pairData][componentSecond][fileID]) + v[pairData][componentSecond][pathID] + '.json'))
            if (f[mono] && f[mono]['0 Array lootTable']) {
              return {
                loot: f[mono]['0 PPtr<$LootTable> ReferenceObject'][pathID] > 0
                  ? (function () {
                    var lootTable = require(path.join(folder['LootTable'], fileMap(f[mono]['0 PPtr<$LootTable> ReferenceObject'][fileID]) + f[mono]['0 PPtr<$LootTable> ReferenceObject'][pathID] + '.json'))
                    return {
                      name: require(path.join(folder['Other'], fileMap(lootTable[mono][ptrGameObject][fileID]) + lootTable[mono][ptrGameObject][pathID] + '.json'))[game][stringName]
                    }
                  })()
                  : {
                    guaranteeItemCount: f[mono]['0 int guaranteeItemCount'],
                    maximumItemCount: f[mono]['0 int maximumItemCount'],
                    lootTable: f[mono]['0 Array lootTable'].map(v => {
                      return {
                        item: translate[require(path.join(folder['ItemDefinition'], fileMap(v['0 Deity.Shared.LootEntry data']['0 PPtr<$ItemDefinition> item'][fileID]) + v['0 Deity.Shared.LootEntry data']['0 PPtr<$ItemDefinition> item'][pathID] + '.json'))[mono]['1 string Name']] || require(path.join(folder['ItemDefinition'], fileMap(v['0 Deity.Shared.LootEntry data']['0 PPtr<$ItemDefinition> item'][fileID]) + v['0 Deity.Shared.LootEntry data']['0 PPtr<$ItemDefinition> item'][pathID] + '.json'))[mono]['1 string Name'],
                        count: {
                          dice: v['0 Deity.Shared.LootEntry data']['0 Deity.Shared.DiceParm count']['0 int dice'],
                          faces: v['0 Deity.Shared.LootEntry data']['0 Deity.Shared.DiceParm count']['0 int faces'],
                          add: v['0 Deity.Shared.LootEntry data']['0 Deity.Shared.DiceParm count']['0 int add']
                        },
                        chance: v['0 Deity.Shared.LootEntry data']['0 double chance'],
                        allowModifiers: !!v['0 Deity.Shared.LootEntry data']['1 UInt8 allowModifiers'] || undefined
                      }
                    })
                  }
              }
            }
          } else if (!fs.existsSync(path.join(folder['Other'], fileMap(v[pairData][componentSecond][fileID]) + v[pairData][componentSecond][pathID] + '.json'))) return undefined
          var f = require(path.join(folder['Other'], fileMap(v[pairData][componentSecond][fileID]) + v[pairData][componentSecond][pathID] + '.json'))
          if (f[mono] && typeof f[mono]['0 int netObjectType'] === 'number') return undefined
          else if (f[mono] && f[mono]['0 Array stat'] && f[mono]['0 Array stat'].length > 0) {
            return {
              stats: f[mono]['0 Array stat'].map(v => {
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
          } else if (f[mono] && f[mono]['0 Deity.Shared.CollisionShape shape']) {
            return collision(f)
          } else if (f['0 SpriteRenderer Base'] && f['0 SpriteRenderer Base']['0 PPtr<Sprite> m_Sprite'][pathID]) {
            var srd = require(path.join(folder['Other'], fileMap(f['0 SpriteRenderer Base']['0 PPtr<Sprite> m_Sprite'][fileID]) + f['0 SpriteRenderer Base']['0 PPtr<Sprite> m_Sprite'][pathID] + '.json'))['0 Sprite Base']['1 SpriteRenderData m_RD']
            var s = require(path.join(folder['Other'], fileMap(srd['0 PPtr<Texture2D> texture'][fileID]) + srd['0 PPtr<Texture2D> texture'][pathID] + '.json'))['0 Texture2D Base']
            return {
              sprite: {
                name: s[stringName],
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
          } else if (f[mono] && f[mono]['0 Array snds'] && f[mono]['0 Array snds'].length > 0) {
            return {
              sound: {
                soundType: Object.keys(soundListEnum).map(e => {
                  if (soundListEnum[e] === f[mono]['0 int soundListType']) return e
                  else return undefined
                }).filter(Boolean).join(''),
                sounds: f[mono]['0 Array snds'].map(v => {
                  return v['1 string data']
                }),
              }
            }
          } else if (f[mono] && f[mono]['0 Array dialogue'] && f[mono]['0 Array dialogue'].length > 0) {
            return {
              dialogue: f[mono]['0 Array dialogue'].map(v => {
                var d = require(path.join(folder['Other'], fileMap(v['0 PPtr<$AudioMessage> data'][fileID]) + v['0 PPtr<$AudioMessage> data'][pathID] + '.json'))[mono]
                return {
                  name: require(path.join(folder['Other'], fileMap(d[ptrGameObject][fileID]) + d[ptrGameObject][pathID] + '.json'))[game][stringName],
                  message: translate[d['1 string message']] || d['1 string message']
                }
              })
            }
          } /*else if (f[mono] && f[mono]['0 Array dialogues'] && f[mono]['0 Array dialogues'].length > 0) {
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
        // LOOK THROUGH THIS LATER, MORE STUFF ADDED IN PATCH 2019-02-20.
        name: require(path.join(folder['Other'], fileMap(file[mono][ptrGameObject][fileID]) + file[mono][ptrGameObject][pathID] + '.json'))[game][stringName],
        description: translate[file[mono]['1 string description']] || file[mono]['1 string description'],
        primaryStat: Object.keys(statEnum).map(e => {
          if (statEnum[e] === file[mono]['0 int PrimaryStat']) return e
          else return undefined
        }).filter(Boolean).join(''),
        /*moveRate: parseFloat(file[mono]['0 float MoveRate'].toFixed(2)),*/ // Obscured by anti-cheat added in 2019-02-20 (? Why).
        /*interactionRange: parseFloat(file[mono]['0 float InteractionRange'].toFixed(2)),*/ // Obscured by anti-cheat added in 2019-02-20 (? Why).
        experiencePerLevel: file[mono]['0 Array ExperiencePerLevel'].map(v => {
          return v['0 int data']
        }),
        data: require(path.join(folder['Other'], fileMap(file[mono][ptrGameObject][fileID]) + file[mono][ptrGameObject][pathID] + '.json'))[game][vectorComponent][array].map(v => {
          if (!fs.existsSync(path.join(folder['Other'], fileMap(v[pairData][componentSecond][fileID]) + v[pairData][componentSecond][pathID] + '.json'))) return undefined
          var f = require(path.join(folder['Other'], fileMap(v[pairData][componentSecond][fileID]) + v[pairData][componentSecond][pathID] + '.json'))
          if (f[mono] && typeof f[mono]['0 int netObjectType'] === 'number') return undefined
          else if (f[mono] && f[mono]['0 Array stat'] && f[mono]['0 Array stat'].length > 0) {
            return {
              stats: f[mono]['0 Array stat'].map(v => {
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
          } else if (f[mono] && f[mono]['0 Deity.Shared.CollisionShape shape']) {
            return collision(f)
          } else if (f[mono] && f[mono]['0 Array snds'] && f[mono]['0 Array snds'].length > 0) {
            return {
              sound: {
                soundType: Object.keys(soundListEnum).map(e => {
                  if (soundListEnum[e] === f[mono]['0 int soundListType']) return e
                  else return undefined
                }).filter(Boolean).join(''),
                sounds: f[mono]['0 Array snds'].map(v => {
                  return v['1 string data']
                }),
              }
            }
          } else return undefined
        }).filter(Boolean),
        topStats: require(path.join(folder['Other'], fileMap(file[mono]['0 PPtr<$Stats> TopStats'][fileID]) + file[mono]['0 PPtr<$Stats> TopStats'][pathID] + '.json'))[mono]['0 Array stat'].map(v => {
          return {
            key: Object.keys(statEnum).map(e => {
              if (statEnum[e] === v['0 Deity.Shared.Stat data']['0 int key']) return e
              else return undefined
            }).filter(Boolean).join(''),
            equation: v['0 Deity.Shared.Stat data']['1 string equation'],
            value: parseFloat(v['0 Deity.Shared.Stat data']['0 float value'].toFixed(2))
          }
        }),
        skins: file[mono]['0 Array skins'].map(v => {
          var f = require(path.join(folder['Other'], fileMap(v['0 Deity.Shared.PlayerSkin data']['0 PPtr<$Skin> Skin'][fileID]) + v['0 Deity.Shared.PlayerSkin data']['0 PPtr<$Skin> Skin'][pathID] + '.json'))[mono]
          return {
            name: require(path.join(folder['Other'], fileMap(f[ptrGameObject][fileID]) + f[ptrGameObject][pathID] + '.json'))[stringName],
            offerID: v['0 Deity.Shared.PlayerSkin data']['1 string OfferId'],
            sprite: (function () {
              var srd = require(path.join(folder['Other'], fileMap(f['0 PPtr<$Sprite> SkinIcon'][fileID]) + f['0 PPtr<$Sprite> SkinIcon'][pathID] + '.json'))['0 Sprite Base']['1 SpriteRenderData m_RD']
              var s = require(path.join(folder['Other'], fileMap(srd['0 PPtr<Texture2D> texture'][fileID]) + srd['0 PPtr<Texture2D> texture'][pathID] + '.json'))['0 Texture2D Base']
              return {
                name: s[stringName],
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
      let challengeType = {
        'Stat': 0,
        'Trophy': 1,
        'TrophyCount': 2,
        'TrophyMultiple': 3,
        'EquipedAttachments': 4
      }
      var challenge = {
        name: require(path.join(folder['Other'], fileMap(file[mono][ptrGameObject][fileID]) + file[mono][ptrGameObject][pathID] + '.json'))[game][stringName],
        questText: translate[file[mono]['1 string QuestText']] || file[mono]['1 string QuestText'],
        completeText: translate[file[mono]['1 string QuestCompleteText']] || file[mono]['1 string QuestCompleteText'],
        title: translate[file[mono]['1 string ChallengeTitle']] || file[mono]['1 string ChallengeTitle'],
        description: translate[file[mono]['1 string ChallengeDescription']] || file[mono]['1 string ChallengeDescription'],
        challengeValueSuffix: (file[mono]['1 string ChallengeValueSuffix'] && file[mono]['1 string ChallengeValueSuffix'].length > 0) ? (translate[file[mono]['1 string ChallengeValueSuffix']] || file[mono]['1 string ChallengeValueSuffix']) : undefined,
        challengeType: Object.keys(challengeType).map(e => {
          if (challengeType[e] === file[mono]['0 int challengeType']) return e
          else return undefined
        }).filter(Boolean).join(''),
        challenge: Object.keys(statEnum).map(e => {
          if (statEnum[e] === file[mono]['0 int challenge']) return e
          else return undefined
        }).filter(Boolean).join(''),
        challengeTarget: file[mono]['0 PPtr<$GameObject> challengeTarget'][pathID]
          ? (function () {
            var f = require(path.join(folder['Other'], fileMap(file[mono]['0 PPtr<$GameObject> challengeTarget'][fileID]) + file[mono]['0 PPtr<$GameObject> challengeTarget'][pathID] + '.json'))
            return {
              name: f[game][stringName]
            }
          })()
          : undefined,
        challengeValue: file[mono]['0 int challengeValue'],
        achievement: !!file[mono]['1 UInt8 accountAchievement'] || undefined,
        hideAchievement: !!file[mono]['1 UInt8 hideAchievement'] || undefined,
        prerequisites: file[mono]['0 Array prerequisites'].length > 0
          ? file[mono]['0 Array prerequisites'].map(v => {
            var p = require(path.join(folder['Challenge'], fileMap(v['0 PPtr<$Challenge> data'][fileID]) + v['0 PPtr<$Challenge> data'][pathID] + '.json'))[mono]
            return [translate[p['1 string ChallengeTitle']] || p['1 string ChallengeTitle'], require(path.join(folder['Other'], fileMap(p[ptrGameObject][fileID]) + p[ptrGameObject][pathID] + '.json'))[game][stringName]]
          })
          : undefined,
        data: require(path.join(folder['Other'], fileMap(file[mono][ptrGameObject][fileID]) + file[mono][ptrGameObject][pathID] + '.json'))[game][vectorComponent][array].map(v => {
          if (fs.existsSync(path.join(folder['LootTable'], fileMap(v[pairData][componentSecond][fileID]) + v[pairData][componentSecond][pathID] + '.json'))) {
            var f = require(path.join(folder['LootTable'], fileMap(v[pairData][componentSecond][fileID]) + v[pairData][componentSecond][pathID] + '.json'))
            if (f[mono] && f[mono]['0 Array lootTable']) {
              return {
                loot: {
                  lootTable: {
                    name: require(path.join(folder['Other'], fileMap(f[mono][ptrGameObject][fileID]) + f[mono][ptrGameObject][pathID] + '.json'))[game][stringName]
                  }
                }
              }
            }
          } else {
            if (!fs.existsSync(path.join(folder['Other'], fileMap(v[pairData][componentSecond][fileID]) + v[pairData][componentSecond][pathID] + '.json'))) return undefined
            var f = require(path.join(folder['Other'], fileMap(v[pairData][componentSecond][fileID]) + v[pairData][componentSecond][pathID] + '.json'))
            if (f[mono]['1 string QuestText']) {
              return {
                questText: translate[f[mono]['1 string QuestText']] || f[mono]['1 string QuestText'],
                completeText: translate[f[mono]['1 string QuestCompleteText']] || f[mono]['1 string QuestCompleteText'],
                startQuestProgressAtZero: !!file[mono]['1 UInt8 startQuestProgressAtZero'] || undefined
                /** Missing
                 * Array spawnersToTriggerOnStart
                 * Array makeExclusive
                 * Array portalsToSpawn
                 * Array itemsToSpawn
                 * boolean UInt spawnPortalsExclusively
                 * vector2 relativePortalSpawnPosition
                 */
              } 
            } else return undefined
          }
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
      'All': 0,
      'Day': 1,
      'Night': 2
    }
    fs.mkdirSync(path.join(__dirname, 'Patch', folderName11))
    var count = 0
    var announceAtNextCount = 500
    fs.readdirSync(folder[folderName11]).forEach(val => {
      var file = require(path.join(folder[folderName11], val))
      var m = mono
      var spawnerDef = {
        name: file[mono][stringName],
        biome: Object.keys(biomeTypeEnum).map(e => {
          if (biomeTypeEnum[e] === file[mono]['0 int biome']) return e
          else return undefined
        }).filter(Boolean).join(''),
        difficulty: {
          min: parseFloat(file[mono]['0 float difficultyMin'].toFixed(2)),
          max: parseFloat(file[mono]['0 float difficultyMax'].toFixed(2))
        },
        spawnRadius: parseFloat(file[mono]['0 float spawnRadius'].toFixed(2)),
        spawnDelayed: !!file[mono]['1 UInt8 spawnDelayed'] || undefined,
        quotaRadius: parseFloat(file[mono]['0 float quotaRadius'].toFixed(2)),
        rechargeTime: parseFloat(file[mono]['0 float rechargeTime'].toFixed(2)),
        isBoss: !!file[mono]['1 UInt8 isBoss'] || undefined,
        autoPopulate: !!file[mono]['1 UInt8 autoPopulate'] || undefined,
        manuallyPlaced: !!file[mono]['1 UInt8 manuallyPlaced'] || undefined,
        floraOrFaunaSpawner: !!file[mono]['1 UInt8 floraOrFaunaSpawner'] || undefined,
        spawnList: file[mono]['0 Array spawnList'].length > 0 ? file[mono]['0 Array spawnList'].map(v => {
          var monster = v['0 Deity.Shared.MonsterToSpawn data']
          if (!fs.existsSync(path.join(folder['Other'], fileMap(monster['0 PPtr<$GameObject> MonsterPrefab'][fileID]) + monster['0 PPtr<$GameObject> MonsterPrefab'][pathID] + '.json'))) return undefined
          var f = require(path.join(folder['Other'], fileMap(monster['0 PPtr<$GameObject> MonsterPrefab'][fileID]) + monster['0 PPtr<$GameObject> MonsterPrefab'][pathID] + '.json'))[game]
          return {
            monsterName: (function () {
              var monData
              for (let i = 0; i < f[vectorComponent][array].length; i++) {
                const entry = f[vectorComponent][array][i][pairData]
                if (fs.existsSync(path.join(folder['Monster'], fileMap(entry[componentSecond][fileID]) + entry[componentSecond][pathID] + '.json'))) {
                  monData = require(path.join(folder['Monster'], fileMap(entry[componentSecond][fileID]) + entry[componentSecond][pathID] + '.json'))
                  break
                }
              }
              return translate[monData[mono]['1 string MonsterName']] || monData[mono]['1 string MonsterName']
            })(),
            monsterAlias: f[stringName],
            spawnChance: parseFloat(monster['0 float spawnChance'].toFixed(2)),
            spawnQuota: monster['0 int spawnQuota'],
            timeOfDay: Object.keys(timeOfDayEnum).map(e => {
              if (timeOfDayEnum[e] === monster['0 int timeOfDay']) return e
              else return undefined
            }).filter(Boolean).join('')
          }
        }).filter(Boolean) : undefined,
        comboSpawnList: file[mono]['0 Array comboSpawnList'].length > 0 ? file[mono]['0 Array comboSpawnList'].map(v => {
          var monsterArray = v['0 Deity.Shared.MonsterComboPack data']['0 Array Monsters']
          return monsterArray.map(v => {
            var monster = v['0 Deity.Shared.MonsterToSpawn data']
            if (!fs.existsSync(path.join(folder['Other'], fileMap(monster['0 PPtr<$GameObject> MonsterPrefab'][fileID]) + monster['0 PPtr<$GameObject> MonsterPrefab'][pathID] + '.json'))) return undefined
            var f = require(path.join(folder['Other'], fileMap(monster['0 PPtr<$GameObject> MonsterPrefab'][fileID]) + monster['0 PPtr<$GameObject> MonsterPrefab'][pathID] + '.json'))[game]
            return {
              monsterName: (function () {
                var monData
                for (let i = 0; i < f[vectorComponent][array].length; i++) {
                  const entry = f[vectorComponent][array][i][pairData]
                  if (fs.existsSync(path.join(folder['Monster'], fileMap(entry[componentSecond][fileID]) + entry[componentSecond][pathID] + '.json'))) {
                    monData = require(path.join(folder['Monster'], fileMap(entry[componentSecond][fileID]) + entry[componentSecond][pathID] + '.json'))
                    break
                  }
                }
                return translate[monData[mono]['1 string MonsterName']] || monData[mono]['1 string MonsterName']
              })(),
              monsterAlias: f[stringName],
              spawnChance: parseFloat(monster['0 float spawnChance'].toFixed(2)),
              spawnQuota: monster['0 int spawnQuota'],
              timeOfDay: Object.keys(timeOfDayEnum).map(e => {
                if (timeOfDayEnum[e] === monster['0 int timeOfDay']) return e
                else return undefined
              }).filter(Boolean).join('')
            }
          }).filter(Boolean)
        }).filter(Boolean) : undefined,
        oneTimeTrigger: !!file[mono]['1 UInt8 oneTimeTrigger'] || undefined,
        areaMax: file[mono]['0 int areaMax'],
        areaRadius: file[mono]['0 int areaRadius']/* ,
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

  let folderName12 = 'WeeklyChallenge'
  if (folder[folderName12]) {
    fs.mkdirSync(path.join(__dirname, 'Patch', folderName12))
    var count = 0
    var announceAtNextCount = 500
    fs.readdirSync(folder[folderName12]).forEach(val => {
      var file = require(path.join(folder[folderName12], val))
      var weeklyChallenge = {
        name: require(path.join(folder['Other'], fileMap(file[mono][ptrGameObject][fileID]) + file[mono][ptrGameObject][pathID] + '.json'))[game][stringName],
        challengeDescription: file[mono]['1 string challengeDescription'],
        quests: file[mono]['0 Array quests'].map(v => {
          var f = require(path.join(folder['Other'], fileMap(v[ptrGameObjectData][fileID]) + v[ptrGameObjectData][pathID] + '.json'))
          return {
            name: f[game][stringName],
            data: f[game][vectorComponent][array].map(v => {
              if (fs.existsSync(path.join(folder['LootTable'], fileMap(v[pairData][componentSecond][fileID]) + v[pairData][componentSecond][pathID] + '.json'))) {
                var f = require(path.join(folder['LootTable'], fileMap(v[pairData][componentSecond][fileID]) + v[pairData][componentSecond][pathID] + '.json'))
                if (f[mono] && f[mono]['0 Array lootTable']) {
                  return {
                    loot: {
                      lootTable: {
                        name: require(path.join(folder['Other'], fileMap(f[mono][ptrGameObject][fileID]) + f[mono][ptrGameObject][pathID] + '.json'))[game][stringName]
                      }
                    }
                  }
                }
              } else {
                if (!fs.existsSync(path.join(folder['Other'], fileMap(v[pairData][componentSecond][fileID]) + v[pairData][componentSecond][pathID] + '.json'))) return undefined
                var f = require(path.join(folder['Other'], fileMap(v[pairData][componentSecond][fileID]) + v[pairData][componentSecond][pathID] + '.json'))
                if (f[mono]['0 Array RequiredItems'] && f[mono]['0 Array RequiredItems'].length > 0) {
                  return {
                    requiredItems: f[mono]['0 Array RequiredItems'].map(v => {
                      var f = require(path.join(folder['ItemDefinition'], fileMap(v['0 Deity.Shared.CraftRecipeItem data']['0 PPtr<$ItemDefinition> item'][fileID]) + v['0 Deity.Shared.CraftRecipeItem data']['0 PPtr<$ItemDefinition> item'][pathID] + '.json'))
                      return {
                        name: translate[f[mono]['1 string Name']] || f[mono]['1 string Name'],
                        count: v['0 Deity.Shared.CraftRecipeItem data']['0 unsigned int count'],
                        requiredLevel: v['0 Deity.Shared.CraftRecipeItem data']['0 unsigned int requiredLevel']
                      }
                    })
                  }
                } else if (f[mono]['1 string questTitle']) {
                  return {
                    questTitle: f[mono]['1 string questTitle']
                  }
                } else return undefined
              }
            }).filter(Boolean)
          }
        }),
        buffReward: statusEffect(null, require(path.join(folder['StatusEffect'], fileMap(file[mono]['0 PPtr<$StatusEffect> buffReward'][fileID]) + file[mono]['0 PPtr<$StatusEffect> buffReward'][pathID] + '.json')))
      }

      var filename = path.join(__dirname, 'Patch', folderName12, `${weeklyChallenge.name}.json`)
      if (fs.existsSync(filename)) {
        var file = JSON.parse(fs.readFileSync(filename, 'utf-8'))
        file.push(weeklyChallenge)
        fs.writeFileSync(filename, JSON.stringify(file, null, 2))
      } else fs.writeFileSync(filename, JSON.stringify([weeklyChallenge], null, 2))
      count++
      if (count === announceAtNextCount) {
        announceAtNextCount += 500
        console.log(folderName12, 'at', count, '...')
      }
    })
    console.log(folderName12, 'completed', 'at', count)
  }

  let folderName13 = 'StatusEffect'
  if (folder[folderName13]) {
    fs.mkdirSync(path.join(__dirname, 'Patch', folderName13))
    var count = 0
    var announceAtNextCount = 500
    fs.readdirSync(folder[folderName13]).forEach(val => {
      var file = require(path.join(folder[folderName13], val))
      var effect = statusEffect(null, file)

      var filename = path.join(__dirname, 'Patch', folderName13, `${effect.name}.json`)
      if (fs.existsSync(filename)) {
        var file = JSON.parse(fs.readFileSync(filename, 'utf-8'))
        file.push(effect)
        fs.writeFileSync(filename, JSON.stringify(file, null, 2))
      } else fs.writeFileSync(filename, JSON.stringify([effect], null, 2))
      count++
      if (count === announceAtNextCount) {
        announceAtNextCount += 500
        console.log(folderName13, 'at', count, '...')
      }
    })
    console.log(folderName13, 'completed', 'at', count)
  }
}
