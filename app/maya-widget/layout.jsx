// Minimal layout for the iframe embed — no nav, no BottomNav, transparent bg
export const metadata = { title: 'Maya' }

export default function MayaWidgetLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width,initial-scale=1"/>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          html, body { background: transparent !important; overflow: hidden; height: 100%; font-family: -apple-system, system-ui, sans-serif; }
          @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        `}</style>
      </head>
      <body style={{ background: 'transparent' }}>
        {children}
      </body>
    </html>
  )
}
