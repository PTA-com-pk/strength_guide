import { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with StrengthGuide. Have questions, suggestions, or want to collaborate? We\'d love to hear from you.',
  openGraph: {
    title: 'Contact Us - StrengthGuide',
    description: 'Get in touch with StrengthGuide. Have questions, suggestions, or want to collaborate?',
    url: `${baseUrl}/contact`,
  },
  alternates: {
    canonical: `${baseUrl}/contact`,
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

