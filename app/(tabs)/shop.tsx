// app/(tabs)/shop.tsx (FINAL FIX: Header/Mobile Spacing/Web Gap)
import React, { useEffect, useState } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, FlatList, ActivityIndicator, 
    Dimensions, Platform, SafeAreaView, TouchableOpacity 
} from 'react-native';
import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'react-native'; // Status Bar control ke liye

// --- IMPORTS (Check your paths are correct) ---
import { db } from '../../firebaseConfig'; 
import { ProductCard } from './index'; 

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

const COLORS = {
  gradientStart: '#0f0c29', 
  gradientMid: '#302b63',
  gradientEnd: '#24243e',
  textMain: '#ffffff',
  accent: '#00d2ff',
};

// --- PRODUCT CATEGORIES ---
const PRODUCT_CATEGORIES = [
    { key: 'tshirts', title: '01. Normal T-Shirts' },
    { key: 'oversized', title: '02. Oversized Tees' },
    { key: 'cargo', title: '03. Cargo & Joggers' },
    { key: 'jeans', title: '04. Cosmic Denim' },
];

const ShopScreen = () => {
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "products"));
                const items: any[] = [];
                querySnapshot.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));
                setProducts(items);
            } catch (error) { 
                console.error("Error fetching products:", error); 
            } finally { 
                setLoading(false); 
            }
        };
        fetchProducts();
    }, []);

    const getProductsByCategory = (categoryKey: string) => {
        return products.filter(p => p.category === categoryKey);
    };

    // --- SIZING AND MARGIN FIXES ---
    const itemWidth = isWeb ? 600 : 250; 
    // FIX: Web pe 5px ka minimal gap, Mobile pe 15px ka standard gap
    const itemMargin = isWeb ? 5 : 10; 
    
    const allProductsCount = products.length;

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.accent} /></View>;
    
    return (
        <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientMid, COLORS.gradientEnd]} style={styles.fullScreenGradient}>
          <SafeAreaView style={{flex: 1}}>
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                
                {/* --- HEADER --- */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Full Collection</Text>
                    <Text style={styles.headerSubtitle}>Total Items: {allProductsCount}</Text>
                </View>

                {products.length === 0 && (
                    <View style={styles.noProductsView}>
                        <Text style={styles.noProductsText}>No products found in the database.</Text>
                        <Text style={styles.noProductsSubtitle}>Please set 'category' field in Firebase documents.</Text>
                    </View>
                )}

                {/* --- CATEGORY SWIPERS --- */}
                {PRODUCT_CATEGORIES.map((category) => {
                    const categoryProducts = getProductsByCategory(category.key);
                    if (categoryProducts.length === 0) return null;

                    return (
                        // FIX: Section container ko responsive margin di
                        <View key={category.key} style={[styles.sectionContainer, !isWeb && {marginTop: 15}]}> 
                            <Text style={styles.sectionTitle}>{category.title} ({categoryProducts.length})</Text>

                            <View style={{ justifyContent: 'center' }}>
                                <FlatList
                                    data={categoryProducts}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    // SNAP INTERVAL: Item width + Conditional Margin
                                    snapToInterval={itemWidth + itemMargin} 
                                    decelerationRate="fast" 
                                    contentContainerStyle={styles.listContainer}
                                    keyExtractor={(item) => item.id}
                                    renderItem={({ item }) => (
                                        // MARGIN APPLIED: Uses itemMargin variable
                                        <View style={{ width: itemWidth, marginRight: itemMargin }}> 
                                            <ProductCard item={item} router={router} onAddToCart={() => {}} isWeb={isWeb} />
                                        </View>
                                    )}
                                />
                            </View>

                        </View>
                    );
                })}
            </ScrollView>
          </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
  fullScreenGradient: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.gradientStart },
  container: {
    flexGrow: 1,
    paddingBottom: 40,
    // FIX: Upar se thoda padding diya taaki mobile ka title na chipke
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  
  // --- HEADER FIX ---
  header: {
    padding: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: isWeb ? 20 : 10 // Mobile pe header ke baad gap kam kiya
  },
  headerTitle: {
    fontSize: 36,
    color: COLORS.textMain,
    fontWeight: '800',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },

  // --- SECTION FIX ---
  sectionContainer: {
    marginBottom: isWeb ? 25 : 40, // Web gap is fine now, mobile gap is bigger
  },
  sectionTitle: {
    fontSize: 24,
    color: COLORS.textMain,
    fontWeight: '700',
    marginLeft: 20,
    marginBottom: 15,
  },
  
  listContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  noProductsView: {
    padding: 30,
    alignItems: 'center',
  },
  noProductsText: {
    color: COLORS.textMain,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  noProductsSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    textAlign: 'center',
  }
});

export default ShopScreen;