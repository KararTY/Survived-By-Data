function getRandomInt(max) {
  let min = 0
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function QEKOGELIAFKOQ(add, dice, faces) {
  let num = add
  for (let i = 1; i < dice; i++) {
    // num += randy.Next(faces)
    num += getRandomInt(faces)
  }
  return num
}

/**
 * In-game code uses `System.Random()` from C# which is seeded based on OS time using `Environment.TickCount`.
 * randy.Next() gives a random number based on faces which is maxValue.
 */
