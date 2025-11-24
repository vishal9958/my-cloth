// app/(tabs)/profile.tsx (Sign Up -> Redirect to Login)

import React, { useState, useEffect } from 'react';
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
  Platform,
  ActivityIndicator 
} from 'react-native';
import Checkbox from 'expo-checkbox'; 

import { auth } from '../../firebaseConfig'; 
import { createUserWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [agree, setAgree] = useState(false);

  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = width > 768; 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert("Logged Out", "Bye Bye! Phir milenge.");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  // --- YAHAN CHANGE KIYA HAI ---
  const handleSignUp = async () => {
    if (!agree) return Alert.alert("Error", "Please agree to the Terms and Privacy Policy.");
    if (email === '' || password === '') return Alert.alert("Error", "Email aur Password khaali nahi ho sakte");
    
    try {
      // 1. Account Banao
      await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Turant Logout Karo (Taaki auto-login na ho)
      await signOut(auth);

      // 3. Success Message dikhao
      if (Platform.OS === 'web') {
        window.alert("Account Created Successfully! Please Log In.");
      } else {
        Alert.alert("Account Created", "Account ban gaya hai. Ab please Login karein.");
      }

      // 4. Login Page par bhej do
      router.push('/(tabs)/login');

    } catch (error: any) {
      Alert.alert("Sign Up Error", error.message);
    }
  };

  const handleLoginNavigation = () => {
    router.push('/(tabs)/login'); 
  };

  const renderImagePanel = () => (
    <View style={[styles.imageContainer, !isWeb && styles.imageContainerMobile]}> 
      <Text style={styles.astroText}>My Cloth</Text>
      <Image
        source={{ uri: 'https://i.ibb.co/Z1zm8V3r/astro.png' }}
        style={styles.backgroundImage} 
      />
      <Text style={[styles.imageTitle, !isWeb && styles.imageTitleMobile]}>
        {user ? "Welcome Back!" : "Exploring new frontiers, one step at a Time."}
      </Text>
      <Text style={[styles.imageSubtitle, !isWeb && styles.imageSubtitleMobile]}>
        {user ? "Ready for your next mission?" : "Beyond Earth's grasp"}
      </Text>
    </View>
  );

  const renderLoggedInPanel = () => (
    <View style={[styles.formContainer, !isWeb && styles.formContainerMobile, {justifyContent: 'center', alignItems: 'center'}]}>
      <Text style={[styles.title, {fontSize: 30}]}>Hello, Buddy! 🚀</Text>
      <Text style={{color: '#666', marginBottom: 20, fontSize: 16}}>You are currently logged in as:</Text>
      <View style={{backgroundColor: '#f0f0f5', padding: 15, borderRadius: 10, width: '100%', marginBottom: 30}}>
        <Text style={{textAlign: 'center', fontWeight: 'bold', fontSize: 18, color: '#1E0E40'}}>
          {user?.email}
        </Text>
      </View>
      <TouchableOpacity style={[styles.signupButton, {backgroundColor: '#ff4757'}]} onPress={handleLogout}>
        <Text style={styles.signupButtonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSignupForm = () => (
    <View style={[styles.formContainer, !isWeb && styles.formContainerMobile]}>
      <View style={[styles.topRightLogin, !isWeb && styles.topRightLoginMobile]}>
        <Text style={styles.topRightText}>Already a member? </Text>
        <TouchableOpacity onPress={handleLoginNavigation}>
          <Text style={styles.topRightLink}>Sign In</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.title, !isWeb && styles.titleMobile]}>Create Account</Text>
      
      <View style={styles.socialButtonContainer}>
        <TouchableOpacity style={styles.socialButton}>
          <Text style={styles.socialButtonText}>Sign up with Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <Text style={styles.socialButtonText}>with Facebook</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.orText, !isWeb && styles.orTextMobile]}>Or sign up using your email address</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput style={[styles.input, !isWeb && styles.inputMobile]} value={name} onChangeText={setName} placeholder="Your name" />
      
      <Text style={styles.label}>Email or Phone no.</Text>
      <TextInput style={[styles.input, !isWeb && styles.inputMobile]} value={email} onChangeText={setEmail} placeholder="Your email or phone" keyboardType="email-address" autoCapitalize="none" />

      <Text style={styles.label}>Username</Text>
      <TextInput style={[styles.input, !isWeb && styles.inputMobile]} value={username} onChangeText={setUsername} placeholder="Your username" autoCapitalize="none" />
      
      <Text style={styles.label}>Password</Text>
      <TextInput style={[styles.input, !isWeb && styles.inputMobile]} value={password} onChangeText={setPassword} placeholder="Your password" secureTextEntry />

      <View style={styles.checkboxContainer}>
        <Checkbox style={styles.checkbox} value={agree} onValueChange={setAgree} color={agree ? '#6200ea' : undefined} />
        <Text style={styles.checkboxText}>I agree to all terms and Privacy Policy</Text>
      </View>

      <TouchableOpacity style={[styles.signupButton, !isWeb && styles.signupButtonMobile]} onPress={handleSignUp}>
        <Text style={styles.signupButtonText}>Sign up</Text>
      </TouchableOpacity>
      
      <Text style={[styles.loginText, !isWeb && styles.loginTextMobile]}>
        Already have an account? <Text style={styles.loginLink} onPress={handleLoginNavigation}>Log in</Text>
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
        <ActivityIndicator size="large" color="#1E0E40" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} style={{ flex: 1 }}>
        <View style={[styles.mainCard, { flexDirection: isWeb ? 'row' : 'column' }]}>
          <View style={isWeb ? styles.imagePanelWeb : styles.imagePanelMobile}>
            {renderImagePanel()}
          </View>
          {isWeb ? (
            <ScrollView style={styles.formPanelWeb}> 
              {user ? renderLoggedInPanel() : renderSignupForm()}
            </ScrollView>
          ) : (
            <View style={styles.formPanelMobile}> 
              {user ? renderLoggedInPanel() : renderSignupForm()}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  mainCard: { backgroundColor: '#ffffff', borderRadius: 20, overflow: 'hidden', width: '100%', maxWidth: 1000, shadowColor: "#000", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 8, maxHeight: Platform.OS === 'web' ? '90vh' : undefined },
  imagePanelWeb: { flex: 1 },
  imagePanelMobile: { borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  imageContainer: { backgroundColor: '#1a0033', padding: 30, justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden', ...Platform.select({ web: { height: '100%' } }) },
  backgroundImage: { position: 'absolute', width: '100%', height: '100%', resizeMode: 'cover', opacity: 0.5 },
  astroText: { color: '#fff', fontSize: 18, fontWeight: 'bold', position: 'absolute', top: 30, left: 30, zIndex: 1 },
  imageTitle: { fontSize: 20, color: '#fff', fontWeight: 'bold', textAlign: 'center', zIndex: 1, marginTop: 120 },
  imageSubtitle: { color: '#aaa', fontSize: 14, marginTop: 10, textAlign: 'center', paddingBottom: 20, zIndex: 1 },
  formPanelWeb: { flex: 1.5 },
  formPanelMobile: { borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  formContainer: { backgroundColor: '#ffffff', padding: 40, justifyContent: 'center' },
  topRightLogin: { position: 'absolute', top: 30, right: 30, flexDirection: 'row', alignItems: 'center', zIndex: 1 },
  topRightText: { color: '#888', fontSize: 14 },
  topRightLink: { color: '#6200ea', fontWeight: 'bold', fontSize: 14 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#1E0E40', textAlign: 'center' },
  socialButtonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  socialButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8, marginHorizontal: 5, borderWidth: 1, borderColor: '#eee', backgroundColor: '#fff' },
  socialButtonText: { fontWeight: 'bold', color: '#333', marginLeft: 8, fontSize: 14 },
  orText: { textAlign: 'center', marginVertical: 15, color: '#aaa', fontSize: 12 },
  label: { color: '#555', marginBottom: 5, fontSize: 14 },
  input: { width: '100%', height: 45, backgroundColor: '#f4f4f8', borderRadius: 8, paddingHorizontal: 15, marginBottom: 15, fontSize: 16, borderWidth: 0, ...Platform.select({ web: { outlineStyle: 'none' } }) },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  checkbox: { marginRight: 10, borderRadius: 4 },
  checkboxText: { color: '#555', fontSize: 13 },
  signupButton: { width: '100%', height: 50, borderRadius: 8, backgroundColor: '#1E0E40', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  signupButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  loginText: { textAlign: 'center', marginTop: 20, color: '#888', fontSize: 13 },
  loginLink: { color: '#1E0E40', fontWeight: 'bold' },
  imageContainerMobile: { padding: 20 },
  imageMobile: { width: 150, height: 150, marginVertical: 10 },
  imageTitleMobile: { fontSize: 15, marginTop: 50 },
  imageSubtitleMobile: { fontSize: 12, paddingBottom: 20 },
  formContainerMobile: { padding: 25 },
  topRightLoginMobile: { top: 20, right: 20 },
  titleMobile: { fontSize: 24, marginBottom: 15, marginTop: 40 },
  orTextMobile: { marginVertical: 10 },
  inputMobile: { height: 40, marginBottom: 10 },
  signupButtonMobile: { height: 45 },
  loginTextMobile: { marginTop: 15 }
});