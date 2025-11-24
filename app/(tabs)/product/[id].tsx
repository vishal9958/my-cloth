// app/(tabs)/product/[id].tsx (FINAL FIX: Correct Import Paths)

import React, { useEffect, useState, useRef } from 'react';
import { 
  View, Text, Image, StyleSheet, ScrollView, 
  TouchableOpacity, ActivityIndicator, Platform, useWindowDimensions, Animated, Easing, Alert
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient'; 

// --- FIXED PATHS (3 Levels Up) ---
import { db } from '../../../firebaseConfig'; 
import { useCart } from '../../../context/CartContext'; 

const COLORS = {
  gradientStart: '#0f0c29', 
  gradientMid: '#302b63',
  gradientEnd: '#24243e',   
  
  surface: 'rgba(255,255,255,0.05)',
  textMain: '#ffffff',
  textLight: '#e0e0e0',
  accent: '#00d2ff',         
  border: 'rgba(255, 255, 255, 0.15)',
};

const RotatingShirt = ({ imageUrl, style, color }: { imageUrl: string, style: any, color: string }) => {
  const rotation = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.timing(rotation, { toValue: 1, duration: 15000, easing: Easing.linear, useNativeDriver: Platform.OS !== 'web' })).start();
  }, []);
  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  
  return (
    <Animated.Image 
      source={{ uri: imageUrl }} 
      style={[style, { transform: [{ rotateY: spin }], tintColor: color === '#ffffff' ? undefined : color }]} 
      resizeMode="contain" 
    />
  );
};

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const isWeb = width > 900; 
  const router = useRouter();

  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('#ffffff'); 
  const [colorName, setColorName] = useState('White');

  const sizes = ['S', 'M', 'L', 'XL'];
  const colors = [
    { name: 'Black', hex: '#000000' }, 
    { name: 'White', hex: '#ffffff' }, 
    { name: 'Pink', hex: '#FF00FF' },
    { name: 'Cyan', hex: '#00d2ff' }
  ]; 

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productId = Array.isArray(id) ? id[0] : id;
        if(!productId) return;
        const docRef = doc(db, "products", productId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setProduct(docSnap.data());
      } catch (error) { console.error("Error:", error); } 
      finally { setLoading(false); }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, colorName); 
    setTimeout(() => {
      router.push('/'); 
    }, 1500);
  };

  if (loading) return (
    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.fullScreenGradient}>
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.accent} /></View>
    </LinearGradient>
  );
  if (!product) return (
    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.fullScreenGradient}>
        <View style={styles.center}><Text style={{color: COLORS.textMain}}>Product not found!</Text></View>
    </LinearGradient>
  );

  return (
    <>
      <Stack.Screen options={{ 
        title: "Product Details", 
        headerStyle: { backgroundColor: '#0f0c29' }, 
        headerTintColor: '#fff',
        headerShadowVisible: false, 
      }} />

      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientMid, COLORS.gradientEnd]}
        style={styles.fullScreenGradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.mainWrapper, isWeb && styles.mainWrapperWeb]}>
            
            {/* LEFT: IMAGE */}
            <View style={[styles.imageContainer, isWeb && styles.imageContainerWeb]}>
               <View style={styles.glowCircle} />
              <RotatingShirt imageUrl={product.imageUrl} style={styles.image} color={selectedColor} />
            </View>

            {/* RIGHT: DETAILS */}
            <View style={[styles.detailsContainer, isWeb && styles.detailsContainerWeb]}>
              <Text style={styles.brandTag}>COSMIC COLLECTION</Text>
              <Text style={styles.title}>{product.name}</Text>
              <Text style={styles.price}>Rs. {product.price}</Text>
              <Text style={styles.description}>{product.description || "Unleash your inner explorer with this premium streetwear. Crafted from cosmic-grade materials for ultimate comfort and style."}</Text>

              <Text style={styles.optionLabel}>Select Color: {colorName}</Text>
              <View style={styles.colorRow}>
                {colors.map((c, i) => (
                  <TouchableOpacity 
                    key={i} 
                    onPress={() => {
                        setSelectedColor(c.hex);
                        setColorName(c.name);
                    }} 
                    style={[
                        styles.colorSwatch, 
                        { backgroundColor: c.hex }, 
                        selectedColor === c.hex && styles.colorSwatchSelected
                    ]} 
                  />
                ))}
              </View>

              <Text style={styles.optionLabel}>Select Size: {selectedSize}</Text>
              <View style={styles.sizeRow}>
                {sizes.map((size) => (
                  <TouchableOpacity 
                    key={size} 
                    style={[styles.sizeBox, selectedSize === size && styles.sizeBoxSelected]} 
                    onPress={() => setSelectedSize(size)}
                  >
                    <Text style={[
                        styles.sizeText, 
                        selectedSize === size && styles.sizeTextSelected
                    ]}>{size}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart}>
                <Text style={styles.addToCartText}>ADD TO CART - Rs. {product.price}</Text>
              </TouchableOpacity>

              <View style={styles.fabricSection}>
                <Text style={styles.infoTitle}>Material & Care</Text>
                <Text style={styles.infoText}>100% Premium Cotton. Machine wash cold.</Text>
              </View>

            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  fullScreenGradient: { flex: 1 },
  scrollContent: { paddingBottom: 50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mainWrapper: { flexDirection: 'column' },
  mainWrapperWeb: { flexDirection: 'row', maxWidth: 1200, alignSelf: 'center', marginTop: 40, paddingHorizontal: 40 },
  imageContainer: { width: '100%', height: 450, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 20, marginBottom: 20 },
  imageContainerWeb: { width: '50%', height: 600, padding: 20, marginBottom: 0 },
  image: { width: '80%', height: '80%', zIndex: 2 },
  glowCircle: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: COLORS.accent, opacity: 0.15, filter: 'blur(50px)' },
  detailsContainer: { padding: 24 },
  detailsContainerWeb: { width: '50%', paddingLeft: 60, paddingTop: 40 },
  brandTag: { color: COLORS.accent, fontSize: 12, letterSpacing: 2, fontWeight: 'bold', marginBottom: 10 },
  title: { fontSize: 42, color: COLORS.textMain, marginBottom: 10, fontWeight: 'bold' },
  price: { fontSize: 28, color: COLORS.textMain, fontWeight: '600', marginBottom: 20 },
  description: { fontSize: 16, color: COLORS.textLight, lineHeight: 26, marginBottom: 40 },
  optionLabel: { fontSize: 14, color: COLORS.textMain, fontWeight: 'bold', marginBottom: 15, textTransform: 'uppercase' },
  colorRow: { flexDirection: 'row', marginBottom: 30, gap: 15 },
  colorSwatch: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  colorSwatchSelected: { borderColor: COLORS.accent, borderWidth: 3 },
  sizeRow: { flexDirection: 'row', marginBottom: 40, gap: 15 },
  sizeBox: { width: 50, height: 50, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  sizeBoxSelected: { borderColor: COLORS.accent, backgroundColor: COLORS.accent },
  sizeText: { fontSize: 14, color: COLORS.textMain },
  sizeTextSelected: { color: '#fff', fontWeight: 'bold' },
  addToCartBtn: { backgroundColor: COLORS.accent, paddingVertical: 20, alignItems: 'center', borderRadius: 30, marginBottom: 30, shadowColor: COLORS.accent, shadowOpacity: 0.4, shadowRadius: 10 },
  addToCartText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1.5 },
  fabricSection: { paddingTop: 30, borderTopWidth: 1, borderTopColor: COLORS.border },
  infoTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textMain, marginBottom: 5 },
  infoText: { fontSize: 14, color: COLORS.textLight },
});