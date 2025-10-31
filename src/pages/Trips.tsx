import React, { useEffect, useState } from 'react'
import { useSupabase } from '../lib/SupabaseProvider'

type Trip = {
  id: string
  first_name: string
  last_name: string
  email: string | null
  contact_number: string | null
  chauffer_pickup_time: string | null
  chauffer_pickup_location: string | null
  chauffer_dropoff_location: string | null
  chauffer_dropoff_time: string | null
}

export default function Trips() {
  const supabase = useSupabase()
  const [loading, setLoading] = useState(false)
  const [trips, setTrips] = useState<Trip[]>([])
  const [driverName, setDriverName] = useState<string | null>(null)
  const [driverId, setDriverId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDriverInfo()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (driverName || driverId) {
      loadTrips()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driverName, driverId])

  const loadDriverInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get driver info from drivers table
      const { data: driverData, error: driverError } = await supabase
        .from('drivers')
        .select('id, full_name')
        .eq('auth_user_id', user.id)
        .single()

      if (!driverError && driverData) {
        setDriverName(driverData.full_name)
        setDriverId(driverData.id)
      }
    } catch (e: any) {
      console.error('Failed to load driver info:', e)
    }
  }

  const loadTrips = async () => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('guests')
        .select('id, first_name, last_name, email, contact_number, chauffer_pickup_time, chauffer_pickup_location, chauffer_dropoff_location, chauffer_dropoff_time')

      // Query by driver_id first (preferred), fallback to name for backwards compatibility
      if (driverId) {
        query = query.eq('chauffer_driver_id', driverId)
      } else if (driverName) {
        query = query.eq('chauffer_name', driverName)
      } else {
        setLoading(false)
        return
      }

      const { data, error } = await query.order('chauffer_pickup_time', { ascending: true })

      if (error) throw error

      const upcoming = (data || []).filter(g => {
        if (!g.chauffer_pickup_time) return false
        return new Date(g.chauffer_pickup_time) >= new Date()
      })

      setTrips(upcoming as any)
    } catch (e: any) {
      setError(e.message || 'Failed to load trips')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'TBD'
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return `Today ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    }
  }

  const getNextTrip = () => {
    if (trips.length === 0) return null
    return trips[0]
  }

  const nextTrip = getNextTrip()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(1200px 800px at 20% -10%, rgba(34,197,94,0.12), transparent 40%), radial-gradient(1000px 700px at 120% 10%, rgba(34,197,94,0.08), transparent 45%), #0f1115',
      paddingBottom: '24px'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(17, 24, 39, 0.55)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: 'calc(env(safe-area-inset-top, 0px) + 12px) 20px 12px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <div>
            <div style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#e5e7eb'
            }}>
              {driverName || 'Driver Portal'}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#9ca3af',
              marginTop: '2px'
            }}>
              {trips.length} {trips.length === 1 ? 'trip' : 'trips'} scheduled
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '10px',
              padding: '10px 16px',
              color: '#cbd5e1',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Next Trip Card (if exists) */}
      {nextTrip && (
        <div style={{ padding: '20px 20px 16px' }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#9ca3af',
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Next Trip
          </div>
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '16px',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '120px',
              height: '120px',
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15), transparent)',
              borderRadius: '0 0 0 100%'
            }} />
            <div style={{
              position: 'relative',
              zIndex: 1
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px'
              }}>
                <div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#e5e7eb',
                    marginBottom: '4px'
                  }}>
                    {nextTrip.first_name} {nextTrip.last_name}
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#10b981'
                  }}>
                    {formatDate(nextTrip.chauffer_pickup_time)}
                  </div>
                </div>
              </div>
              {/* Contact Info */}
              {(nextTrip.email || nextTrip.contact_number) && (
                <div style={{
                  background: 'rgba(15, 17, 21, 0.4)',
                  borderRadius: '12px',
                  padding: '12px',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    fontSize: '13px',
                    color: '#9ca3af',
                    marginBottom: '8px'
                  }}>
                    Contact
                  </div>
                  {nextTrip.email && (
                    <div style={{
                      fontSize: '14px',
                      color: '#e5e7eb',
                      marginBottom: '4px'
                    }}>
                      📧 {nextTrip.email}
                    </div>
                  )}
                  {nextTrip.contact_number && (
                    <div style={{
                      fontSize: '14px',
                      color: '#e5e7eb'
                    }}>
                      📱 {nextTrip.contact_number}
                    </div>
                  )}
                </div>
              )}
              
              {/* Pickup Info */}
              <div style={{
                background: 'rgba(15, 17, 21, 0.4)',
                borderRadius: '12px',
                padding: '12px',
                marginBottom: '12px'
              }}>
                <div style={{
                  fontSize: '13px',
                  color: '#9ca3af',
                  marginBottom: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Pickup Time
                </div>
                <div style={{
                  fontSize: '15px',
                  color: '#10b981',
                  fontWeight: 600,
                  marginBottom: '8px'
                }}>
                  {formatDate(nextTrip.chauffer_pickup_time)}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#9ca3af',
                  marginBottom: '4px'
                }}>
                  Location
                </div>
                <div style={{
                  fontSize: '15px',
                  color: '#e5e7eb',
                  fontWeight: 500
                }}>
                  {nextTrip.chauffer_pickup_location || 'Location TBD'}
                </div>
              </div>
              
              {/* Dropoff Info */}
              {(nextTrip.chauffer_dropoff_location || nextTrip.chauffer_dropoff_time) && (
                <div style={{
                  background: 'rgba(15, 17, 21, 0.4)',
                  borderRadius: '12px',
                  padding: '12px',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    fontSize: '13px',
                    color: '#9ca3af',
                    marginBottom: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    Drop-off
                  </div>
                  {nextTrip.chauffer_dropoff_time && (
                    <div style={{
                      fontSize: '15px',
                      color: '#10b981',
                      fontWeight: 600,
                      marginBottom: '8px'
                    }}>
                      {formatDate(nextTrip.chauffer_dropoff_time)}
                    </div>
                  )}
                  {nextTrip.chauffer_dropoff_location && (
                    <>
                      <div style={{
                        fontSize: '13px',
                        color: '#9ca3af',
                        marginBottom: '4px'
                      }}>
                        Location
                      </div>
                      <div style={{
                        fontSize: '15px',
                        color: '#e5e7eb',
                        fontWeight: 500
                      }}>
                        {nextTrip.chauffer_dropoff_location}
                      </div>
                    </>
                  )}
                </div>
              )}
              <button
                style={{
                  width: '100%',
                  background: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  marginTop: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#0d9d70'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#10b981'
                }}
              >
                Scan Guest QR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Trips */}
      {trips.length > 1 && (
        <div style={{ padding: '0 20px' }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#9ca3af',
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            All Trips
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {trips.slice(1).map((trip) => (
              <div
                key={trip.id}
                style={{
                  background: 'rgba(30, 30, 30, 0.55)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '18px',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 20px rgba(0,0,0,0.3)'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px'
                }}>
                  <div>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#e5e7eb',
                      marginBottom: '4px'
                    }}>
                      {trip.first_name} {trip.last_name}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#10b981',
                      fontWeight: 500
                    }}>
                      {formatDate(trip.chauffer_pickup_time)}
                    </div>
                  </div>
                </div>
                {/* Contact Info */}
                {(trip.email || trip.contact_number) && (
                  <div style={{
                    background: 'rgba(15, 17, 21, 0.4)',
                    borderRadius: '10px',
                    padding: '10px',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      fontSize: '12px',
                      color: '#9ca3af',
                      marginBottom: '6px'
                    }}>
                      Contact
                    </div>
                    {trip.email && (
                      <div style={{
                        fontSize: '13px',
                        color: '#e5e7eb',
                        marginBottom: '2px'
                      }}>
                        📧 {trip.email}
                      </div>
                    )}
                    {trip.contact_number && (
                      <div style={{
                        fontSize: '13px',
                        color: '#e5e7eb'
                      }}>
                        📱 {trip.contact_number}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Pickup Info */}
                <div style={{
                  background: 'rgba(15, 17, 21, 0.4)',
                  borderRadius: '10px',
                  padding: '10px',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    fontSize: '12px',
                    color: '#9ca3af',
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    Pickup
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#10b981',
                    fontWeight: 600,
                    marginBottom: '4px'
                  }}>
                    {formatDate(trip.chauffer_pickup_time)}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#e5e7eb'
                  }}>
                    {trip.chauffer_pickup_location || 'Location TBD'}
                  </div>
                </div>
                
                {/* Dropoff Info */}
                {(trip.chauffer_dropoff_location || trip.chauffer_dropoff_time) && (
                  <div style={{
                    background: 'rgba(15, 17, 21, 0.4)',
                    borderRadius: '10px',
                    padding: '10px'
                  }}>
                    <div style={{
                      fontSize: '12px',
                      color: '#9ca3af',
                      marginBottom: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      Drop-off
                    </div>
                    {trip.chauffer_dropoff_time && (
                      <div style={{
                        fontSize: '13px',
                        color: '#10b981',
                        fontWeight: 600,
                        marginBottom: '4px'
                      }}>
                        {formatDate(trip.chauffer_dropoff_time)}
                      </div>
                    )}
                    {trip.chauffer_dropoff_location && (
                      <div style={{
                        fontSize: '14px',
                        color: '#e5e7eb'
                      }}>
                        {trip.chauffer_dropoff_location}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && trips.length === 0 && (
        <div style={{
          padding: '60px 20px',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 13l2-2 4 4 8-8 2 2-10 10-4-4z"/>
            </svg>
          </div>
          <div style={{
            fontSize: '20px',
            fontWeight: 600,
            color: '#e5e7eb',
            marginBottom: '8px'
          }}>
            No upcoming trips
          </div>
          <div style={{
            fontSize: '15px',
            color: '#9ca3af'
          }}>
            You don't have any scheduled trips at the moment.
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{
          margin: '20px',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          borderRadius: '12px',
          padding: '16px',
          color: '#fca5a5',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
          color: '#9ca3af'
        }}>
          Loading trips...
        </div>
      )}

      {/* Refresh Button */}
      {!loading && trips.length > 0 && (
        <div style={{
          padding: '20px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <button
            onClick={loadTrips}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              padding: '12px 24px',
              color: '#cbd5e1',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
            }}
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  )
}