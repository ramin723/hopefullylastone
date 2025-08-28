import dayjs from 'dayjs'
import jalaliday from 'jalaliday'

dayjs.extend(jalaliday)
dayjs.calendar('jalali')
dayjs.locale('fa')

export default defineNuxtPlugin(() => ({
  provide: { 
    dayjs: dayjs
  }
}))
