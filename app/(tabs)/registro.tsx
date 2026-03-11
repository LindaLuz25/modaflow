import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getDatabase, push, ref } from "firebase/database";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { app, auth } from "../../firebaseConfig";

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [dni, setDni] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState(""); // Nuevo estado para la URL de la foto
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const register = async () => {
    if (!fullName || !dni || !address || !phone || !email || !password || !confirmPassword) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    try {
      // 1️⃣ Crear usuario en Firebase Auth
      await createUserWithEmailAndPassword(auth, email, password);

      // 2️⃣ Crear nuevo cliente en BD
      const db = getDatabase(app);
      const clientsRef = ref(db, "clients");

      await push(clientsRef, {
        fullName,
        dni,
        address,
        email,
        phone,
        profile, // Guardamos la URL de la foto
        createdAt: new Date().toISOString()
      });

      Alert.alert("Success", "Account created successfully 🎉");
      router.replace("/home");

    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        Alert.alert("Error", "This email is already registered.");
      } else {
        Alert.alert("Error", error.message);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← BACK</Text>
          </TouchableOpacity>

          <View style={styles.headerSection}>
            <Text style={styles.brandLogo}>MODAFLOW</Text>
            <Text style={styles.welcomeText}>CREATE YOUR PROFILE</Text>
          </View>

          <View style={styles.formSection}>
            
            {/* CAMPO FOTO DE PERFIL CON PREVIEW */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PROFILE PICTURE URL</Text>
              <View style={styles.profileInputContainer}>
                <View style={styles.avatarWrapper}>
                  {profile ? (
                    <Image source={{ uri: profile }} style={styles.avatarImage} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.placeholderText}>?</Text>
                    </View>
                  )}
                </View>
                <TextInput
                  placeholder="https://image-url.com/photo.jpg"
                  placeholderTextColor="#BBB"
                  value={profile}
                  onChangeText={setProfile}
                  style={[styles.input, { flex: 1, marginLeft: 15 }]}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>FULL NAME</Text>
              <TextInput
                placeholder="Rossana Perez"
                placeholderTextColor="#BBB"
                value={fullName}
                onChangeText={setFullName}
                style={styles.input}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>DNI</Text>
                <TextInput
                  placeholder="87654321"
                  placeholderTextColor="#BBB"
                  value={dni}
                  onChangeText={setDni}
                  style={styles.input}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>PHONE</Text>
                <TextInput
                  placeholder="987654321"
                  placeholderTextColor="#BBB"
                  value={phone}
                  onChangeText={setPhone}
                  style={styles.input}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>ADDRESS</Text>
              <TextInput
                placeholder="Av. Lima 123"
                placeholderTextColor="#BBB"
                value={address}
                onChangeText={setAddress}
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <TextInput
                placeholder="you@example.com"
                placeholderTextColor="#BBB"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>PASSWORD</Text>
              <TextInput
                placeholder="••••••••"
                placeholderTextColor="#BBB"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>CONFIRM PASSWORD</Text>
              <TextInput
                placeholder="••••••••"
                placeholderTextColor="#BBB"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                style={styles.input}
              />
            </View>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={register}
              activeOpacity={0.9}
            >
              <Text style={styles.registerButtonText}>CREATE ACCOUNT</Text>
            </TouchableOpacity>

            <View style={styles.footerLinks}>
              <Text style={styles.footerText}>Already part of the collection?</Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.loginLink}>SIGN IN HERE</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 40,
  },
  backButtonText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#BBB",
    letterSpacing: 2,
  },
  headerSection: {
    marginBottom: 40,
  },
  brandLogo: {
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 8,
    color: "#1A1A1A",
  },
  welcomeText: {
    fontSize: 10,
    letterSpacing: 3,
    color: "#888",
    fontWeight: "600",
    marginTop: 8,
  },
  formSection: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 25,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  label: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: "#1A1A1A",
    marginBottom: 8,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingVertical: 10,
    fontSize: 14,
    color: "#1A1A1A",
  },
  profileInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  avatarWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F5F5F5',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#CCC',
    fontSize: 20,
    fontWeight: '300',
  },
  registerButton: {
    backgroundColor: "#1A1A1A",
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 15,
    borderRadius: 2,
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 11,
    letterSpacing: 3,
  },
  footerLinks: {
    marginTop: 40,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#888",
    marginBottom: 8,
  },
  loginLink: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1A1A1A",
    letterSpacing: 1.5,
    textDecorationLine: "underline",
  },
});