const express = require('express')
const func = require('../functions')

const router = express.Router()

router.post('/', async (req, res) => {
    const a = await func.authenticateUser('1')
    console.log(a)
})

module.exports = router
