# Survived-By-Data
Survived By data.

Using [**AssetsBundleExtractor**](https://github.com/DerPopo/UABE) to extract
* MonoBehaviour
    * Everything under `Deity.Monster` and `Deity.Shared.*`.
* GameObject
* TextAsset*
* Sound*
* Texture2D*

\* Not available here in this Github project.

## How-to example
```
- ItemDefinition
  - 28115.json
  - 28116.json
  ...
- LootTable
  - 28120.json
  - 28143.json
  ...
- Monster
  - 28124.json
  - 28623.json
  ...
- Other
  - 27721.json
  - 27722.json
  ...
```
* Files that contain "0 Array LootTable" are sorted into "LootTable".
* Files that are of type `MonoBehaviour : Deity.Monster` are sorted into "Monster".
* Files that contain "0 PPtr<$ItemDefinition> FusionUpgradeItem" are sorted into "ItemDefinition".

Files that don't fill any of the criterias are sorted into the "Other" folder.

All filenames are changed to just be numerical, just like in the box above. So from `unnamed asset-resources.assets-28623-MonoBehaviour.json` to `28623.json`.

To search the files using Windows search, I use `ren *.json *.txt` and then `ren *.txt *.json` and then I do this:
![1.png](1.png)

The file [parser.js](parser.js), a NodeJS script, should show the magic behind the scenes turning data inside the folders into human readable files.