const express = require('express')
const func = require('../functions')

const router = express.Router()

router.post('/', async (req, res) => {
    const postData = req.body

    // ポストされたデータの必須キーの存在チェック
    const requiredKeys = [
        'user_id',
        'sort_id',
        'name',
        'description',
        'item_names',
    ]
    if (!func.isExistKey(requiredKeys, postData))
        res.send(func.apiResponse(1, 0, 'ポストデータのキーが不足しています'))

    // ポストされたデータをそれぞれ変数に格納
    const userId = postData['user_id']
    const sortId = postData['sort_id']
    const name = postData['name']
    const description = postData['description']
    const itemNames = postData['item_names']

    // その他データベースに登録する値を変数に格納
    const deleteFlg = false
    const createDate = func.formatDate(new Date())
    const updateDate = func.formatDate(new Date())

    // バリデーション
    if (!func.isStrOutOfRange(userId, 1, 255))
        res.send(func.apiResponse(1, 0, 'ユーザーIDの文字数が範囲外です'))
    if (!func.isStrOutOfRange(String(sortId), 1, 11))
        res.send(func.apiResponse(1, 0, 'ソートidの桁数が範囲外です'))
    if (!func.isStrOutOfRange(name, 1, 255))
        res.send(
            func.apiResponse(1, 0, 'ソートタイトルの名前の文字数が範囲外です')
        )
    if (!func.isStrOutOfRange(description, 1, 255))
        res.send(
            func.apiResponse(1, 0, 'ソートタイトルの説明の文字数が範囲外です')
        )

    for (let i in itemNames) {
        if (!func.isStrOutOfRange(itemNames[i], 1, 255))
            res.send(
                func.apiResponse(
                    1,
                    0,
                    'ソートアイテムの名前の文字数が範囲外です'
                )
            )
    }

    if (itemNames.length < 2 || itemNames.length > 100)
        res.send(func.apiResponse(1, 0, 'ソートアイテムの名前の数が範囲外です'))

    // ユーザー認証を実行
    if (!(await func.authenticateUser(userId))) {
        res.send(func.apiResponse(1, 0, 'ユーザー認証に失敗しました'))
    }

    // データベースに接続
    const connection = await func.configureMysql()

    if (!connection)
        res.send(func.apiResponse(1, 0, 'データベースに接続できませんでした'))

    // ソートタイトルとソートアイテムを編集する
    try {
        // ソートタイトルの編集
        let sql = `UPDATE sorts SET name = '${name}', description = '${description}', update_date = '${updateDate}' WHERE id = ${sortId}`
        await connection.query(sql)

        // ソートアイテムの編集
        const newSortItemIds = []

        // ソートアイテムのidを取ってくる
        sql = `SELECT id FROM sort_items WHERE sort_id = ${sortId} AND delete_flg = false`
        const [rows] = await connection.query(sql)
        const oldSortItemIds = rows.map((el) => el.id)

        for (let i in itemNames) {
            if (oldSortItemIds[i]) {
                sql = `UPDATE sort_items SET name = '${itemNames[i]}', update_date = '${updateDate}' WHERE id = ${oldSortItemIds[i]}`
                await connection.query(sql)
                newSortItemIds.push(oldSortItemIds[i])
            } else {
                // 登録されているソートアイテムの数が足りない時
                sql = `INSERT INTO sort_items (name,sort_id,delete_flg,create_date,update_date) values ('${itemNames[i]}','${sortId}','${deleteFlg}','${createDate}','${updateDate}')`
                const [rows] = await connection.query(sql)
                newSortItemIds.push(rows['insertId'])
            }
        }

        for (let i in oldSortItemIds) {
            // 入力されたソートアイテムの数が足りない時
            if (!itemNames[i]) {
                sql = `UPDATE sort_items SET delete_flg = true WHERE id = ${oldSortItemIds[i]}`
                await connection.query(sql)
            }
        }

        // 編集できたらdataに編集したソートタイトルとソートアイテムのidを記載した正常なレスポンスをを返す
        res.send(
            func.apiResponse(
                0,
                { sort_id: sortId, sort_item_ids: newSortItemIds },
                '成功'
            )
        )
    } catch (e) {
        // エラーがひっかかったらエラーレスポンスを返す
        res.send(func.apiResponse(1, 0, 'ソートを編集できませんでした'))
    } finally {
        connection.end()
    }
})

module.exports = router
