// app/checkout.tsx (SAVES ORDER + REDIRECTS TO ORDER PAGE)

import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Platform, ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useCart } from '../context/CartContext';
import { collection, addDoc } from 'firebase/firestore'; 
import { db } from '../firebaseConfig';

const COLORS = {
  gradientStart: '#0f0c29', gradientEnd: '#24243e',
  textMain: '#ffffff', accent: '#00d2ff', border: 'rgba(255, 255, 255, 0.2)',
  cardBg: 'rgba(255, 255, 255, 0.05)', success: '#2ecc71'
};

export default function CheckoutScreen() {
  const router = useRouter();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD'); 
  
  // Payment Details
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');

  const [loading, setLoading] = useState(false);

  const subTotal = getTotalPrice();
  const deliveryFee = subTotal > 0 ? 50 : 0; 
  const grandTotal = subTotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
        if(Platform.OS === 'web') alert("Cart is empty!");
        return;
    }
    
    // Validation
    if (!name || !address || !phone) {
      if(Platform.OS === 'web') window.alert("Please fill Name and Address!");
      else Alert.alert("Missing Details", "Please fill Name and Address!");
      return;
    }

    if (paymentMethod === 'UPI' && !upiId.includes('@')) {
        if(Platform.OS === 'web') window.alert("Invalid UPI ID!");
        else Alert.alert("Error", "Enter valid UPI ID");
        return;
    }

    setLoading(true);

    try {
        // 1. SAVE TO FIREBASE
        const orderData = {
            items: cartItems,
            totalAmount: grandTotal,
            customer: { name, address, phone },
            paymentMethod: paymentMethod,
            paymentDetails: paymentMethod === 'UPI' ? upiId : paymentMethod === 'Card' ? cardNumber : 'Cash',
            date: new Date().toLocaleString(),
            status: 'Placed'
        };

        await addDoc(collection(db, "orders"), orderData);

        // 2. SUCCESS & REDIRECT
        setLoading(false);
        clearCart();
        
        if(Platform.OS === 'web') {
            if(window.confirm("Order Placed Successfully! View Order?")) {
                router.replace('/orders'); // Go to Orders Page
            } else {
                router.push('/');
            }
        } else {
            Alert.alert("Success! 🚀", "Order Placed Successfully.", [
                { text: "View Orders", onPress: () => router.replace('/orders') } // Go to Orders Page
            ]);
        }

    } catch (error) {
        setLoading(false);
        console.error(error);
        alert("Order Failed. Try again.");
    }
  };

  return (
    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        <Text style={styles.header}>Checkout</Text>

        {/* 1. BILL SUMMARY */}
        <View style={styles.card}>
            <Text style={styles.cardTitle}>BILL SUMMARY</Text>
            {cartItems.map((item, index) => (
                <View key={index} style={styles.row}>
                    <Text style={styles.textDim}>{item.name} ({item.selectedSize})</Text>
                    <Text style={styles.text}>₹{item.price}</Text>
                </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.row}>
                <Text style={styles.text}>Item Total</Text>
                <Text style={styles.text}>₹{subTotal}</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.text}>Delivery Fee</Text>
                <Text style={{color: COLORS.success}}>+ ₹{deliveryFee}</Text>
            </View>
            <View style={[styles.divider, {backgroundColor: COLORS.accent}]} />
            <View style={styles.row}>
                <Text style={styles.totalLabel}>Grand Total</Text>
                <Text style={styles.totalAmount}>₹{grandTotal}</Text>
            </View>
        </View>

        {/* 2. SHIPPING FORM */}
        <View style={styles.form}>
            <Text style={styles.sectionTitle}>SHIPPING ADDRESS</Text>
            <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#666" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Phone Number" placeholderTextColor="#666" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
            <TextInput style={[styles.input, {height: 80}]} placeholder="Full Address" placeholderTextColor="#666" multiline value={address} onChangeText={setAddress} />
        </View>

        {/* 3. PAYMENT METHOD */}
        <View style={styles.form}>
            <Text style={styles.sectionTitle}>PAYMENT MODE</Text>
            <View style={styles.paymentRow}>
                {['UPI', 'Card', 'COD'].map((method) => (
                    <TouchableOpacity 
                        key={method} 
                        style={[styles.payOption, paymentMethod === method && styles.payOptionActive]}
                        onPress={() => setPaymentMethod(method)}
                    >
                        <Text style={[styles.payText, paymentMethod === method && {color: '#000'}]}>{method}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* DYNAMIC INPUTS */}
            {paymentMethod === 'UPI' && (
                <View style={styles.paymentInputBox}>
                    <Text style={{color: '#aaa', marginBottom: 5}}>Enter UPI ID</Text>
                    <TextInput 
                        style={styles.input} placeholder="user@upi" placeholderTextColor="#666"
                        value={upiId} onChangeText={setUpiId}
                    />
                </View>
            )}

            {paymentMethod === 'Card' && (
                <View style={styles.paymentInputBox}>
                    <Text style={{color: '#aaa', marginBottom: 5}}>Card Details</Text>
                    <TextInput 
                        style={styles.input} placeholder="XXXX-XXXX-XXXX-XXXX" placeholderTextColor="#666"
                        keyboardType="numeric" maxLength={16} value={cardNumber} onChangeText={setCardNumber}
                    />
                </View>
            )}

            {paymentMethod === 'COD' && (
                <View style={styles.paymentInputBox}>
                    <Text style={{color: COLORS.success, fontWeight: 'bold', textAlign: 'center'}}>✅ Pay Cash upon Delivery</Text>
                </View>
            )}
        </View>

        {/* 4. PAY BUTTON */}
        <TouchableOpacity 
            style={[styles.payBtn, loading && {opacity: 0.7}]} 
            onPress={handlePlaceOrder}
            disabled={loading}
        >
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.payBtnText}>PAY ₹{grandTotal}</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={{marginTop: 20}}>
            <Text style={{color: '#888', textDecorationLine: 'underline'}}>Cancel</Text>
        </TouchableOpacity>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, alignItems: 'center', paddingBottom: 50 },
  header: { fontSize: 28, color: '#fff', fontWeight: 'bold', marginBottom: 20, marginTop: 10, letterSpacing: 1 },
  card: { width: '100%', maxWidth: 500, backgroundColor: COLORS.cardBg, padding: 20, borderRadius: 15, borderWidth: 1, borderColor: COLORS.border, marginBottom: 30 },
  cardTitle: { color: COLORS.accent, fontSize: 14, fontWeight: 'bold', marginBottom: 15, letterSpacing: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  text: { color: '#fff', fontSize: 14 },
  textDim: { color: '#aaa', fontSize: 14 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 10 },
  totalLabel: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  totalAmount: { color: COLORS.accent, fontSize: 22, fontWeight: 'bold' },
  form: { width: '100%', maxWidth: 500, marginBottom: 25 },
  sectionTitle: { color: '#aaa', fontSize: 12, fontWeight: 'bold', marginBottom: 10, letterSpacing: 1 },
  input: { backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 15, color: '#fff', marginBottom: 15, fontSize: 16 },
  paymentRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  payOption: { flex: 1, padding: 15, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  payOptionActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  payText: { color: '#fff', fontWeight: 'bold' },
  paymentInputBox: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border },
  payBtn: { backgroundColor: COLORS.accent, width: '100%', maxWidth: 500, padding: 18, borderRadius: 30, alignItems: 'center', shadowColor: COLORS.accent, shadowOpacity: 0.5, shadowRadius: 15, elevation: 5 },
  payBtnText: { color: '#000', fontWeight: 'bold', fontSize: 18, letterSpacing: 1 },
});