// ======================
// firebase認証の初期設定
// ======================
const firebase = require('firebase/app')
require('firebase/auth')
require('firebase/storage')

const initializeApp = () => {
    const config = {
        apiKey: 'AIzaSyAzZ5T7Y7n5bAlB9GERaBDpOZW9rUEY_-8',
        authDomain: 'sort-maker-59e03.firebaseapp.com',
        projectId: 'sort-maker-59e03',
        storageBucket: 'sort-maker-59e03.appspot.com',
        messagingSenderId: '1072382239411',
        appId: '1:1072382239411:web:ce106331825496f4d686c6',
        measurementId: 'G-8C3MJ3HPQZ',
    }

    if (firebase.apps.length === 0) {
        firebase.initializeApp(config)
        return firebase
    } else {
        return firebase
    }
}

module.exports = initializeApp
