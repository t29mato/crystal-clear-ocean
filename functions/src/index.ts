import * as functions from 'firebase-functions'
import * as izuOceanParkService  from './izuOceanParkService'

export const izuOceanPark = functions.pubsub.schedule('every 1 minutes').onRun(context => {
    console.log('Hello from Pubsub!')
    izuOceanParkService.crawl()
    return null
});
