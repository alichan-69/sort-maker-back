const express = require('express')
const func = require('../functions')

const router = express.Router()

router.post('/', async (req, res) => {
    const postData = req.body

    // ポストされたデータの必須キーの存在チェック
    const requiredKeys = ['user_id', 'sort_id']
    if (!func.isExistKey(requiredKeys, postData)) {
        res.send(func.apiResponse(1, 0, 'ポストデータのキーが不足しています'))
        return
    }

    // ポストされたデータをそれぞれ変数に格納
    const userId = postData['user_id']
    const sortId = postData['sort_id']

    // その他データベースに登録する値を変数に格納
    const deleteFlg = false
    const createDate = func.formatDate(new Date())
    const updateDate = func.formatDate(new Date())

    // バリデーション
    if (!func.isStrOutOfRange(userId, 1, 255)) {
        res.send(func.apiResponse(1, 0, 'ユーザーidの文字数が範囲外です'))
        return
    }
    if (!func.isStrOutOfRange(String(sortId), 1, 11)) {
        res.send(func.apiResponse(1, 0, 'ソートidの桁数が範囲外です'))
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

    // お気に入りを登録する
    try {
        // すでにお気に入りが登録されているかどうか確かめる
        let sql = `SELECT COUNT(*) AS count FROM likes WHERE user_id = ? AND sort_id = ? AND delete_flg = false`
        const [rows] = await connection.execute(sql, [userId, sortId])
        if (rows[0]['count']) {
            // すでに登録されていたら正常なレスポンスをを返す
            res.send(func.apiResponse(0, 0, '成功'))
            return
        }

        // すでにお気に入りが存在しているか確かめる
        sql = `SELECT COUNT(*) AS count FROM likes WHERE user_id = ? AND sort_id = ? AND delete_flg = true`
        const [rowsOfLikes] = await connection.execute(sql, [userId, sortId])

        // 存在してたらdelete_flgをfalseに変え、存在してなかったらレコードを増やす
        if (rowsOfLikes[0]['count']) {
            sql = `UPDATE likes SET delete_flg = ?, update_date = ? WHERE user_id = ? AND sort_id = ? AND delete_flg = true`
            await connection.execute(sql, [deleteFlg, updateDate, userId, sortId])
        } else {
            // お気に入りの登録
            sql = `INSERT INTO likes (sort_id,user_id,delete_flg,create_date,update_date) values (?, ?, ?, ?, ?)`
            await connection.execute(sql, [sortId, userId, deleteFlg, createDate, updateDate])
        }

        // 登録できたら正常なレスポンスをを返す
        res.send(func.apiResponse(0, 0, '成功'))
        return
    } catch (e) {
        // エラーがひっかかったらエラーレスポンスを返す
        res.send(func.apiResponse(1, 0, 'お気に入り登録できませんでした'))
        return
    } finally {
        connection.end()
    }
})

module.exports = router
