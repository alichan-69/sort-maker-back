const express = require('express')
const func = require('../functions')

const router = express.Router()

router.post('/', async (req, res) => {
    const postData = req.body

    // ポストされたデータの必須キーの存在チェック
    const requiredKeys = [
        'user_id',
        'image',
        'item_images',
        'sort_id',
        'sort_item_ids',
    ]
    if (!func.isExistKey(requiredKeys, postData)) {
        res.send(func.apiResponse(1, 0, 'ポストデータのキーが不足しています'))
        return
    }

    // ポストされたデータをそれぞれ変数に格納
    const userId = postData['user_id']
    const image = postData['image']
    const itemImages = postData['item_images']
    const sortId = postData['sort_id']
    const sortItemIds = postData['sort_item_ids']

    // バリデーション
    if (!func.isStrOutOfRange(userId, 1, 255)) {
        res.send(func.apiResponse(1, 0, 'ユーザーIDの文字数が範囲外です'))
        return
    }

    if (!func.isStrOutOfRange(image, 0, 2083)) {
        res.send(
            func.apiResponse(
                1,
                0,
                'ソートタイトルの画像のURLの文字数が範囲外です'
            )
        )
        return
    }

    for (let i in itemImages) {
        if (!func.isStrOutOfRange(itemImages[i], 0, 2083)) {
            res.send(
                func.apiResponse(
                    1,
                    0,
                    'ソートアイテムの画像のURLの文字数が範囲外です'
                )
            )
            return
        }
    }

    if (!func.isStrOutOfRange(String(sortId), 1, 11)) {
        res.send(func.apiResponse(1, 0, 'ソートidの桁数が範囲外です'))
        return
    }

    for (let i in sortItemIds) {
        if (!func.isStrOutOfRange(String(sortItemIds[i]), 1, 11)) {
            res.send(
                func.apiResponse(1, 0, 'ソートアイテムidの桁数が範囲外です')
            )
            return
        }
    }

    if (itemImages.length < 1 || itemImages.length > 100) {
        res.send(func.apiResponse(1, 0, 'ソートアイテムの画像の数が範囲外です'))
        return
    }

    if (sortItemIds.length < 1 || sortItemIds.length > 100) {
        res.send(func.apiResponse(1, 0, 'ソートアイテムidの数が範囲外です'))
        return
    }

    // ユーザー認証を実行
    if (!(await func.authenticateUser(userId))) {
        res.send(func.apiResponse(1, 0, 'ユーザー認証に失敗しました'))
        return
    }

    // データベースに接続
    const connection = await func.configureMysql()

    if (!connection) {
        res.send(func.apiResponse(1, 0, 'データベースに接続できませんでした'))
        return
    }

    // ソートタイトルの画像とソートアイテムの画像を登録する
    try {
        // ソートタイトルの登録
        const sql = `UPDATE sorts SET image = ? WHERE id = ?`
        await connection.execute(sql, [image, sortId])

        // ソートアイテムの登録
        for (let i in itemImages) {
            let sql = `UPDATE sort_items SET image = ? WHERE id = ?`
            await connection.execute(sql, [itemImages[i], sortItemIds[i]])
        }

        // 登録できたら正常なレスポンスをを返す
        res.send(func.apiResponse(0, 0, '成功'))
        return
    } catch (e) {
        // エラーがひっかかったらエラーレスポンスを返す
        res.send(func.apiResponse(1, 0, 'ソート画像を登録できませんでした'))
        return
    } finally {
        connection.end()
    }
})

module.exports = router
