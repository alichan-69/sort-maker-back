const express = require('express')
const func = require('../functions')

const router = express.Router()

router.post('/', async (req, res) => {
    const postData = req.body

    // ポストされたデータをそれぞれ変数に格納
    const partOfSortName =
        'part_of_sort_name' in postData ? postData['part_of_sort_name'] : null
    const isSortByPopularity =
        'is_sort_by_popularity' in postData
            ? postData['is_sort_by_popularity']
            : false
    const isSortByTime =
        'is_sort_by_time' in postData ? postData['is_sort_by_time'] : false
    const userId = 'userId' in postData ? postData['userId'] : ''

    // バリデーション
    if (
        partOfSortName !== null &&
        !func.isStrOutOfRange(partOfSortName, 0, 255)
    ) {
        res.send(func.apiResponse(1, 0, 'ソートの名前の文字数が範囲外です'))
        return
    }

    // データベースに接続
    const connection = await func.configureMysql()

    if (!connection) {
        res.send(func.apiResponse(1, 0, 'データベースに接続できませんでした'))
        return
    }

    // ソートを検索する
    try {
        // ソートの検索
        let sql = `SELECT id, name, description, image, play_count ,user_id, create_date, update_date FROM sorts`
        let params = []

        if (partOfSortName !== null && userId) {
            sql += ` WHERE name LIKE ? AND user_id = ?  AND delete_flg = false`
            params.push('%' + partOfSortName + '%', userId)
        } else if (partOfSortName !== null) {
            sql += ` WHERE name LIKE ?  AND delete_flg = false`
            params.push('%' + partOfSortName + '%')
        } else if (userId) {
            sql += ` WHERE user_id = ?  AND delete_flg = false`
            params.push(userId)
        } else {
            sql += ' WHERE delete_flg = false'
        }
        if (isSortByPopularity) sql += ' ORDER BY play_count DESC'
        if (isSortByTime) sql += ' ORDER BY create_date DESC'

        const [rows] = await connection.execute(sql, params)

        // ユーザー名を取ってくる
        for (let i in rows) {
            sql = `SELECT name FROM users WHERE id = ? AND delete_flg = false`

            const [rowsOfUsers] = await connection.execute(sql, [rows[i]['user_id']])

            delete rows[i]['user_id']
            rows[i]['user_name'] = rowsOfUsers[0]['name']
        }

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
        return
    } catch (e) {
        // エラーがひっかかったらエラーレスポンスを返す
        res.send(func.apiResponse(1, 0, 'ソートを検索できませんでした'))
        return
    } finally {
        connection.end()
    }
})

module.exports = router
