// app/aboutus.tsx (FINAL COMPLETE CODE with Back Button and Responsive Layout)
import React from 'react';
import { 
    View, Text, StyleSheet, ScrollView, Platform, SafeAreaView, Dimensions, 
    TouchableOpacity, // Back Button ke liye
    StatusBar // Status bar control ke liye
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router'; // Back Button navigation ke liye

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

// THEME COLORS (Tumhare project se liye gaye hain)
const COLORS = {
  gradientStart: '#0f0c29', 
  gradientMid: '#302b63',
  gradientEnd: '#24243e',
  textMain: '#ffffff',
  textLight: '#b0b0b0',
  accent: '#00d2ff', // Cyan Glow
  glassCard: 'rgba(255, 255, 255, 0.05)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  gold: '#FFD700',
};

// --- CORE VALUE COMPONENT ---
const ValueCard = ({ icon, title, description, isWeb }) => (
    <View style={[styles.valueCard, isWeb && styles.valueCardWeb]}>
        <Text style={styles.valueIcon}>{icon}</Text>
        <Text style={styles.valueTitle}>{title}</Text>
        <Text style={styles.valueDesc}>{description}</Text>
    </View>
);

export default function AboutUsScreen() {
    const router = useRouter(); // Router initialized
    
    return (
        <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientMid, COLORS.gradientEnd]} style={styles.fullScreenGradient}>
            <StatusBar barStyle="light-content" />
            <SafeAreaView style={{ flex: 1 }}>
                
                {/* --- NEW: BACK BUTTON --- */}
                <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}>
                    <Text style={styles.backButtonText}>{'<'}</Text>
                </TouchableOpacity>

                <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    
                    {/* 1. MISSION HERO SECTION */}
                    <View style={styles.heroSection}>
                        <Text style={styles.tagline}>OUR MISSION</Text>
                        <Text style={styles.mainTitle}>
                            WEAR THE <Text style={styles.accentText}>FUTURE.</Text>
                        </Text>
                        <Text style={styles.missionText}>
                            We fuse celestial aesthetics with cutting-edge fabric technology to redefine streetwear. Every piece is designed for durability, comfort, and a touch of the extraordinary.
                        </Text>
                    </View>

                    {/* 2. BRAND STORY SECTION */}
                    <View style={styles.storySection}>
                        <Text style={styles.sectionHeader}>The Cosmic Journey</Text>
                        <Text style={styles.storyText}>
                            Founded in 2025 with the belief that fashion should feel as boundless as space itself, MY CLOTH began as a small vision to bring luxury design to everyday comfort. Our focus remains on ethical sourcing and innovation, ensuring that you're not just wearing a garment, but a piece of the cosmos.
                        </Text>
                    </View>

                    {/* 3. CORE VALUES SECTION */}
                    <View style={styles.valuesSection}>
                        <Text style={styles.sectionHeader}>Our Core Orbit</Text>
                        <View style={styles.valuesGrid}>
                            <ValueCard 
                                icon="✨" title="Innovation" 
                                description="Pushing the boundaries of texture and wearability with Soft-Touch Technology." 
                                isWeb={isWeb}
                            />
                            <ValueCard 
                                icon="🌍" title="Ethical Sourcing" 
                                description="Committed to 100% organic cotton and sustainable, transparent supply chains." 
                                isWeb={isWeb}
                            />
                            <ValueCard 
                                icon="👑" title="Luxury Design" 
                                description="Focus on timeless, elegant silhouettes that ensure supreme quality and fit." 
                                isWeb={isWeb}
                            />
                        </View>
                    </View>

                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    fullScreenGradient: { flex: 1 },
    // --- NEW BACK BUTTON STYLES ---
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'android' ? 40 : 15, // Android adjust kiya
        left: 20,
        zIndex: 10, 
        padding: 10,
        borderRadius: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    backButtonText: {
        color: COLORS.textMain,
        fontSize: 24,
        fontWeight: 'bold',
    },
    // --- SCROLL & LAYOUT ---
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 80,
        alignItems: 'center',
    },
    
    // --- 1. HERO/MISSION STYLES ---
    heroSection: {
        width: '100%',
        maxWidth: 1000,
        paddingHorizontal: 25,
        paddingVertical: 60,
        alignItems: 'flex-start',
        marginTop: 30, // Button ke liye jagah
    },
    tagline: {
        color: COLORS.accent,
        fontSize: 14,
        letterSpacing: 3,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    mainTitle: {
        fontSize: isWeb ? 64 : 48,
        fontWeight: '900',
        color: COLORS.textMain,
        lineHeight: isWeb ? 70 : 55,
        marginBottom: 20,
    },
    accentText: {
        color: COLORS.accent,
    },
    missionText: {
        fontSize: isWeb ? 18 : 16,
        color: COLORS.textLight,
        lineHeight: isWeb ? 30 : 26,
        maxWidth: 700,
    },

    // --- 2. STORY SECTION ---
    storySection: {
        width: '100%',
        maxWidth: 1000,
        paddingHorizontal: 25,
        paddingVertical: 30,
        borderTopWidth: 1,
        borderColor: COLORS.glassBorder,
        marginTop: 20,
    },
    sectionHeader: {
        fontSize: 28,
        color: COLORS.textMain,
        fontWeight: '700',
        marginBottom: 20,
        textAlign: isWeb ? 'left' : 'center',
    },
    storyText: {
        fontSize: 16,
        color: COLORS.textLight,
        lineHeight: 25,
        textAlign: 'justify',
    },

    // --- 3. CORE VALUES ---
    valuesSection: {
        width: '100%',
        maxWidth: 1000,
        paddingHorizontal: 25,
        paddingVertical: 50,
    },
    valuesGrid: {
        flexDirection: isWeb ? 'row' : 'column',
        gap: 20,
        marginTop: 20,
        justifyContent: 'space-between',
    },
    valueCard: {
        padding: 25,
        borderRadius: 15,
        backgroundColor: COLORS.glassCard,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        flex: 1, 
        alignItems: 'flex-start',
    },
    valueCardWeb: {
        width: '32%', 
    },
    valueIcon: {
        fontSize: 32,
        marginBottom: 10,
    },
    valueTitle: {
        fontSize: 20,
        color: COLORS.textMain,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    valueDesc: {
        fontSize: 14,
        color: COLORS.textLight,
        lineHeight: 22,
    }
});