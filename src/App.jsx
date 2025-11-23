import React from 'react'
import SensorWatcher from './components/SensorWatcher'
import AuthBar from './components/AuthBar'

export default function App() {
  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center p-6'>
      <div className='w-full max-w-5xl'>
        <header className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-3xl font-semibold text-indigo-800'>Rangefinder Realtime Dashboard</h1>
            <p className='text-sm text-gray-600'>Live ToF sensor readings from Firebase Realtime Database</p>
          </div>
          <AuthBar />
        </header>
        <main className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <SensorWatcher warnThreshold={80} dangerThreshold={120} />
          <div className='p-6 bg-white rounded-2xl shadow'>
            <h2 className='text-lg font-medium mb-2'>Controls & Info</h2>
            <ul className='text-sm text-gray-700 space-y-2'>
              <li>- Live updates via Firebase `onValue` listeners</li>
              <li>- Chart displays recent samples</li>
              <li>- Export CSV and browser notifications included</li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  )
}
