const https = require('https')
const zlib = require('zlib')
const schedule = require('node-schedule')

const config = require('./config.json')

let oldNotifications = []

const httpsRequestPromise = (options) => new Promise((resolve, reject) => {
  const request = https.request(options, response => {
    if (response.statusCode !== 200) reject(response)
    const body = []
    response.on('data', chunk => body.push(chunk))
    response.on('end', () => resolve(body.join('')))
  })
  request.on('error', err => reject(err))
  request.end()
})

const gunzipPromise = (buffer) => new Promise((resolve, reject) => {
  zlib.gunzip(buffer, (err, ret) => {
    if (err) reject(err)
    else resolve(ret)
  })
})


schedule.scheduleJob('* * * * *', async () => {

  let res = await httpsRequestPromise({
    hostname: 'screeps.com',
    path: `/api/user/memory?shard=${config.screeps.shard}&path=notifications`,
    headers: {
      'X-Token': config.screeps.token
    },
    method: 'GET'
  })

  res = JSON.parse(res)
  if (!(res.ok === 1 && typeof res.data === 'string' && res.data.slice(0, 3) === 'gz:')) return
  const data = res.data.slice(3)
  const buf = Buffer.from(data, 'base64')
  const ret = await gunzipPromise(buf)
  const array = JSON.parse(ret.toString())
  if (!Array.isArray(array)) return

  const notifications = array.map(i => JSON.stringify(i)).filter(i => oldNotifications.map(j => JSON.stringify(j)).indexOf(i) < 0).map(i => JSON.parse(i)).sort((a, b) => a.unixTime > b.unixTime)
  oldNotifications = array

  for (const notification of notifications) {
    const dateString = new Date(notification.unixTime).toLocaleString()
    const message = `${dateString} | ${notification.screepsTime} | ${notification.msg}`

    await httpsRequestPromise({
      hostname: 'api.telegram.org',
      path: `/bot${config.telegram.token}/sendMessage?chat_id=${config.telegram.chatid}&text=${encodeURIComponent(message)}`,
      method: 'GET'
    })
  }


})
