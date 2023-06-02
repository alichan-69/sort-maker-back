const express = require('express')
const func = require('../functions')

const router = express.Router()

router.post('/', async (req, res) => {
    const postData = req.body

    // ポストされたデータの必須キーの存在チェック
    const requiredKeys = ['sort_id']
    if (!func.isExistKey(requiredKeys, postData)) {
        res.send(func.apiResponse(1, 0, 'ポストデータのキーが不足しています'))
        return
    }

    // ポストされたデータをそれぞれ変数に格納
    const sortId = postData['sort_id']

    // バリデーション
    if (!func.isStrOutOfRange(String(sortId), 1, 11)) {
        res.send(func.apiResponse(1, 0, 'ソートidの桁数が範囲外です'))
        return
    }

    // データベースに接続
    const connection = await func.configureMysql()

    if (!connection) {
        res.send(func.apiResponse(1, 0, 'データベースに接続できませんでした'))
        return
    }

    // ソートのplay_countを更新する
    try {
        // ソートのplay_countを取ってくる
        let sql = `SELECT play_count FROM sorts WHERE id = ?`
        const [rows] = await connection.execute(sql, [sortId])

        // ソートのplay_countを更新する
        const updatePlayCount = rows[0]['play_count'] + 1
        sql = `UPDATE sorts SET play_count = ? WHERE id = ? AND delete_flg = false`
        await connection.execute(sql, [updatePlayCount, sortId])

        // 更新できたら正常なレスポンスをを返す
        res.send(func.apiResponse(0, 0, '成功'))
        return
    } catch (e) {
        // エラーがひっかかったらエラーレスポンスを返す
        res.send(func.apiResponse(1, 0, '遊ばれた回数を更新できませんでした'))
        return
    } finally {
        connection.end()
    }
})

module.exports = router
