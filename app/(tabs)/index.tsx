// app/(tabs)/index.tsx (UPDATED: only mobile gap fixes)
import React, { useEffect, useState, useRef } from 'react';
import { 
  View, Text, Image, StyleSheet, ScrollView, 
  TouchableOpacity, ActivityIndicator, Animated, Easing, useWindowDimensions, Platform, Pressable, TextInput, Modal, FlatList, SafeAreaView, StatusBar 
} from 'react-native';
import { useRouter } from 'expo-router';
// index.tsx ke top par imports mein jodo
import { collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';

import { LinearGradient } from 'expo-linear-gradient';

// --- IMPORTS ---
import { db } from '../../firebaseConfig'; 
import { useCart } from '../../context/CartContext'; 

// --- THEME COLORS ---
const COLORS = {
  gradientStart: '#0f0c29', 
  gradientMid: '#302b63',
  gradientEnd: '#24243e',
  textMain: '#ffffff',
  textLight: '#b0b0b0',
  accent: '#00d2ff',    
  accentSecondary: '#928DAB', 
  gold: '#FFD700',      
  glassCard: 'rgba(255, 255, 255, 0.05)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  delete: '#ff3838',
};

// --- 1. ROTATING SHIRT COMPONENT ---
const RotatingShirt = () => {
  const rotation = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1, duration: 15000, easing: Easing.linear, useNativeDriver: Platform.OS !== 'web',
      })
    ).start();
  }, []);
  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <View style={styles.shirtContainer}>
        <View style={styles.glowCircle} />
        <Animated.Image 
            source={{ uri: 'https://i.ibb.co/CKG5Kwwz/abf7135477e37e25f9fd36fcb88838cd-removebg-preview.png' }} 
            style={[styles.heroImage3D, { transform: [{ rotateY: spin }] }]} 
            resizeMode="contain" 
        />
    </View>
  );
};

// --- 2. PRODUCT CARD ---
const ProductCard = ({ item, router, onAddToCart, isWeb }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  const scaleVal = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleVal, {
      toValue: isHovered ? 1.03 : 1,
      useNativeDriver: Platform.OS !== 'web',
      friction: 8,
    }).start();
  }, [isHovered]);

  return (
    <Pressable
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      onPress={() => router.push(`/product/${item.id}`)}
      // NOTE: removed mobile width override here so outer wrapper controls width
      style={[styles.cardContainer, isWeb ? { width: '30%' } : {}]} 
    >
      <Animated.View style={[styles.card, { transform: [{ scale: scaleVal }] }]}>
        <LinearGradient colors={[COLORS.glassCard, 'rgba(0,0,0,0.2)']} style={styles.cardGradient}>
            <View style={styles.imageWrapper}>
                <View style={styles.badge}><Text style={styles.badgeText}>NEW</Text></View>
                <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="contain" />
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.productDesc}>Cosmic Cotton</Text>
                <View style={styles.priceRow}>
                    <Text style={styles.price}>₹{item.price}</Text>
                    <TouchableOpacity 
                        style={styles.miniBtn} 
                        onPress={(e) => { e.stopPropagation(); onAddToCart(item); }}
                    >
                        <Text style={{color: '#000', fontWeight: 'bold', fontSize: 10}}>ADD</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = width > 900; 
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCartVisible, setIsCartVisible] = useState(false);
  
  // --- MENU STATE & ANIMATION ---
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Animation Value (0 to 1)
  const menuAnim = useRef(new Animated.Value(0)).current; 

  const { cartItems, addToCart, removeFromCart, getTotalPrice } = useCart();
  // --- Newsletter (minimal, mobile-friendly) ---
const [newsletterEmail, setNewsletterEmail] = useState('');
const [newsletterMsg, setNewsletterMsg] = useState('');
const [newsletterLoading, setNewsletterLoading] = useState(false);
const [newsletterSuccess, setNewsletterSuccess] = useState(null);
const [newsletterError, setNewsletterError] = useState(null);

const handleSubscribe = async () => {
  setNewsletterError(null);
  setNewsletterSuccess(null);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newsletterEmail.trim())) {
    setNewsletterError('Please enter a valid email.');
    return;
  }
  if (!newsletterMsg.trim()) {
    setNewsletterError('Please enter a short message.');
    return;
  }
  setNewsletterLoading(true);
  try {
    await addDoc(collection(db, 'newsletter'), {
      email: newsletterEmail.trim(),
      message: newsletterMsg.trim(),
      createdAt: serverTimestamp()
    });
    setNewsletterSuccess('Thanks — message received.');
    setNewsletterEmail('');
    setNewsletterMsg('');
  } catch (err) {
    console.error('Newsletter save error:', err);
    setNewsletterError('Something went wrong. Try again later.');
  } finally {
    setNewsletterLoading(false);
  }
};


