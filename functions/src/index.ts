import * as functions from 'firebase-functions'
import * as izuOceanParkService  from './izuOceanParkService'

export const crawlIzuOceanPark = functions.region('asia-northeast1').https.onRequest((request, response) => {
    izuOceanParkService.crawl()
    response.send("Hello from Firebase!");
    return null
});

export const getIzuOceanPark = functions.region('asia-northeast1').https.onRequest((request, response) => {
    izuOceanParkService.get()
        .then(data => {
            response.json({data: data})
        })
})
