import React, { useEffect, useRef, useState } from 'react'
import { ref as dbRef, onValue } from 'firebase/database'
import { db } from '../firebaseClient'
import { Line } from 'react-chartjs-2'
import { Chart, registerables } from 'chart.js'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
Chart.register(...registerables)

function downloadCSV(filename, rows) {
  const header = 'timestamp,value,unit\n';
  const csv = header + rows.map(r => `${new Date(r.t).toISOString()},${r.v},${r.u || ''}`).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function SensorWatcher({ warnThreshold = null, dangerThreshold = null }) {
  const [value, setValue] = useState(null)
  const [unit, setUnit] = useState('cm')
  const [points, setPoints] = useState([])
  const [toasts, setToasts] = useState([])

  // motion value for smooth number tween
  const motionVal = useMotionValue(0)
  const displayVal = useTransform(motionVal, v => (Math.round(v*10)/10).toFixed(1))

  useEffect(() => {
    if (value !== null) motionVal.set(Number(value))
  }, [value])

  useEffect(() => {
    // request notification permission up front
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    const valRef = dbRef(db, '/TOF_Sensor/value')
    const unitRef = dbRef(db, '/TOF_Sensor/unit')

    const offVal = onValue(valRef, snapshot => {
      if (!snapshot.exists()) return
      const v = Number(snapshot.val())
      setValue(v)
      setPoints(prev => {
        const next = [...prev, { t: Date.now(), v, u: unit }]
        if (next.length > 120) next.shift()
        return next
      })

      if (dangerThreshold !== null && v >= dangerThreshold) {
        pushToast('CRITICAL: value is above danger threshold', 'danger')
        sendBrowserNotification('CRITICAL', `Value ${v} ${unit} above ${dangerThreshold}`)
        playAlarm()
      } else if (warnThreshold !== null && v >= warnThreshold) {
        pushToast('Warning: value above warning threshold', 'warning')
        sendBrowserNotification('Warning', `Value ${v} ${unit} above ${warnThreshold}`)
      }
    })

    const offUnit = onValue(unitRef, snapshot => {
      if (!snapshot.exists()) return
      setUnit(snapshot.val())
    })

    return () => {
      offVal(); offUnit();
    }
  }, [dangerThreshold, warnThreshold, unit])

  function pushToast(message, level='info') {
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, message, level }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 6000)
  }

  function sendBrowserNotification(title, body) {
    if (!('Notification' in window)) return
    if (Notification.permission === 'granted') {
      new Notification(title, { body })
    }
  }

  function playAlarm() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'
      o.frequency.value = 880
      g.gain.value = 0.05
      o.connect(g); g.connect(ctx.destination)
      o.start(0)
      setTimeout(() => { o.stop(); ctx.close() }, 500)
    } catch (e) { /* ignore */ }
  }

  const data = {
    labels: points.map(p => new Date(p.t).toLocaleTimeString()),
    datasets: [{
      label: `Distance (${unit})`,
      data: points.map(p => p.v),
      tension: 0.36,
      fill: true,
      borderWidth: 2,
      pointRadius: 0,
      borderColor: 'rgba(79, 70, 229, 1)', // primary
      backgroundColor: ctx => {
        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, 'rgba(99,102,241,0.18)');
        gradient.addColorStop(1, 'rgba(99,102,241,0.02)');
        return gradient;
      }
    }]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    scales: {
      x: { display: true, grid: { display: false } },
      y: { display: true, grid: { color: '#f1f5f9' } }
    },
    animation: { duration: 400, easing: 'easeOutCubic' }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className='p-6 bg-white rounded-2xl shadow-soft-lg'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-sm text-muted'>Live Distance</h3>

          <div className='flex items-baseline gap-3 mt-2'>
            <AnimatePresence mode="wait">
              <motion.span
                key={value ?? 'empty'}
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                transition={{ duration: 0.28 }}
                className='text-4xl font-extrabold text-primary'
                style={{ willChange: 'transform' }}
              >
                <motion.span style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {displayVal ? <motion.span>{displayVal}</motion.span> : '—'}
                </motion.span>
              </motion.span>
            </AnimatePresence>

            <span className='text-lg text-gray-600'>{unit}</span>
          </div>

          <p className='text-xs text-gray-500 mt-1'>Realtime</p>
        </div>

        <div className='text-right flex flex-col items-end gap-2'>
          <div className='text-xs text-gray-500'>Last sample</div>
          <div className='text-sm text-gray-700'>{points.length ? new Date(points[points.length-1].t).toLocaleString() : '—'}</div>
          <div className='mt-2 flex gap-2'>
            <button onClick={() => downloadCSV('rangefinder-history.csv', points)} className='px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm'>Export CSV</button>
            <button onClick={() => {
              navigator.clipboard?.writeText(`${value} ${unit}`).then(()=>pushToast('Copied value to clipboard','info'))
            }} className='px-3 py-1 rounded bg-primary text-white text-sm'>Copy</button>
          </div>
        </div>
      </div>

      <div className='mt-4' style={{height: 260}}>
        <Line data={data} options={options} />
      </div>

      <div className='fixed bottom-6 right-6 flex flex-col gap-2 z-50'>
        {toasts.map(t => (
          <div key={t.id} className={`px-4 py-2 rounded shadow text-sm ${t.level==='danger'? 'bg-red-600 text-white' : t.level==='warning' ? 'bg-yellow-400 text-black' : 'bg-gray-800 text-white'}`}>
            {t.message}
          </div>
        ))}
      </div>
    </motion.div>
  )
}