// --- SCROLL TO TRENDING: minimal changes ---
const scrollRef = useRef<ScrollView | null>(null);
const [trendingY, setTrendingY] = useState<number>(0);

// --- MOBILE CAROUSEL CONSTANTS (only for mobile) ---
const CARD_WIDTH = 220;    // tweak between 200-260 if needed
const ITEM_SPACING = 12;

useEffect(() => {
  const fetchProducts = async () => {
    try {
      const productsRef = collection(db, "products");
      const q = query(productsRef, where('isFeatured', '==', true)); 
      const querySnapshot = await getDocs(q); 
      const items: any[] = [];
      querySnapshot.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));
      setProducts(items);
    } catch (error) { 
      console.error(error); 
    } 
    finally { 
      setLoading(false); 
    }
  };
  fetchProducts();
}, []);

  // Toggle Menu Function with Animation
  const toggleMenu = () => {
    const toValue = isMenuOpen ? 0 : 1;
    
    Animated.timing(menuAnim, {
      toValue,
      duration: 300, // Speed of rotation
      useNativeDriver: true,
      easing: Easing.ease,
    }).start();
    
    setIsMenuOpen(!isMenuOpen);
  };

  // Interpolate Rotation: 0 to 90 degrees
  const menuRotate = menuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg']
  });

  const handleQuickAdd = (product: any) => {
    addToCart(product, 'M', 'Black'); 
  };

  // scroll helper
  const scrollToTrending = () => {
    try {
      if (scrollRef?.current && typeof trendingY === 'number') {
        scrollRef.current.scrollTo({ y: trendingY, animated: true } as any);
      }
    } catch (err) {
      if (Platform.OS === 'web') window.scrollTo({ top: trendingY, behavior: 'smooth' } as any);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.accent} /></View>;

  return (
    <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientMid, COLORS.gradientEnd]}
        style={styles.fullScreenGradient}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{flex: 1, paddingTop: Platform.OS === 'android' ? 10 : 0}}>
        
      {/* --- NAVBAR (LEFT HAMBURGER + LOGO, CENTER LINKS (absolute) ON WEB, RIGHT ICONS) --- */}
      <View style={[styles.navbar, !isWeb && {paddingHorizontal: 20}]}>

        {/* LEFT: Hamburger (mobile) + Logo */}
        <View style={styles.navLeft}>
          {!isWeb && (
            <TouchableOpacity onPress={toggleMenu} style={styles.hamburgerBtn}>
              <Animated.Text style={{
                  fontSize: 26,
                  color: 'white',
                  lineHeight: 30,
                  transform: [
                      { rotate: menuRotate },
                      { translateY: Platform.OS === 'android' ? 2 : 0 }
                  ]
              }}>
                {isMenuOpen ? '✕' : '☰'}
              </Animated.Text>
            </TouchableOpacity>
          )}
          <Text style={styles.logoText}>MY CLOTH</Text>
        </View>

        {/* CENTER: nav links (absolute centered on web) */}
        {isWeb && (
          <View style={styles.navCenter}>
            <View style={styles.navLinks}>
               <Text style={styles.navLink} onPress={() => router.push('/')}>Home</Text>
               <Text style={styles.navLink} onPress={() => router.push('/shop')}>Shop</Text>
            </View>
          </View>
        )}

        {/* RIGHT: icons (profile + cart) */}
        <View style={styles.navRightSection}>
           <TouchableOpacity onPress={() => router.push('/profile')} style={{marginRight: 20}}>
              <Text style={{fontSize: 22}}>👤</Text>
           </TouchableOpacity>

           <TouchableOpacity onPress={() => setIsCartVisible(true)} style={{position: 'relative'}}>
              <Text style={{fontSize: 22, color: 'white'}}>🛒</Text>
              {cartItems.length > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
                </View>
              )}
           </TouchableOpacity>
        </View>
      </View>

      {/* --- MOBILE MENU OVERLAY --- */}
      {!isWeb && isMenuOpen && (
          <View style={styles.mobileMenu}>
             <TouchableOpacity style={styles.menuItem} onPress={() => {toggleMenu(); router.push('/')}}>
                 <Text style={styles.menuText}>Home</Text>
             </TouchableOpacity>
             <TouchableOpacity style={styles.menuItem} onPress={() => {toggleMenu(); router.push('/shop')}}>
                 <Text style={styles.menuText}>Shop</Text>
             </TouchableOpacity>
          </View>
      )}

      <ScrollView ref={scrollRef} contentContainerStyle={{ flexGrow: 1, paddingBottom: Platform.OS === 'web' ? 20 : 40 , justifyContent: 'space-between', }}>
        
        {/* HERO SECTION */}
        <View style={styles.heroSection}>
          <View style={[styles.heroContent, isWeb ? styles.heroContentWeb : styles.heroContentMobile]}>
            <View style={styles.heroTextSide}>
              <View style={styles.brandTagContainer}>
                <Text style={styles.heroBrand}>PREMIUM COLLECTION 2025</Text>
              </View>
              <Text style={[styles.heroTitle, !isWeb && {fontSize: 40, lineHeight: 45}]}>
                WEAR THE <Text style={{color: COLORS.accent}}>COSMOS.</Text>
              </Text>
              <Text style={styles.heroSubtitle}>Experience the fusion of luxury fabric and interstellar design.</Text>
              <View style={styles.heroButtons}>
                <TouchableOpacity style={styles.btnPrimary}>
                    <Text style={styles.btnTextPrimary}>EXPLORE</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.heroModelSide}>
               <RotatingShirt />
            </View>
          </View>
        </View>

         {/* PRODUCT GRID - CLEAN CODE */}
