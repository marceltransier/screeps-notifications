const Notifications = require('notifications')

module.exports.loop = () => {

  for (let name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name]
      console.log('Clearing non-existing creep memory:', name)
      Notifications.add(`The creep ${name} died.`)
    }
  }



}
