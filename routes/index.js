const express = require('express')
const router = express.Router()

// ルーティング先に指定するモジュールの読み込み
const postTweet = require('./post-tweet.js')
const registerSort = require('./register-sort.js')

// ルーティング処理
router.use('/post-tweet', postTweet)
router.use('/register-sort', registerSort)

module.exports = router
