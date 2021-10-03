const express = require('express')
const router = express.Router()

// ルーティング先に指定するモジュールの読み込み
const registerSort = require('./register-sort.js')

// ルーティング処理
router.use('/', registerSort)

module.exports = router
