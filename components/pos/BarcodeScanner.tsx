'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Camera, Loader2, X } from 'lucide-react'

interface BarcodeScannerProps {
  open: boolean
  onClose: () => void
  onDetected: (decodedText: string) => void
}

const SCAN_COOLDOWN_MS = 1200

function playSuccessBeep() {
  if (typeof window === 'undefined') return

  const AudioContextConstructor =
    window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

  if (!AudioContextConstructor) return

  const ctx = new AudioContextConstructor()
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.value = 1046

  gain.gain.setValueAtTime(0.0001, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.11)

  oscillator.connect(gain)
  gain.connect(ctx.destination)

  oscillator.start()
  oscillator.stop(ctx.currentTime + 0.12)
  oscillator.onended = () => {
    void ctx.close()
  }
}

export function BarcodeScanner({ open, onClose, onDetected }: BarcodeScannerProps) {
  const readerId = useId().replace(/:/g, '')
  const onDetectedRef = useRef(onDetected)
  const scannerRef = useRef<{
    stop: () => Promise<void>
    clear: () => void
  } | null>(null)

  const lastScanRef = useRef<{ code: string; time: number }>({ code: '', time: 0 })

  const [isStarting, setIsStarting] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    onDetectedRef.current = onDetected
  }, [onDetected])

  useEffect(() => {
    let isMounted = true

    async function stopScanner() {
      const scanner = scannerRef.current
      if (!scanner) return

      try {
        await scanner.stop()
      } catch {
        // Ignore stop failures when scanner is not active.
      }

      try {
        scanner.clear()
      } catch {
        // Ignore clear failures when scanner has already been disposed.
      }

      scannerRef.current = null
      if (isMounted) setIsReady(false)
    }

    async function startScanner() {
      if (!open) {
        await stopScanner()
        return
      }

      try {
        setIsStarting(true)
        setError(null)

        const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode')

        if (!isMounted || !open) return

        const scanner = new Html5Qrcode(readerId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.ITF,
            Html5QrcodeSupportedFormats.CODABAR,
          ],
          verbose: false,
        })

        scannerRef.current = scanner

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 240, height: 130 },
            aspectRatio: 1.8,
          },
          (decodedText) => {
            const code = decodedText.trim()
            if (!code) return

            const now = Date.now()
            const { code: lastCode, time: lastTime } = lastScanRef.current
            if (code === lastCode && now - lastTime < SCAN_COOLDOWN_MS) return

            lastScanRef.current = { code, time: now }
            playSuccessBeep()
            onDetectedRef.current(code)
          },
          () => {
            // Ignore per-frame decode errors while scanning continuously.
          }
        )

        if (isMounted) setIsReady(true)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'No se pudo iniciar la camara.'
        if (isMounted) setError(message)
      } finally {
        if (isMounted) setIsStarting(false)
      }
    }

    void startScanner()

    return () => {
      isMounted = false
      void stopScanner()
    }
  }, [open, readerId])

  if (!open) return null

  return (
    <div className="mt-3 w-full max-w-[320px] rounded-xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur-sm">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Camera size={15} />
          Escaner de barras
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Cerrar escaner"
        >
          <X size={14} />
        </button>
      </div>

      <div className="relative overflow-hidden rounded-lg border border-border bg-black/85">
        {isStarting && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 text-white">
            <Loader2 size={18} className="animate-spin" />
          </div>
        )}
        <div id={readerId} className="w-full [&_video]:h-[170px] [&_video]:w-full [&_video]:object-cover" />
      </div>

      <p className="mt-2 text-center text-xs text-muted-foreground">
        {error
          ? `Error: ${error}`
          : isReady
          ? 'Apunta la camara al codigo para agregarlo al carrito.'
          : 'Inicializando camara...'}
      </p>
    </div>
  )
}
