const express = require('express')
const func = require('../functions')

const router = express.Router()

router.post('/', function (req, res) {
    try {
        const a = func.authenticateUser('1')
        res.send('成功' + a)
    } catch (e) {
        res.send('失敗' + e)
    }
})

module.exports = router