<View style={styles.sectionContainer} onLayout={(e) => setTrendingY(e.nativeEvent.layout.y)}>
  <View style={styles.sectionHeader}>
      <Text style={styles.sectionTag}>FRESH ARRIVALS</Text>
      <Text style={styles.sectionTitle}>Trending Gear</Text>
  </View>

  {isWeb ? (
    /* --- WEB VIEW (GRID) --- */
    <View style={[styles.grid, styles.gridWeb]}>
       {products.length > 0 ? products.map((item) => (
         <ProductCard
           key={item.id}
           item={item}
           router={router}
           onAddToCart={handleQuickAdd}
           isWeb={true}
         />
       )) : <Text style={{color:'white'}}>Loading...</Text>}

    </View>
  ) : (

    /* --- MOBILE VIEW (HORIZONTAL SCROLL) --- */
    <View style={{ height: 390, justifyContent: 'center' }}>
      <FlatList
        data={products}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToAlignment="start"
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + ITEM_SPACING}
        contentContainerStyle={{ paddingHorizontal: 20, alignItems: 'center' }}
        ItemSeparatorComponent={() => <View style={{ width: ITEM_SPACING }} />}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
           <View style={{ width: CARD_WIDTH }}>
              <ProductCard
                 item={item}
                 router={router}
                 onAddToCart={handleQuickAdd}
                 isWeb={false}
              />
           </View>
        )}
      />
    </View>

  )}

</View>

        {/* FABRIC SECTION */}
        <View style={styles.fabricSection}>
           <View style={[styles.fabricContent, isWeb ? {flexDirection: 'row'} : {flexDirection: 'column'}]}>
             <View style={styles.fabricTextBox}>
                 <Text style={styles.fabricTitle}>Engineered for Comfort.</Text>
                 <Text style={styles.fabricDesc}>Our fabrics are sourced from the finest organic cotton fields and treated with our proprietary "Soft-Touch" technology.</Text>
             </View>
             <View style={[styles.fabricCardsGrid, isWeb ? {width: '50%'} : {width: '100%', marginTop: 20}]}>
                 <View style={styles.fabricCard}><Text style={{fontSize: 30}}>🌿</Text><Text style={styles.fCardTitle}>Eco</Text></View>
                 <View style={styles.fabricCard}><Text style={{fontSize: 30}}>🧵</Text><Text style={styles.fCardTitle}>Stitch</Text></View>
                 <View style={styles.fabricCard}><Text style={{fontSize: 30}}>✨</Text><Text style={styles.fCardTitle}>Fade</Text></View>
                 <View style={styles.fabricCard}><Text style={{fontSize: 30}}>🛡️</Text><Text style={styles.fCardTitle}>Tough</Text></View>
             </View>
           </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
           <View style={[styles.footerContent, isWeb ? {flexDirection: 'row', justifyContent: 'space-between'} : {flexDirection: 'column', alignItems: 'center', gap: 30}]}>
             <View style={{marginBottom: 20, maxWidth: 300, alignItems: isWeb ? 'flex-start' : 'center'}}>
                 <Text style={styles.footerBrand}>MY CLOTH</Text>
                 <Text style={[styles.footerDesc, !isWeb && {textAlign: 'center'}]}>Redefining streetwear with luxury and cosmic aesthetics.</Text>
             </View>
             <View style={{alignItems: isWeb ? 'flex-start' : 'center'}}>
                 <Text style={styles.footerHeader}>EXPLORE</Text>
                <Text style={styles.footerLink}onPress={() => scrollToTrending()}>New Arrivals</Text>
               <Text style={styles.footerLink}onPress={() => router.push('/shop')}>Collection</Text>

                 <Text style={styles.footerLink}onPress={() => router.push('/aboutus')}>About Us</Text>
             </View>
            {/* NEWSLETTER - minimal email + description; mobile-first */}
