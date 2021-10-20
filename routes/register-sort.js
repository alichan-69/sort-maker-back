const express = require('express')
const func = require('../functions')

const router = express.Router()

router.post('/', async (req, res) => {
    const postData = req.body

    // ポストされたデータの必須キーの存在チェック
    const requiredKeys = ['user_id', 'name', 'description', 'image', 'items']
    if (!func.isExistKey(requiredKeys, postData))
        res.send(func.apiResponse(1, 0, 'ポストデータのキーが不足しています'))

    // ポストされたデータをそれぞれ変数に格納
    const userId = postData['user_id']
    const name = postData['name']
    const description = postData['description']
    const image = postData['image']
    const items = postData['items']

    // ポストされたデータのitems中の必須キーの存在チェック
    const requiredItemKeys = ['itemName', 'itemImage']
    for (let i in items) {
        if (!func.isExistKey(requiredItemKeys, items[i]))
            res.send(
                func.apiResponse(1, 0, 'ポストデータのキーが不足しています')
            )
    }

    // バリデーション
    if (!func.isStrOutOfRange(userId, 1, 128))
        res.send(func.apiResponse(1, 0, 'ユーザーIDの文字数が範囲外です'))
    if (!func.isStrOutOfRange(name, 1, 255))
        res.send(func.apiResponse(1, 0, 'ソートの名前の文字数が範囲外です'))
    if (!func.isStrOutOfRange(description, 1, 255))
        res.send(func.apiResponse(1, 0, 'ソートの説明の文字数が範囲外です'))
    if (!func.isStrOutOfRange(image, 1, 2083))
        res.send(
            func.apiResponse(1, 0, 'ソートの画像のURLの文字数が範囲外です')
        )

    for (let i in items) {
        if (!func.isStrOutOfRange(items[i]['itemName'], 1, 255))
            res.send(
                func.apiResponse(
                    1,
                    0,
                    'ソートアイテムの名前の文字数が範囲外です'
                )
            )

        if (!func.isStrOutOfRange(items[i]['itemImage'], 1, 2083))
            res.send(
                func.apiResponse(
                    1,
                    0,
                    'ソートアイテムの画像のURLの文字数が範囲外です'
                )
            )
    }

    if (items.length < 1 || items.length > 100)
        res.send(func.apiResponse(1, 0, 'ソートアイテムの数が範囲外です'))

    res.send('成功')

    // ユーザー認証を実行
    // const result = await func.authenticateUser('1')
})

module.exports = router
