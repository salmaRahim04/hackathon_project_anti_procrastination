'use client'
// This page is embedded as an iframe by the Chrome extension.
// It renders the full MayaAgent but positioned at the bottom of the iframe frame.
import MayaAgent from '@/components/MayaAgent'

export default function MayaWidgetPage() {
  return (
    <div style={{ width: '100%', height: '100vh', background: 'transparent', position: 'relative' }}>
      <MayaAgent extensionMode />
    </div>
  )
}