<View style={{ alignItems: isWeb ? 'flex-start' : 'center', width: isWeb ? 300 : '100%' }}>
  <Text style={styles.footerHeader}>NEWSLETTER</Text>

  {/* Email */}
  <TextInput
    value={newsletterEmail}
    onChangeText={setNewsletterEmail}
    placeholder="Your email"
    placeholderTextColor="#777"
    keyboardType="email-address"
    autoCapitalize="none"
    style={[styles.newsletterInput, isWeb ? {} : { width: '100%' }]}
  />

  {/* Message */}
  <TextInput
    value={newsletterMsg}
    onChangeText={setNewsletterMsg}
    placeholder="Short message / description"
    placeholderTextColor="#777"
    multiline
    numberOfLines={3}
    style={styles.newsletterTextarea}
  />

  {/* Submit row */}
  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
    <TouchableOpacity
      onPress={handleSubscribe}
      disabled={newsletterLoading}
      style={[styles.newsletterBtn, newsletterLoading && { opacity: 0.7 }]}
    >
      <Text style={{ color: '#000', fontWeight: '800' }}>{newsletterLoading ? 'Sending...' : 'SUBMIT'}</Text>
    </TouchableOpacity>

    <View style={{ marginLeft: 10 }}>
      {newsletterSuccess ? <Text style={styles.newsletterSuccess}>{newsletterSuccess}</Text> : null}
      {newsletterError ? <Text style={styles.newsletterError}>{newsletterError}</Text> : null}
    </View>
  </View>
