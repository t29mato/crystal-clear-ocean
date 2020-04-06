import * as functions from 'firebase-functions'
import * as izuOceanParkService  from './izuOceanParkService'

export const izuOceanPark = functions.region('asia-northeast1').https.onRequest((request, response) => {
    izuOceanParkService.crawl()
    response.send("Hello from Firebase!");
    return null
});
