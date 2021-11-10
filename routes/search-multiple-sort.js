const express = require('express')
const func = require('../functions')

const router = express.Router()

router.post('/', async (req, res) => {
    const postData = req.body

    // ポストされたデータの必須キーの存在チェック
    const requiredKeys = [
        'part_of_sort_name',
        'is_sort_by_popularity',
        'is_sort_by_time',
    ]
    if (!func.isExistKey(requiredKeys, postData))
        res.send(func.apiResponse(1, 0, 'ポストデータのキーが不足しています'))

    // ポストされたデータをそれぞれ変数に格納
    const partOfSortName = postData['part_of_sort_name']
    const isSortByPopularity = postData['is_sort_by_popularity']
    const isSortByTime = postData['is_sort_by_time']

    // バリデーション
    if (!func.isStrOutOfRange(partOfSortName, 1, 255))
        res.send(func.apiResponse(1, 0, 'ソートの名前の文字数が範囲外です'))

    // データベースに接続
    const connection = await func.configureMysql()

    if (!connection)
        res.send(func.apiResponse(1, 0, 'データベースに接続できませんでした'))

    // ソートを検索する
    try {
        // ソートの検索
        let sql = `SELECT id, name, description, image, play_count ,user_id, create_date, update_date FROM sorts`

        if (isSortByPopularity) sql += 'ORDER BY play_count ASC'
        if (isSortByTime) sql += 'ORDER BY create_date ASC'

        const [rows] = await connection.query(sql)

        // ユーザー名を取ってくる
        // sql = `SELECT name FROM users WHERE id = '${rows[0]['user_id']}' AND delete_flg = false`
        // const [rowsOfUsers] = await connection.query(sql)

        // 検索できたらdataに検索したデータを記載した正常なレスポンスをを返す
        res.send(
            func.apiResponse(
                0,
                {
                    sorts: rows,
                },
                '成功'
            )
        )
    } catch (e) {
        // エラーがひっかかったらエラーレスポンスを返す
        res.send(func.apiResponse(1, 0, 'ソートを検索できませんでした'))
    } finally {
        connection.end()
    }
})

module.exports = router
