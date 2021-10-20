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

    // その他データベースに登録する値を変数に格納
    const deleteFlg = false
    const createDate = func.formatDate(new Date())
    const updateDate = func.formatDate(new Date())

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

    // ユーザー認証を実行
    if (!(await func.authenticateUser(userId))) {
        res.send(func.apiResponse(1, 0, 'ユーザー認証に失敗しました'))
    }

    // データベースに接続
    const connection = await func.configureMysql()

    if (!connection)
        res.send(func.apiResponse(1, 0, 'データベースに接続できませんでした'))

    // ソートを登録し、登録できたら正常なレスポンスをを返し、それ以外はエラーレスポンスを返す
    try {
        // ソートの登録
        const sql = `INSERT INTO sorts (name,description,image,user_id,delete_flg,create_date,update_date) values ('${name}','${description}','${image}','${userId}',${deleteFlg},'${createDate}','${updateDate}')`
        await connection.query(sql)

        res.send(func.apiResponse(0, 0, '成功'))
    } catch (e) {
        res.send(func.apiResponse(1, 0, 'ソートを登録できませんでした'))
    } finally {
        connection.end()
    }
})

module.exports = router
