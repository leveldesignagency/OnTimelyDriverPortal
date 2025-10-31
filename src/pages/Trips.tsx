import React, { useEffect, useState } from 'react'
import { useSupabase } from '../lib/SupabaseProvider'

type Trip = {
  id: string
  first_name: string
  last_name: string
  chauffer_pickup_time: string | null
  chauffer_pickup_location: string | null
}

export default function Trips() {
  const supabase = useSupabase()
  const [licensePlate, setLicensePlate] = useState('')
  const [driverName, setDriverName] = useState('')
  const [loading, setLoading] = useState(false)
  const [trips, setTrips] = useState<Trip[]>([])
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      let q = supabase
        .from('guests')
        .select('id, first_name, last_name, chauffer_pickup_time, chauffer_pickup_location')
        .order('chauffer_pickup_time', { ascending: true })
      if (licensePlate) q = q.eq('chauffer_license_plate', licensePlate.toUpperCase())
      if (driverName) q = q.eq('chauffer_name', driverName)
      const { data, error } = await q
      if (error) throw error
      const upcoming = (data || []).filter(g => g.chauffer_pickup_time && new Date(g.chauffer_pickup_time!) >= new Date())
      setTrips(upcoming as any)
    } catch (e: any) {
      setError(e.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // auto load when both fields present
    if (licensePlate || driverName) load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [licensePlate, driverName])

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>Your Trips</div>
        <button onClick={load} style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 12px' }}>Refresh</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        <input placeholder="Driver Name" value={driverName} onChange={e => setDriverName(e.target.value)} style={{ padding: 12, borderRadius: 8, border: '1px solid #333', background: '#111', color: '#fff' }} />
        <input placeholder="License Plate" value={licensePlate} onChange={e => setLicensePlate(e.target.value)} style={{ padding: 12, borderRadius: 8, border: '1px solid #333', background: '#111', color: '#fff' }} />
      </div>

      {error && <div style={{ color: '#ef4444', marginBottom: 8 }}>{error}</div>}
      {loading && <div>Loading…</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
        {trips.map((t, i) => (
          <div key={t.id} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 700 }}>{t.first_name} {t.last_name}</div>
              <div style={{ opacity: 0.8 }}>{t.chauffer_pickup_time ? new Date(t.chauffer_pickup_time).toLocaleString() : 'TBD'}</div>
            </div>
            <div style={{ opacity: 0.8, marginTop: 4 }}>{t.chauffer_pickup_location || 'Pickup location TBD'}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 12px' }}>Open</button>
              <button style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 8, padding: '8px 12px' }}>Scan Guest</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
