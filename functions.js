const mysql = require('mysql2/promise')
const twitter = require('twitter')

// ======================
// データベースの初期設定
// ======================
exports.configureMysql = async () => {
    try {
        const con = await mysql.createConnection({
            host: process.env.DB_HOSTNAME,
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        })

        return con
    } catch (e) {
        return false
    }
}

// ======================
// APIレスポンス
// ======================
exports.apiResponse = (code = 0, data = 0, message = '成功') => {
    return {
        code: code,
        data: data,
        message: message,
    }
}

// ===============================
// ポストデータのキーの存在チェック
// ===============================
exports.isExistKey = (requiredKeys, postData) => {
    for (let i in requiredKeys) {
        if (!(requiredKeys[i] in postData)) {
            return false
        }
    }

    return true
}

// ===========================
// ポストデータの文字数チェック
// ===========================
exports.isStrOutOfRange = (value, min, max) => {
    if (value.length < min || value.length > max) return false
    return true
}

// ======================
// ユーザー認証
// ======================
exports.authenticateUser = async (userId) => {
    // データベースに接続
    const connection = await this.configureMysql()

    if (!connection) return false

    try {
        // ユーザーidを取得し、そのユーザーidがポストされたidと同値だったらtrueを返し、それ以外はfalseを返す
        const sql = `SELECT * FROM users WHERE id = ?`
        const [rows] = await connection.execute(sql, [userId])

        if (userId === rows[0]['id']) {
            return true
        } else {
            return false
        }
    } catch (e) {
        return false
    } finally {
        connection.end()
    }
}

// ======================
// ソート作成ユーザー認証
// ======================
exports.authenticateRegisterUser = async (userId, sortId) => {
    // データベースに接続
    const connection = await this.configureMysql()

    if (!connection) return false

    try {
        // ソートidからソートを作成したユーザーidを取得し、そのユーザーidが
        // ポストされたユーザーidと同値だったらtrueを返し、それ以外はfalseを返す
        const sql = `SELECT * FROM sorts WHERE id = ?`
        const [rows] = await connection.execute(sql, [sortId])

        if (userId === rows[0]['user_id']) {
            return true
        } else {
            return false
        }
    } catch (e) {
        return false
    } finally {
        connection.end()
    }
}

// ======================
// 日付のフォーマット処理
// ======================
exports.formatDate = (date) => {
    const year = date.getFullYear()
    const month = ('0' + (date.getMonth() + 1)).slice(-2)
    const day = ('0' + date.getDate()).slice(-2)
    const hour = ('0' + date.getHours()).slice(-2)
    const minute = ('0' + date.getMinutes()).slice(-2)
    const second = ('0' + date.getSeconds()).slice(-2)

    return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

// ======================
// ツイッターの初期設定
// ======================
exports.initializeTwitter = (accessTokenKey, accessTokenSecret) => {
    return new twitter({
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        access_token_key: accessTokenKey,
        access_token_secret: accessTokenSecret,
    })
}