"use client";

import { GoogleOAuthProvider } from '@react-oauth/google';

export default function Providers({ children }: { children: React.ReactNode }) {
  // तुझा Client ID इथे पेस्ट केला आहे
  const clientId = "591920054629-m595eoigo07hl5gapp8bb4n95b8l34h0.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}