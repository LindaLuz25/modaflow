import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import {
  Alert,
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
import { auth } from "../../firebaseConfig";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter your credentials.");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/home");
    } catch (error: any) {
      Alert.alert("Login Error", "Invalid email or password.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

          <View style={styles.headerSection}>
            <Text style={styles.brandLogo}>MODAFLOW</Text>
            <View style={styles.line} />
            <Text style={styles.welcomeText}>WELCOME TO THE COLLECTION</Text>
          </View>

          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <TextInput
                placeholder="email@studio.com"
                placeholderTextColor="#BBB"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
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

            <TouchableOpacity
              style={styles.loginButton}
              onPress={login}
              activeOpacity={0.9}
            >
              <Text style={styles.loginButtonText}>SIGN IN</Text>
            </TouchableOpacity>

            <View style={styles.footerLinks}>
              <Text style={styles.noAccountText}>New to the studio?</Text>
              <TouchableOpacity onPress={() => router.push("/registro")}>
                <Text style={styles.registerLink}>CREATE ACCOUNT</Text>
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
    justifyContent: "center",
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 60,
  },
  brandLogo: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 10,
    color: "#1A1A1A",
    textAlign: "center",
  },
  line: {
    height: 1,
    width: 40,
    backgroundColor: "#1A1A1A",
    marginVertical: 15,
  },
  welcomeText: {
    fontSize: 10,
    letterSpacing: 3,
    color: "#888",
    fontWeight: "600",
  },
  formSection: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 25,
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
    paddingVertical: 12,
    fontSize: 15,
    color: "#1A1A1A",
    letterSpacing: 0.5,
  },
  loginButton: {
    backgroundColor: "#1A1A1A",
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 20,
    borderRadius: 2, // Bordes rectos para un look más serio
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 12,
    letterSpacing: 3,
  },
  footerLinks: {
    marginTop: 30,
    alignItems: "center",
  },
  noAccountText: {
    fontSize: 12,
    color: "#888",
    marginBottom: 5,
  },
  registerLink: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1A1A1A",
    letterSpacing: 1.5,
    textDecorationLine: "underline",
  },
});