const mysql = require('mysql2/promise')

// ======================
// データベースの初期設定
// ======================
exports.configureMysql = async () => {
    try {
        const con = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'sort_maker',
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
    // データベースに接続してユーザーidを取得し、そのユーザーidが受け取ったidと同値だったらtrueを返し、それ以外はfalseを返す
    const connection = await this.configureMysql()

    if (!connection) return false

    try {
        const sql = `SELECT * FROM users WHERE user_id = ${userId}`
        const [rows] = await connection.query(sql)

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
