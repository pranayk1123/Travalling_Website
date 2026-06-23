"use client"; // हे सगळ्यात महत्त्वाचं आहे!

import { GoogleOAuthProvider } from '@react-oauth/google';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId="591920054629-m595eoigo07hl5gapp8bb4n95b8l34h0.apps.googleusercontent.com">
      {children}
    </GoogleOAuthProvider>
  );
}