</View>

           </View>
           <View style={styles.footerBottom}>
               <Text style={{color: '#666', fontSize: 12}}>© 2025 My Cloth Inc.</Text>
           </View>
        </View>

      </ScrollView>
      </SafeAreaView>

      {/* CART MODAL */}
      <Modal animationType="slide" transparent={true} visible={isCartVisible} onRequestClose={() => setIsCartVisible(false)}>
        <View style={styles.modalOverlay}>
            <View style={[styles.cartModal, !isWeb && {width: '95%', height: '85%'}]}>
                <View style={styles.cartHeader}>
                    <Text style={styles.cartTitle}>YOUR CART</Text>
                    <TouchableOpacity onPress={() => setIsCartVisible(false)}>
                      <Text style={{color: '#fff', fontSize: 18, fontWeight: 'bold'}}>CLOSE</Text>
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={cartItems}
                    keyExtractor={item => item.id}
                    ListEmptyComponent={<Text style={{color:'#888', textAlign:'center', marginTop: 50}}>Your cart is empty.</Text>}
                    renderItem={({item}) => (
                        <View style={styles.cartItem}>
                            <Image source={{uri: item.image}} style={{width: 50, height: 50, borderRadius: 5}} />
                            <View style={{flex: 1, marginLeft: 10}}>
                                <Text style={{color: '#fff', fontWeight: 'bold'}}>{item.name}</Text>
                                <Text style={{color: '#aaa'}}>₹{item.price}</Text>
                            </View>
                            <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                                <Text style={{color: COLORS.delete, fontWeight: 'bold'}}>X</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
                {cartItems.length > 0 && (
                  <View style={styles.cartFooter}>
                      <Text style={{color: '#fff', fontSize: 18, marginBottom: 10}}>Total: <Text style={{color: COLORS.accent}}>₹{getTotalPrice()}</Text></Text>
                      <TouchableOpacity style={styles.checkoutBtn} onPress={() => { setIsCartVisible(false); router.push('/checkout'); }}>
                        <Text style={{fontWeight: 'bold', color: '#000'}}>CHECKOUT</Text>
                      </TouchableOpacity>
                  </View>
                )}
            </View>
        </View>
      </Modal>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fullScreenGradient: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.gradientStart },
  
  // Navbar Styles Updated
  navbar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',           // <-- Ensures left & right are fixed with center absolute
    paddingHorizontal: 30, 
    paddingVertical: 20, 
    backgroundColor: 'rgba(15, 12, 41, 0.8)', 
    borderBottomWidth: 1, 
    borderColor: COLORS.glassBorder, 
    zIndex: 100 
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 20,
    flexShrink: 0,       // <-- Prevent shrinking so center absolute doesn't push it
  },
  logoText: { fontSize: 24, letterSpacing: 2, color: COLORS.textMain, fontWeight: '900' },
  hamburgerBtn: { padding: 5, zIndex: 10 },

  // Center nav: absolute centered only on web
  navCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: Platform.OS === 'web' ? 22 : 18, // tweak as needed
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
    zIndex: 15,
  },
  navLinks: { 
    flexDirection: 'row', 
    gap: 30, 
    marginRight: 20, 
    pointerEvents: 'auto' 
  },
  navLink: { fontSize: 14, color: COLORS.textLight, fontWeight: '600' },

  // Right section remains compact and fixed right
  navRightSection: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    zIndex: 20, 
    flexShrink: 0,            // <-- Prevent shrinking
    minWidth: 100,           // <-- keeps icons compact and aligned right
    justifyContent: 'flex-end'
  },
  cartBadge: { position: 'absolute', top: -5, right: -8, backgroundColor: COLORS.accent, width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  cartBadgeText: { color: '#000', fontSize: 10, fontWeight: 'bold' },

  // Mobile Menu Overlay
  mobileMenu: {
    position: 'absolute', top: 85, left: 0, right: 0, backgroundColor: '#16162c', 
    padding: 20, zIndex: 99, borderBottomWidth: 1, borderColor: '#333', shadowColor: "#000", shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.5, elevation: 5
  },
  menuItem: { paddingVertical: 15, borderBottomWidth: 1, borderColor: '#ffffff22' },
  menuText: { color: 'white', fontSize: 18, fontWeight: '500' },

  // Hero
  heroSection: { paddingVertical: 20, alignItems: 'center' },
  heroContent: { width: '100%', maxWidth: 1200, paddingHorizontal: 20 },
  heroContentWeb: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 40 },
  heroContentMobile: { flexDirection: 'column', alignItems: 'center', gap: 50 },
  heroTextSide: { flex: 1, alignItems: 'flex-start', maxWidth: 600 },
  brandTagContainer: { backgroundColor: 'rgba(0, 210, 255, 0.1)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(0, 210, 255, 0.3)' },
  heroBrand: { color: COLORS.accent, letterSpacing: 2, fontSize: 12, fontWeight: 'bold' },
  heroTitle: { fontSize: 56, color: COLORS.textMain, marginBottom: 20, lineHeight: 64, fontWeight: '800' },
  heroSubtitle: { color: COLORS.textLight, fontSize: 16, marginBottom: 30, lineHeight: 26 },
  heroButtons: { flexDirection: 'row', gap: 15 },
  btnPrimary: { backgroundColor: COLORS.accent, paddingVertical: 16, paddingHorizontal: 35, borderRadius: 30, shadowColor: COLORS.accent, shadowOpacity: 0.6, shadowRadius: 15 },
  btnTextPrimary: { color: '#000', fontWeight: 'bold', letterSpacing: 1, fontSize: 14 },
  
  heroModelSide: { width: 350, height: 400, alignItems: 'center', justifyContent: 'center' },
  shirtContainer: { width: 350, height: 350, alignItems: 'center', justifyContent: 'center' },
  heroImage3D: { width: 320, height: 380, zIndex: 2 },
  glowCircle: { position: 'absolute', width: 280, height: 280, borderRadius: 140, backgroundColor: COLORS.accent, opacity: 0.2, zIndex: 1, filter: 'blur(60px)' },

  // Product Grid
  sectionContainer: { paddingVertical: 60, alignItems: 'center', width: '100%' },
  sectionHeader: { alignItems: 'center', marginBottom: 40 },
  sectionTag: { color: COLORS.accent, fontSize: 12, letterSpacing: 2, fontWeight: 'bold', marginBottom: 8 },
  sectionTitle: { fontSize: 36, color: COLORS.textMain, fontWeight: '700' },
  grid: { width: '100%', maxWidth: 1200, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  gridWeb: { justifyContent: 'space-between', gap: 30 },
  
  cardContainer: { marginBottom: 20 },
  card: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.glassBorder },
  cardGradient: { padding: 0, borderRadius: 20 },
  imageWrapper: { height: 250, backgroundColor: 'rgba(0,0,0,0.2)', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  cardImage: { width: '85%', height: '85%' },
  badge: { position: 'absolute', top: 15, right: 15, backgroundColor: COLORS.accentSecondary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  cardContent: { padding: 15 },
  productName: { fontSize: 16, color: COLORS.textMain, marginBottom: 5, fontWeight: '600' },
  productDesc: { fontSize: 12, color: COLORS.textLight, marginBottom: 15 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  miniBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: COLORS.accent, borderRadius: 4 },
  
  // Fabric Styles
  fabricSection: { width: '100%', paddingVertical: 60, backgroundColor: 'rgba(0,0,0,0.2)' },
  fabricContent: { maxWidth: 1200, alignSelf: 'center', width: '90%' },
  fabricTextBox: { flex: 1, marginBottom: 30 },
  fabricTitle: { fontSize: 32, color: '#fff', fontWeight: 'bold', marginBottom: 15 },
  fabricDesc: { color: COLORS.textLight, fontSize: 16, lineHeight: 24, marginBottom: 20 },
  fabricCardsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, justifyContent: 'center' },
  fabricCard: { width: '45%', backgroundColor: COLORS.glassCard, padding: 20, borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: COLORS.glassBorder },
  fCardTitle: { color: '#fff', marginTop: 10, fontWeight: 'bold', fontSize: 14 },

  // Footer Styles
  footer: { backgroundColor: 'rgba(0,0,0,0.5)', padding: 20, width: '100%', borderTopWidth: 1, borderColor: COLORS.glassBorder, marginTop: 20 },
  footerContent: { maxWidth: 1200, alignSelf: 'center', width: '100%' },
  footerBrand: { fontSize: 22, color: '#fff', fontWeight: 'bold', marginBottom: 5 },
  footerDesc: { color: COLORS.textLight, fontSize: 12, marginBottom: 20 },
  footerHeader: { color: '#fff', fontSize: 12, letterSpacing: 1, fontWeight: 'bold', marginBottom: 15 },
  footerLink: { color: COLORS.textLight, fontSize: 14, marginBottom: 8 },
  newsletterInput: {
  backgroundColor: 'rgba(255,255,255,0.05)',
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: Platform.OS === 'web' ? 10 : 8,
  width: '100%',
  color: '#fff',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.06)',
  marginTop: 8,
},

