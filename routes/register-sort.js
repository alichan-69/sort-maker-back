const express = require('express')
const func = require('../functions')

const router = express.Router()

router.post('/', async (req, res) => {
    const postData = req.body

    // ポストされたデータの必須キーの存在チェック
    const requiredKeys = ['user_id', 'name', 'description', 'item_names']
    if (!func.isExistKey(requiredKeys, postData)) {
        res.send(func.apiResponse(1, 0, 'ポストデータのキーが不足しています'))
        return
    }

    // ポストされたデータをそれぞれ変数に格納
    const userId = postData['user_id']
    const name = postData['name']
    const description = postData['description']
    const itemNames = postData['item_names']

    // その他データベースに登録する値を変数に格納
    const playCount = 0
    const deleteFlg = false
    const createDate = func.formatDate(new Date())
    const updateDate = func.formatDate(new Date())

    // バリデーション
    if (!func.isStrOutOfRange(userId, 1, 255)) {
        res.send(func.apiResponse(1, 0, 'ユーザーIDの文字数が範囲外です'))
        return
    }
    if (!func.isStrOutOfRange(name, 1, 255)) {
        res.send(
            func.apiResponse(1, 0, 'ソートタイトルの名前の文字数が範囲外です')
        )
        return
    }
    if (!func.isStrOutOfRange(description, 1, 255)) {
        res.send(
            func.apiResponse(1, 0, 'ソートタイトルの説明の文字数が範囲外です')
        )
        return
    }

    for (let i in itemNames) {
        if (!func.isStrOutOfRange(itemNames[i], 1, 255)) {
            res.send(
                func.apiResponse(
                    1,
                    0,
                    'ソートアイテムの名前の文字数が範囲外です'
                )
            )
            return
        }
    }

    if (itemNames.length < 1 || itemNames.length > 100) {
        res.send(func.apiResponse(1, 0, 'ソートアイテムの名前の数が範囲外です'))
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

    // ソートタイトルとソートアイテムを登録する
    try {
        // ソートタイトルの登録
        const sql = `INSERT INTO sorts (name,description,image,play_count,user_id,delete_flg,create_date,update_date) values (?, ?, '', ?, ?, ?, ?, ?)`
        const [rows] = await connection.execute(sql , [name, description, playCount, userId, deleteFlg, createDate, updateDate])
        const sortId = rows['insertId']

        // ソートアイテムの登録
        let sortItemIds = []

        for (let i in itemNames) {
            let sql = `INSERT INTO sort_items (name,image,sort_id,delete_flg,create_date,update_date) values (?, '', ?, ?, ?, ?)`
            const [rows] = await connection.execute(sql, [itemNames[i], sortId, deleteFlg, createDate, updateDate])
            sortItemIds.push(rows['insertId'])
        }

        // 登録できたらdataに登録したソートタイトルとソートアイテムのidを記載した正常なレスポンスをを返す
        res.send(
            func.apiResponse(
                0,
                { sort_id: sortId, sort_item_ids: sortItemIds },
                '成功'
            )
        )
        return
    } catch (e) {
        // エラーがひっかかったらエラーレスポンスを返す
        res.send(func.apiResponse(1, 0, 'ソートを登録できませんでした'))
        return
    } finally {
        connection.end()
    }
})

module.exports = router
