// app/(tabs)/login.tsx (Image Added in Purple Panel)

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity,
  StyleSheet,
  Alert, 
  Image, 
  useWindowDimensions,
  ScrollView,
  Platform 
} from 'react-native';

import { auth } from '../../firebaseConfig'; 
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = width > 768; 

  const handleLogin = async () => {
    if (email === '' || password === '') {
      showAlert("Error", "Email aur Password khaali nahi ho sakte");
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      showAlert("Success", `Welcome back: ${userCredential.user.email}`);
      router.push('/(tabs)/'); 
    } catch (error: any) {
      showAlert("Login Error", error.message);
    }
  };

  const handleForgotPassword = async () => {
    if (email === '') {
      showAlert("Ruko!", "Pehle upar waale box mein apna Email likho, fir click karo.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      showAlert("Email Sent ✅", "Apna inbox check karo. Password reset ka link bhej diya hai.");
    } catch (error: any) {
      showAlert("Error", error.message);
    }
  };

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleSignUp = () => {
    router.push('/(tabs)/profile'); 
  };

  // --- Image Panel (Left/Top) ---
  const renderImagePanel = () => (
    <View style={[styles.imageContainer, !isWeb && styles.imageContainerMobile]}> 
      <Text style={styles.astroText}>My Cloth</Text>
      
      {/* (NAYA) Background Image Yahan Add Kiya Gaya Hai */}
      <Image
        source={{ uri: 'https://i.ibb.co/Z1zm8V3r/astro.png' }} // Yahan aapki background image ka URL aayega
        style={styles.backgroundImage} 
      />

      <Text style={[styles.imageTitle, !isWeb && styles.imageTitleMobile]}>Exploring new frontiers, one step at a Time.</Text>
      <Text style={[styles.imageSubtitle, !isWeb && styles.imageSubtitleMobile]}>Beyond Earth's grasp</Text>
    </View>
  );

  // --- Form Panel ---
  const renderFormPanel = () => (
    <View style={[styles.formContainer, !isWeb && styles.formContainerMobile]}>
      
      <View style={[styles.topRightLogin, !isWeb && styles.topRightLoginMobile]}>
        <Text style={styles.topRightText}>New here? </Text>
        <TouchableOpacity onPress={handleSignUp}>
          <Text style={styles.topRightLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.title, !isWeb && styles.titleMobile]}>Welcome Back</Text>
      
      <View style={styles.socialButtonContainer}>
        <TouchableOpacity style={styles.socialButton}>
          <Text style={styles.socialButtonText}>Log in with Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <Text style={styles.socialButtonText}>with Facebook</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.orText, !isWeb && styles.orTextMobile]}>Or log in using your email address</Text>

      <Text style={styles.label}>Email or Phone no.</Text>
      <TextInput 
        style={[styles.input, !isWeb && styles.inputMobile]} 
        value={email} 
        onChangeText={setEmail} 
        placeholder="Your email or phone" 
        keyboardType="email-address" 
        autoCapitalize="none" 
      />

      <Text style={styles.label}>Password</Text>
      <TextInput 
        style={[styles.input, !isWeb && styles.inputMobile]} 
        value={password} 
        onChangeText={setPassword} 
        placeholder="Your password" 
        secureTextEntry 
      />

      <TouchableOpacity 
        style={{ alignSelf: 'flex-end', marginBottom: 20 }} 
        onPress={handleForgotPassword}
      >
        <Text style={{ color: '#6200ea', fontSize: 13, fontWeight: '600' }}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.signupButton, !isWeb && styles.signupButtonMobile]} onPress={handleLogin}>
        <Text style={styles.signupButtonText}>Log In</Text>
      </TouchableOpacity>
      
      <Text style={[styles.loginText, !isWeb && styles.loginTextMobile]}>
        Don't have an account? <Text style={styles.loginLink} onPress={handleSignUp}>Sign up</Text>
      </Text>
    </View>
  );

  // --- Main Render ---
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} style={{ flex: 1 }}>
        <View style={[styles.mainCard, { flexDirection: isWeb ? 'row' : 'column' }]}>
          
          <View style={isWeb ? styles.imagePanelWeb : styles.imagePanelMobile}>
            {renderImagePanel()}
          </View>

          {isWeb ? (
            <ScrollView style={styles.formPanelWeb}> 
              {renderFormPanel()}
            </ScrollView>
          ) : (
            <View style={styles.formPanelMobile}> 
              {renderFormPanel()}
            </View>
          )}

        </View>
      </ScrollView>
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  mainCard: { backgroundColor: '#ffffff', borderRadius: 20, overflow: 'hidden', width: '100%', maxWidth: 1000, shadowColor: "#000", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 8, maxHeight: Platform.OS === 'web' ? '90vh' : undefined },
  imagePanelWeb: { flex: 1 },
  imagePanelMobile: { borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  imageContainer: {
    backgroundColor: '#1a0033', 
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
    // (FIXED) Background image ke liye position relative zaroori hai
    position: 'relative', 
    overflow: 'hidden', // Image bounds ke bahar na jaaye
    ...Platform.select({ web: { height: '100%' } }),
  },
  // (NAYA) Background Image Style
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // Image poore container par cover ho
    opacity: 0.5, // Thoda transparent takki text dikhe
  },
  astroText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    position: 'absolute',
    top: 30,
    left: 30,
    zIndex: 1, // Text image ke upar dikhe
  },
  image: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
    marginVertical: 20,
    zIndex: 1, // Text image ke upar dikhe
  },
  // 2. WEB PAR TEXT POSITION YAHAN HAI 👇
  imageTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    zIndex: 1, 
    marginTop: 120, // <--- (CHANGE THIS: Text ko niche karne ke liye badhao, e.g., 50)
  },
  imageSubtitle: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    paddingBottom: 20,
    zIndex: 1, 
  },
  formPanelWeb: { flex: 1.5 },
  formPanelMobile: { borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  formContainer: {
    backgroundColor: '#ffffff',
    padding: 40,
    justifyContent: 'center',
  },
  topRightLogin: {
    position: 'absolute',
    top: 30,
    right: 30,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  topRightText: { color: '#888', fontSize: 14 },
  topRightLink: { color: '#6200ea', fontWeight: 'bold', fontSize: 14 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1E0E40',
    textAlign: 'center',
  },
  socialButtonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  socialButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8, marginHorizontal: 5, borderWidth: 1, borderColor: '#eee', backgroundColor: '#fff' },
  socialButtonText: { fontWeight: 'bold', color: '#333', marginLeft: 8, fontSize: 14 },
  orText: { textAlign: 'center', marginVertical: 15, color: '#aaa', fontSize: 12 },
  label: { color: '#555', marginBottom: 5, fontSize: 14 },
  input: { width: '100%', height: 45, backgroundColor: '#f4f4f8', borderRadius: 8, paddingHorizontal: 15, marginBottom: 15, fontSize: 16, borderWidth: 0, ...Platform.select({ web: { outlineStyle: 'none' } }) },
  signupButton: { width: '100%', height: 50, borderRadius: 8, backgroundColor: '#1E0E40', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  signupButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  loginText: { textAlign: 'center', marginTop: 20, color: '#888', fontSize: 13 },
  loginLink: { color: '#1E0E40', fontWeight: 'bold' },
  
  // =============================================
  // 3. MOBILE (PHONE) SETTINGS YAHAN HAIN 👇
  // =============================================
  imageContainerMobile: { 
    padding: 20 
  },
  imageMobile: { 
    width: 150, 
    height: 150, 
    marginVertical: 10 
  },
  
  // Phone par Text Size aur Position
  imageTitleMobile: { 
    fontSize: 15, // <--- (CHANGE THIS: Text size chhota/bada)
    marginTop: 50, // <--- (CHANGE THIS: Text ko niche karne ke liye value badhao, e.g., 40)
  },
  imageSubtitleMobile: { 
    fontSize: 12, 
    paddingBottom: 20,
  },
  
  formContainerMobile: { padding: 25 },
  topRightLoginMobile: { top: 20, right: 20 },
  titleMobile: { fontSize: 24, marginBottom: 15, marginTop: 40 },
  orTextMobile: { marginVertical: 10 },
  inputMobile: { height: 40, marginBottom: 10 },
  signupButtonMobile: { height: 45 },
  loginTextMobile: { marginTop: 15 }
});