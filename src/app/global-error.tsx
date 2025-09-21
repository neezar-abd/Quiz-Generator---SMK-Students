'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    // Report React render errors in App Router
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <div style={{ padding: 24 }}>
          <h2>Terjadi kesalahan yang tidak terduga.</h2>
          <p>Silakan muat ulang halaman atau kembali ke beranda.</p>
        </div>
      </body>
    </html>
  )
}
