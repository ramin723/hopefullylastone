// server/api/mechanic/test.get.ts
import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  console.log('[MECHANIC TEST API] Simple test endpoint called')
  
  return {
    message: 'Test endpoint working',
    timestamp: new Date().toISOString(),
    headers: Object.fromEntries(Object.entries(getHeaders(event)).filter(([key]) => 
      key.toLowerCase().includes('cookie') || key.toLowerCase().includes('authorization')
    ))
  }
})
