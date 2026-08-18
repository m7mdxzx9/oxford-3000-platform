import type { Metadata } from 'next';
import '@/styles/globals.css';
import { ThemeProvider } from '@/components/shared/ThemeProvider';
import { Footer } from '@/components/shared/Footer';

export const metadata: Metadata = {
  title: 'Oxford 3000™ Master Platform - Complete CEFR A1-B2 Lexicon & AI Tutoring',
  description:
    'Master the complete Oxford 3000 American English Lexicon with AI Storytelling, Dual Audio TTS Engines, Speech Evaluation, and Spaced Repetition SRS.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Outfit:wght@100..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Space+Grotesk:wght@300..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background text-foreground font-body antialiased transition-colors duration-200 selection:bg-primary/20 selection:text-primary">
        <ThemeProvider>
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
