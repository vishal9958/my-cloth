// app/orders.tsx (MY ORDERS PAGE)

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useRouter } from 'expo-router';

const COLORS = {
  gradientStart: '#0f0c29', gradientEnd: '#24243e',
  textMain: '#ffffff', accent: '#00d2ff', cardBg: 'rgba(255, 255, 255, 0.05)',
};

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const q = query(collection(db, "orders")); // Real app me 'where' use karke user filter karte hain
        const querySnapshot = await getDocs(q);
        const items: any[] = [];
        querySnapshot.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));
        setOrders(items);
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };
    fetchOrders();
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.accent} /></View>;

  return (
    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()}><Text style={{fontSize: 24, color: '#fff'}}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>MY ORDERS</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {orders.length === 0 ? (
            <Text style={{color: '#888', marginTop: 50}}>No orders found.</Text>
        ) : (
            orders.map((order) => (
                <View key={order.id} style={styles.orderCard}>
                    <View style={styles.orderHeader}>
                        <Text style={styles.date}>{order.date}</Text>
                        <Text style={[styles.status, {color: '#2ecc71'}]}>{order.status}</Text>
                    </View>
                    
                    {order.items.map((item: any, index: number) => (
                        <Text key={index} style={styles.itemName}>
                            • {item.name} ({item.selectedSize})
                        </Text>
                    ))}

                    <View style={styles.divider} />
                    <View style={styles.footer}>
                        <Text style={styles.totalLabel}>Total Paid</Text>
                        <Text style={styles.totalAmount}>₹{order.totalAmount}</Text>
                    </View>
                </View>
            ))
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0c29' },
  navbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, marginTop: 30 },
  headerTitle: { fontSize: 20, color: '#fff', fontWeight: 'bold', letterSpacing: 1 },
  scroll: { padding: 20 },
  
  orderCard: { backgroundColor: COLORS.cardBg, padding: 20, borderRadius: 15, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  date: { color: '#888', fontSize: 12 },
  status: { fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' },
  itemName: { color: '#ccc', fontSize: 14, marginBottom: 5 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 15 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: '#fff', fontSize: 14 },
  totalAmount: { color: COLORS.accent, fontSize: 18, fontWeight: 'bold' },
});