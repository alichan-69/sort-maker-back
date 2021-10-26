const express = require('express')
const router = express.Router()

// ルーティング先に指定するモジュールの読み込み
const postTweet = require('./post-tweet')
const deleteLike = require('./delete-like')
const registerLike = require('./register-like')
const registerSort = require('./register-sort')
const registerUser = require('./register-user')
const registerSortImage = require('./register-sort-image')
const searchSort = require('./search-sort')

// ルーティング処理
router.use('/post-tweet', postTweet)
router.use('/delete-like', deleteLike)
router.use('/register-like', registerLike)
router.use('/register-sort', registerSort)
router.use('/register-user', registerUser)
router.use('/register-sort-image', registerSortImage)
router.use('/search-sort', searchSort)

module.exports = router