newsletterTextarea: {
  backgroundColor: 'rgba(255,255,255,0.04)',
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 10,
  width: '100%',
  color: '#fff',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.06)',
  marginTop: 10,
  textAlignVertical: 'top',
  minHeight: 80,
},

newsletterBtn: {
  backgroundColor: COLORS.accent,
  paddingHorizontal: 14,
  paddingVertical: 10,
  borderRadius: 8,
  alignItems: 'center',
  justifyContent: 'center',
},
newsletterSuccess: { color: '#8ef58e', fontSize: 13, fontWeight: '600' },
newsletterError: { color: '#ff8a8a', fontSize: 13, fontWeight: '600' },

  footerBottom: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', marginTop: 30, paddingTop: 20, alignItems: 'center' },

  // Cart Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  cartModal: { backgroundColor: '#1a1a1a', borderRadius: 20, padding: 20, width: '90%', maxWidth: 500, maxHeight: '80%', borderWidth: 1, borderColor: COLORS.accent },
  cartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cartTitle: { fontSize: 24, color: '#fff', fontWeight: 'bold' },
  cartItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, backgroundColor: 'rgba(255,255,255,0.05)', padding: 10, borderRadius: 10 },
  cartFooter: { borderTopWidth: 1, borderTopColor: '#333', paddingTop: 20 },
  checkoutBtn: { backgroundColor: COLORS.accent, padding: 15, borderRadius: 10, alignItems: 'center' },
});
// index.tsx ke aakhri mein, "export default function HomeScreen() {..." ke baad

export { ProductCard };
