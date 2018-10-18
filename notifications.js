module.exports.add = (msg) => {
  let unixTime = Date.now()
  let screepsTime = Game.time
  if (Array.isArray(Memory.notifications))
    Memory.notifications = Memory.notifications.filter(entry => entry.unixTime && entry.unixTime > unixTime - 120000)
  else Memory.notifications = []
  Memory.notifications.push({
    unixTime: unixTime,
    screepsTime: screepsTime,
    msg: msg
  })
}

