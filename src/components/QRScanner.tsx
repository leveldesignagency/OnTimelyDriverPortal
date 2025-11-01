import React, { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'

type QRScannerProps = {
  isOpen: boolean
  onClose: () => void
  onScan: (guestId: string) => void
}

export default function QRScanner({ isOpen, onClose, onScan }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)

  useEffect(() => {
    if (!isOpen) {
      // Clean up when modal closes
      if (readerRef.current) {
        readerRef.current.reset()
        readerRef.current = null
      }
      return
    }

    // Initialize scanner
    const startScanning = async () => {
      try {
        setError(null)
        setScanning(true)

        const reader = new BrowserMultiFormatReader()
        readerRef.current = reader

        // Get available video devices
        const devices = await reader.listVideoInputDevices()
        const deviceId = devices.length > 0 ? devices[0].deviceId : undefined

        if (!videoRef.current) {
          setError('Video element not available')
          return
        }

        // Start continuous scanning
        reader.decodeFromVideoDevice(deviceId, videoRef.current, (result, err) => {
          if (result) {
            // Extract guest ID from QR code
            // QR code format: guest-{uuid} or just {uuid}
            const text = result.getText()
            let guestId = text

            // Handle different QR code formats
            if (text.startsWith('guest-')) {
              guestId = text.replace('guest-', '')
            } else if (text.includes('/guest/') || text.includes('guestId=')) {
              // Try to extract from URL
              try {
                const urlParams = new URLSearchParams(text.split('?')[1])
                guestId = urlParams.get('guestId') || text
              } catch {
                guestId = text
              }
            }

            // Validate UUID format
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
            if (!uuidRegex.test(guestId)) {
              setError('Invalid QR code format. Please scan a valid guest QR code.')
              return
            }

            // Stop scanning and call onScan
            reader.reset()
            readerRef.current = null
            setScanning(false)
            onScan(guestId)
          } else if (err && err.name !== 'NotFoundException') {
            // NotFoundException is expected when no QR code is detected yet
            console.error('QR scan error:', err)
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
              setError('Camera access denied. Please allow camera access and try again.')
              setScanning(false)
            }
          }
        })
      } catch (err: any) {
        console.error('QR scan error:', err)
        if (err.name === 'NotFoundException') {
          setError('No QR code detected. Please ensure the QR code is visible.')
        } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Camera access denied. Please allow camera access and try again.')
        } else if (err.name === 'NotFoundError') {
          setError('No camera found. Please connect a camera device.')
        } else {
          setError(err.message || 'Failed to scan QR code. Please try again.')
        }
        setScanning(false)
      }
    }

    startScanning()

    // Cleanup on unmount
    return () => {
      if (readerRef.current) {
        readerRef.current.reset()
        readerRef.current = null
      }
    }
  }, [isOpen, onScan])

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        style={{
          background: '#1a1a1a',
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '500px',
          width: '100%',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#e5e7eb',
            margin: 0
          }}>
            Scan Guest QR Code
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '8px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            ×
          </button>
        </div>

        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1',
          borderRadius: '12px',
          overflow: 'hidden',
          background: '#000',
          marginBottom: '16px'
        }}>
          <video
            ref={videoRef}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            playsInline
            muted
          />
          {scanning && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#10b981',
              fontSize: '14px',
              fontWeight: 600,
              background: 'rgba(0, 0, 0, 0.7)',
              padding: '8px 16px',
              borderRadius: '8px'
            }}>
              Scanning...
            </div>
          )}
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '10px',
            padding: '12px',
            color: '#fca5a5',
            fontSize: '14px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <div style={{
          fontSize: '13px',
          color: '#9ca3af',
          textAlign: 'center',
          lineHeight: '1.5'
        }}>
          Position the QR code within the frame
        </div>
      </div>
    </div>
  )
}

