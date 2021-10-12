const express = require('express')
const router = express.Router()

// ルーティング先に指定するモジュールの読み込み
const postTweet = require('./post-tweet')
const registerSort = require('./register-sort')

// ルーティング処理
router.use('/post-tweet', postTweet)
router.use('/register-sort', registerSort)

module.exports = router
