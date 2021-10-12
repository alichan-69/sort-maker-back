const configureMysql = () => {
    const mysql = require('mysql')

    const con = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
    })

    con.connect((e) => {
        if (e) {
            return false
        } else {
            return con
        }
    })
}

module.export = configureMysql
