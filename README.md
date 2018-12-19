# Survived-By-Data
Survived By data.

To get started, change [patchDate.json](patchDate.json) accordingly and run `npm i` and then `node run.js` to create starter folders.

Use [**AssetsBundleExtractor**](https://github.com/DerPopo/UABE) to extract (dump) Unity file types of [UABETypes.json](UABETypes.json) as `.json` format into `/Raw data/<patch date>/_Dump Files Here/`.

After you've dumped the files, run `node run.js` again and wait for it to finish. It will take some time.

Results will be under `/Patches/<patch date>/` you've set inside [patchDate.json](patchDate.json).

## MIT
Karar Al-Remahy https://alremahy.com/