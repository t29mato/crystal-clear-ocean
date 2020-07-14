import * as client from 'cheerio-httpcli'
import * as moment from 'moment'
import * as admin from 'firebase-admin'
const serviceAccount = require('../crystal-clear-ocean-firebase-adminsdk-z5i86-41a79ac5c6.json')

export const crawl = () => {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://crystal-clear-ocean.firebaseio.com"
    });
    const db = admin.firestore()
    const izuOceanParkRef = db.collection('izuOceanPark');
    const data = extract('https://iop-dc.com/')

    izuOceanParkRef.where('measured_at', '==', data.measured_at).get()
        .then(snapshot => {
            if (snapshot.empty) {
                console.log('新規データにつき挿入')
                izuOceanParkRef.doc().set(data)
                    .catch(err => console.log('Error getting set documents', err))
            } else {
                console.log('データ重複につき何もしない')
            }
        })
        .catch(err => {
            console.log('Error getting documents', err)
        })
}

export const extract = (url: string) => {
    const res = client.fetchSync(url, 'utf8')
    const date = extractDate(res.$('#homeConditionDetail > div > p:nth-child(1)').text())
    const clearness = extractClearness(res.$('#homeConditionDetail > dl > dd:nth-child(4)').text())
    return {
        measured_at: date,
        values: clearness
    }
}

const extractClearness = (html: String) => {
    const temp = html.match(/[０-９0-9]{1,2}/g)
    if (!temp) {
        console.error(temp)
        throw new Error('IOPの透明度抽出失敗');
    }
    const clearness = temp.map((item) => {
        const number = item.split('').map((value, index) => {
            if (value.match(/[0-9]/)) {
                return value
            } else {
                return String.fromCharCode(item.charCodeAt(index) - 0xfee0);
            }
        })
        return parseInt(number.toString().replace(',', ''))
    })
    // 昨日　浅場3ｍ~　砂地10～15ｍ という場合は値が3つになるので先頭と終わりを取得する
    if (clearness.length > 2) {
        return [clearness[0], clearness[clearness.length-1]]
    } else {
        return clearness
    }
}

const extractDate = (html: String) => {
    const temp = html.match(/[０-９0-9]{1,2}/g)
    if (!temp || temp.length < 2) {
        console.error(temp)
        throw new Error('IOPのデータ抽出失敗');
    }
    // Month Date Hour Minutes e.g. [4, 5, 15, 00]
    const time = temp.map((item) => {
        const number = item.split('').map((value, index) => {
            if (value.match(/[0-9]/)) {
                return value
            } else {
                return String.fromCharCode(item.charCodeAt(index) - 0xfee0);
            }
        })
        return parseInt(number.toString().replace(',', ''))
    })
    const [month, date] = time
    const hour = time[2] && time[2]
    const minute = time[3] && time[3]
    const result = moment(moment().year() + '-01-01') // 年だけ指定したい
        .month(month-1)
        .date(date)
    hour && result.hour(hour)
    minute && result.minute(minute)
    return result.format()
}
