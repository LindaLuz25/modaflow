import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { auth, db } from "../firebaseConfig";

// Paleta ModaFlow (Basada en tu Home)
const COLORS = {
  background: "#FFFFFF",
  myBubble: "#000000",   // Negro como los acentos de tu Home
  otherBubble: "#F8F8F8", // Gris ultra claro como tus image containers
  textMain: "#1A1A1A",
  textSecondary: "#888888",
  border: "#EEEEEE",
};

export default function Chat() {
  const [mensaje, setMensaje] = useState("");
  const [mensajes, setMensajes] = useState<any[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const userEmail = auth.currentUser?.email;

  useEffect(() => {
    StatusBar.setBarStyle("dark-content");
    const q = query(collection(db, "mensajes"), orderBy("fecha", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMensajes(lista);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
    });

    return unsubscribe;
  }, []);

  const enviarMensaje = async () => {
    if (mensaje.trim() === "") return;
    const textoEnviar = mensaje;
    setMensaje("");

    try {
      await addDoc(collection(db, "mensajes"), {
        texto: textoEnviar,
        usuario: userEmail,
        fecha: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const renderItem = ({ item }: any) => {
    const esMio = item.usuario === userEmail;
    let hora = "";
    if (item.fecha) {
      hora = item.fecha.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return (
      <View style={[styles.bubbleWrapper, esMio ? styles.wrapperMio : styles.wrapperOtro]}>
        {!esMio && <Text style={styles.usuarioLabel}>{item.usuario?.split('@')[0].toUpperCase()}</Text>}
        <View style={[styles.mensajeContainer, esMio ? styles.mio : styles.otro]}>
          <Text style={[styles.textoMensaje, esMio ? styles.textoBlanco : styles.textoNegro]}>
            {item.texto}
          </Text>
        </View>
        <Text style={styles.timestampText}>{hora}</Text>
      </View>
    );
  };

  return (
    <View  style={styles.safeArea}>
      {/* HEADER ESTILO MODAFLOW */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-down" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerTitleWrapper}>
          <Text style={styles.logoText}>MODAFLOW</Text>
          <Text style={styles.supportText}>CUSTOMER SUPPORT</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={mensajes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Escribe tu mensaje..."
              placeholderTextColor="#AAA"
              value={mensaje}
              onChangeText={setMensaje}
              style={styles.input}
              multiline
            />
            <TouchableOpacity 
              onPress={enviarMensaje}
              disabled={!mensaje.trim()}
              style={styles.sendIcon}
            >
              <Ionicons name="arrow-up-circle" size={32} color={mensaje.trim() ? "#000" : "#EEE"} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View >
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitleWrapper: { alignItems: 'center' },
  logoText: { fontSize: 16, letterSpacing: 6, fontWeight: "900", color: "#000" },
  supportText: { fontSize: 8, color: COLORS.textSecondary, letterSpacing: 2, marginTop: 2 },
  backButton: { width: 40 },

  listContent: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10 },
  
  bubbleWrapper: { marginBottom: 18, maxWidth: "80%" },
  wrapperMio: { alignSelf: "flex-end", alignItems: "flex-end" },
  wrapperOtro: { alignSelf: "flex-start", alignItems: "flex-start" },
  
  mensajeContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 2, // Bordes rectos como tus image containers de productos
  },
  mio: { backgroundColor: COLORS.myBubble },
  otro: { backgroundColor: COLORS.otherBubble },
  
  textoMensaje: {
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.3,
  },
  textoBlanco: { color: "#FFF" },
  textoNegro: { color: "#000" },
  
  timestampText: {
    fontSize: 9,
    color: "#CCC",
    marginTop: 4,
    letterSpacing: 1,
  },
  usuarioLabel: {
    fontSize: 10,
    color: "#000",
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 5,
  },

  // Input
  inputWrapper: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    paddingTop: 10,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FBFBFB",
    borderRadius: 0, // Recto para seguir el estilo de las cards
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    paddingVertical: 12,
    fontSize: 14,
    color: "#000",
  },
  sendIcon: { marginLeft: 10 }
});