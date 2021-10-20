const express = require('express')
const func = require('../functions')

const router = express.Router()

router.post('/', async (req, res) => {
    // ユーザー認証を実行
    const result = await func.authenticateUser('1')
    res.send(result)
})

module.exports = router
