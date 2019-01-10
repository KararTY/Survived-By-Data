function random (N) {
  return Math.floor(N * Math.random())
}

function rollDice(N, S) {
  // Sum of N dice each of which goes from 0 to S
  var value = 0
  for (let i = 0; i < N; i++) {
    value += random(S + 1)
  }
  return value
}