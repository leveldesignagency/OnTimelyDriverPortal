import React, { useEffect, useState } from 'react'
import { useSupabase } from '../lib/SupabaseProvider'

type Trip = {
  id: string
  guest_id: string
  guest_first_name: string
  guest_last_name: string
  guest_email: string | null
  guest_contact_number: string | null
  pickup_time: string | null
  pickup_location: string | null
  dropoff_location: string | null
  dropoff_time: string | null
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
      if (!user) {
        console.warn('[Trips] No authenticated user found')
        return
      }

      console.log('[Trips] Loading driver info for user:', user.id)

      // Get driver info from drivers table
      const { data: driverData, error: driverError } = await supabase
        .from('drivers')
        .select('id, full_name')
        .eq('auth_user_id', user.id)
        .single()

      if (driverError) {
        console.error('[Trips] Error loading driver info:', driverError)
        setError(`Failed to load driver profile: ${driverError.message}`)
        return
      }

      if (driverData) {
        console.log('[Trips] Driver found:', driverData)
        setDriverName(driverData.full_name)
        setDriverId(driverData.id)
      } else {
        console.warn('[Trips] No driver record found for user:', user.id)
        setError('Driver profile not found. Please contact support.')
      }
    } catch (e: any) {
      console.error('[Trips] Failed to load driver info:', e)
      setError('Failed to load driver profile: ' + (e.message || 'Unknown error'))
    }
  }

  const loadTrips = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('[Trips] Loading trips for driver:', { driverId, driverName })
      
      if (!driverId && !driverName) {
        console.warn('[Trips] No driver ID or name available')
        setLoading(false)
        return
      }

      // Query driver_trips table instead of guests table
      // This table is designed for drivers to read (respects RLS policies)
      let query = supabase
        .from('driver_trips')
        .select('id, guest_id, guest_first_name, guest_last_name, guest_email, guest_contact_number, pickup_time, pickup_location, dropoff_location, dropoff_time')

      // Query by driver_id - this is the correct way for driver_trips table
      if (driverId) {
        console.log('[Trips] Querying driver_trips by driver_id:', driverId)
        query = query.eq('driver_id', driverId)
      } else {
        console.warn('[Trips] No driver_id available, cannot query driver_trips')
        setError('Driver ID not found. Please contact support.')
        setLoading(false)
        return
      }

      const { data, error } = await query.order('pickup_time', { ascending: true })

      if (error) {
        console.error('[Trips] Query error:', error)
        throw error
      }

      console.log('[Trips] Raw data from query:', data)
      console.log('[Trips] Number of guests found:', data?.length || 0)

      // Show ALL assigned trips - if they're assigned to this driver, show them
      // Don't filter out guests with missing fields - the driver needs to see all their assignments
      const assignedTrips = data || []

      console.log('[Trips] Assigned trips to display:', assignedTrips.length)
      setTrips(assignedTrips as any)
    } catch (e: any) {
      console.error('[Trips] Error loading trips:', e)
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
                    {nextTrip.guest_first_name} {nextTrip.guest_last_name}
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#10b981'
                  }}>
                    {formatDate(nextTrip.pickup_time)}
                  </div>
                </div>
              </div>
              {/* Contact Info - Always show */}
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
                {nextTrip.guest_email ? (
                  <div style={{
                    fontSize: '14px',
                    color: '#e5e7eb',
                    marginBottom: '4px'
                  }}>
                    📧 {nextTrip.guest_email}
                  </div>
                ) : (
                  <div style={{
                    fontSize: '14px',
                    color: '#9ca3af',
                    fontStyle: 'italic',
                    marginBottom: '4px'
                  }}>
                    Email: Not provided
                  </div>
                )}
                {nextTrip.guest_contact_number ? (
                  <div style={{
                    fontSize: '14px',
                    color: '#e5e7eb'
                  }}>
                    📱 {nextTrip.guest_contact_number}
                  </div>
                ) : (
                  <div style={{
                    fontSize: '14px',
                    color: '#9ca3af',
                    fontStyle: 'italic'
                  }}>
                    Phone: Not provided
                  </div>
                )}
              </div>
              
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
                  {formatDate(nextTrip.pickup_time)}
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
                  {nextTrip.pickup_location || 'Location TBD'}
                </div>
              </div>
              
              {/* Dropoff Info - Always show */}
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
                {nextTrip.dropoff_time ? (
                  <div style={{
                    fontSize: '15px',
                    color: '#10b981',
                    fontWeight: 600,
                    marginBottom: '8px'
                  }}>
                    {formatDate(nextTrip.dropoff_time)}
                  </div>
                ) : (
                  <div style={{
                    fontSize: '15px',
                    color: '#9ca3af',
                    fontStyle: 'italic',
                    fontWeight: 600,
                    marginBottom: '8px'
                  }}>
                    Time: TBD
                  </div>
                )}
                <div style={{
                  fontSize: '13px',
                  color: '#9ca3af',
                  marginBottom: '4px'
                }}>
                  Location
                </div>
                {nextTrip.dropoff_location ? (
                  <div style={{
                    fontSize: '15px',
                    color: '#e5e7eb',
                    fontWeight: 500
                  }}>
                    {nextTrip.dropoff_location}
                  </div>
                ) : (
                  <div style={{
                    fontSize: '15px',
                    color: '#9ca3af',
                    fontStyle: 'italic',
                    fontWeight: 500
                  }}>
                    Location TBD
                  </div>
                )}
              </div>
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
                      {trip.guest_first_name} {trip.guest_last_name}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#10b981',
                      fontWeight: 500
                    }}>
                      {formatDate(trip.pickup_time)}
                    </div>
                  </div>
                </div>
                {/* Contact Info - Always show */}
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
                  {trip.guest_email ? (
                      <div style={{
                        fontSize: '13px',
                        color: '#e5e7eb',
                        marginBottom: '2px'
                      }}>
                        📧 {trip.guest_email}
                      </div>
                    ) : (
                      <div style={{
                        fontSize: '13px',
                        color: '#9ca3af',
                        fontStyle: 'italic',
                        marginBottom: '2px'
                      }}>
                        Email: Not provided
                      </div>
                    )}
                    {trip.guest_contact_number ? (
                      <div style={{
                        fontSize: '13px',
                        color: '#e5e7eb'
                      }}>
                        📱 {trip.guest_contact_number}
                      </div>
                    ) : (
                      <div style={{
                        fontSize: '13px',
                        color: '#9ca3af',
                        fontStyle: 'italic'
                      }}>
                        Phone: Not provided
                      </div>
                    )}
                </div>
                
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
                    {formatDate(trip.pickup_time)}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#e5e7eb'
                  }}>
                    {trip.pickup_location || 'Location TBD'}
                  </div>
                </div>
                
                {/* Dropoff Info - Always show */}
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
                  {trip.dropoff_time ? (
                    <div style={{
                      fontSize: '13px',
                      color: '#10b981',
                      fontWeight: 600,
                      marginBottom: '4px'
                    }}>
                      {formatDate(trip.dropoff_time)}
                    </div>
                  ) : (
                    <div style={{
                      fontSize: '13px',
                      color: '#9ca3af',
                      fontStyle: 'italic',
                      fontWeight: 600,
                      marginBottom: '4px'
                    }}>
                      Time: TBD
                    </div>
                  )}
                  <div style={{
                    fontSize: '12px',
                    color: '#9ca3af',
                    marginBottom: '4px'
                  }}>
                    Location
                  </div>
                  {trip.dropoff_location ? (
                    <div style={{
                      fontSize: '14px',
                      color: '#e5e7eb'
                    }}>
                      {trip.dropoff_location}
                    </div>
                  ) : (
                    <div style={{
                      fontSize: '14px',
                      color: '#9ca3af',
                      fontStyle: 'italic'
                    }}>
                      Location TBD
                    </div>
                  )}
                </div>
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
            No trips assigned
          </div>
          <div style={{
            fontSize: '15px',
            color: '#9ca3af'
          }}>
            You don't have any trips assigned to you at the moment.
          </div>
          {error && (
            <div style={{
              marginTop: '16px',
              fontSize: '13px',
              color: '#fca5a5'
            }}>
              {error}
            </div>
          )}
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