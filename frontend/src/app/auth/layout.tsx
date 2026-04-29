export const metadata = {
  title: 'Pharma Flow',
  description: 'plateforme pharma flow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
