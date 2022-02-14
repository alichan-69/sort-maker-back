const express = require('express')
const router = require('./routes')
const cors = require('cors')
const dotenv = require('dotenv')

const port = process.env.port || 3000
const app = express()

// CORS有効化
app.use(cors())

// 環境変数有効化
dotenv.config()

// リクエストパラメータをjsonで受け取り、配列も設定できるようにする
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// ルーティング読み込み
app.use('/', router)

// サーバー起動
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
