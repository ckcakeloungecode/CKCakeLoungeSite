import { Inter, Outfit } from "next/font/google";
import { CartProvider } from "../context/CartContext";
import { AuthProvider } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import FloatingCart from "../components/FloatingCart";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata = {
  title: "CK Cake Lounge",
  description: "Artisan cakes and pastries delivered fresh.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            {children}
            <FloatingCart />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
