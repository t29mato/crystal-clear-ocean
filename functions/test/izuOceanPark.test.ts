import * as izuOceanParkService from '../src/izuOceanParkService'

test('20191001の透明度取得', () => {
    const clearness = izuOceanParkService.extract('https://crystal-clear-ocean.web.app/test/izuOceanPark/20191001.html');
    expect(clearness).toStrictEqual({"values": [10, 15],"measured_at": "2020-10-01T08:00:00+09:00"})
})

test('20200405の透明度取得', () => {
    const clearness = izuOceanParkService.extract('https://crystal-clear-ocean.web.app/test/izuOceanPark/20200405.html');
    expect(clearness).toStrictEqual({"values": [10],"measured_at": "2020-04-05T07:30:00+09:00"})
})
