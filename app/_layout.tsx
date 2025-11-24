// app/_layout.tsx
import { Stack } from 'expo-router';
import { CartProvider } from '../context/CartContext'; 

export default function RootLayout() {
  return (
    <CartProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Ye (tabs) folder ko dhoond raha hai */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        {/* Ye checkout.tsx file ko dhoond raha hai */}
        <Stack.Screen name="checkout" options={{ presentation: 'modal' }} />
      </Stack>
    </CartProvider>
  );
}