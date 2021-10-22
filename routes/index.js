const express = require('express')
const router = express.Router()

// ルーティング先に指定するモジュールの読み込み
const postTweet = require('./post-tweet')
const registerSort = require('./register-sort')
const registerSortImage = require('./register-sort-image')

// ルーティング処理
router.use('/post-tweet', postTweet)
router.use('/register-sort', registerSort)
router.use('/register-sort-image', registerSortImage)

module.exports = router
