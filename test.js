let fs = require('fs')
let path = require('path')

var template = `{|class="wikitable sortable"\n  ! Name || Type`

fs.readdirSync(path.join(__dirname, 'Patch', 'Challenge')).forEach((val, ind) => {
  var file = require(path.join(__dirname, 'Patch', 'Challenge', val))
  template += `\n  |-\n  | [[Challenge/${file[0].name}|${file[0].title}]] || ${file[0].achievement ? 'Achievement' : 'Challenge'}`
})

template += `\n|}`

console.log(template)