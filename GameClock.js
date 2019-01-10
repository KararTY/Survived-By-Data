var currentTime

var DayTime
var IsNight

function update() {
  // var gameEventData
  // if (gameEventData != null) {
  //   DayTime = 0
  //   IsNight = true
  //   return
  // }
  var num = 1200
  var num2 = currentTime + num * 0.5
  var num3 = Number(Number(num2 / num).toFixed(0))
  var num4 = num2 - num3 * num
  DayTime = num4 / num

  if (CheckNight() && !IsNight) {
    IsNight = true
  }
  else if (!CheckNight() && IsNight) {
    IsNight = false
  }
}

function CheckNight() {
  return DayTime < 0.18 || DayTime > 0.88
}

function TimeFromNoon() {
  return Mathf.Abs(DayTime - 0.5)
}