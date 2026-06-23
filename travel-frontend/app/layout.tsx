import "./globals.css";
import Navbar from "@/components/navbar"; // Path check kar


import Footer from "@/components/footer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer /> {/* २. इथे फुटर ॲड करा */}
      </body>
    </html>
  );
}


// import Providers from "./Providers"; // आपण बनवलेली फाईल इथे इंपोर्ट कर

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en">
//       <body>
//         <Providers>
//           {children}
//         </Providers>
//       </body>
//     </html>
//   );
// }