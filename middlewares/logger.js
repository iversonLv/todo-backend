const { format } = require('date-fns')
const  { v4: uuid } = require('uuid')
const fs = require('fs')
const fsPromises = require('fs').promises
const path = require('path')

const logEvents = async ( message, logFileName) => {
  const dateTime = `${format(new Date(), 'yyyyMMdd\tHH:mm:ss')}`
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`

  try {
    // Check whether there is logs folder
    // If does not exist then create one
    if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
      await fsPromises.mkdir(path.join(__dirname, '..', 'logs'))
    }
    // If does, then append the logFile into the logs folder and with the logItem
    await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logFileName), logItem)
  } catch(err) {
    console.log(err)
  }
}

const logger = (req, res, next) => {
  logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, 'reqLog.log')
  console.log(`${req.method} ${req.path}`)
  next()
}

module.exports = {
  logEvents,
  logger
}