import * as client from 'cheerio-httpcli'
import * as moment from 'moment'

export const extract = (url: string) => {
    const res = client.fetchSync(url, 'utf8')
    const date = extractDate(res.$('#homeConditionDetail > div > p:nth-child(1)').text())
    const clearness = extractClearness(res.$('#homeConditionDetail > dl > dd:nth-child(4)').text())
    return {
        measured_at: date,
        values: clearness
    }
}

const extractClearness = (source: String) => {
    const temp = source.match(/[０-９0-9]{1,2}/g)
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
    return clearness
}

const extractDate = (source: String) => {
    const temp = source.match(/[０-９0-9]{1,2}/g)
    if (!temp || temp.length < 3) {
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
    const [month, date, hour] = time
    const minute = time[3] && time[3]
    let result = moment(moment().year() + '-01-01') // 年だけ指定したい
        .month(month-1)
        .date(date)
        .hour(hour)
    minute && result.minute(minute)
    return result.format()
}
