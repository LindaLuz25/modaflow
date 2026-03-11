import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { equalTo, getDatabase, onValue, orderByChild, query, ref } from "firebase/database";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions
} from "react-native";

import { auth } from "../firebaseConfig";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
};

const HERO_HEIGHT = 900;

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [userProfile, setUserProfile] = useState<string | null>(null); // Estado para la foto de perfil
  const { width } = useWindowDimensions();
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const mainScrollRef = useRef<ScrollView>(null);
  const carouselRef = useRef<ScrollView>(null);

  const carouselImages = [
    "https://www.magazinehorse.com/wp-content/uploads/2023/03/TENDENCIAS-MODA-2023-PORTADA-MAGAZINEHORSE.png",
    "https://e01-elmundo.uecdn.es/assets/multimedia/imagenes/2022/01/18/16425128328233.png",
    "https://fashionandillustration.com/wp-content/uploads/2014/06/COLECCI%C3%93N-DE-MODAS-fall-winter-By-Paola-Castillo.jpg"
  ];

  const gap = 20;
  let columns = 2;
  if (width > 700) columns = 3;
  const cardWidth = (width - (gap * (columns + 1))) / columns;

  useEffect(() => {
    const db = getDatabase();
    
    // 1. Cargar Productos
    const productsRef = ref(db, "products");
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setProducts(productList);
      }
    });

    // 2. Cargar Perfil del Usuario Logueado
    if (auth.currentUser?.email) {
      const clientsRef = ref(db, "clients");
      const userQuery = query(clientsRef, orderByChild("email"), equalTo(auth.currentUser.email));
      
      onValue(userQuery, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const clientKey = Object.keys(data)[0];
          setUserProfile(data[clientKey].profile); // Obtenemos la URL del campo 'profile'
        }
      });
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = activeIndex === carouselImages.length - 1 ? 0 : activeIndex + 1;
      carouselRef.current?.scrollTo({ x: nextIndex * width, animated: true });
      setActiveIndex(nextIndex);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeIndex, width]);

  const logout = async () => {
    await signOut(auth);
    router.replace("/");
  };

  const scrollToEssentials = () => {
    mainScrollRef.current?.scrollTo({ y: HERO_HEIGHT - 100, animated: true });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView ref={mainScrollRef} showsVerticalScrollIndicator={false} style={styles.container}>

        {/* HEADER FLOTANTE */}
        <View style={styles.floatingHeader}>
          <View>
            <Text style={styles.logo}>MODAFLOW</Text>
            <Text style={styles.subtitle}>Spring / Summer 2026</Text>
          </View>
          
          <View style={styles.headerActions}>
            {/* FOTO DE PERFIL CIRCULAR */}
            <TouchableOpacity 
              style={styles.profileBtn}
              onPress={() => router.push("/profile")} // Te llevará a la página que crearemos
            >
              {userProfile ? (
                <Image source={{ uri: userProfile }} style={styles.profileImage} />
              ) : (
                <View style={[styles.profileImage, styles.profilePlaceholder]}>
                  <Text style={styles.placeholderInitial}>
                    {auth.currentUser?.email?.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuCircle}
              onPress={() => setMenuVisible(!menuVisible)}
            >
              <Text style={[styles.menuIcon, { color: '#FFF' }]}>{menuVisible ? "✕" : "☰"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* MENÚ DESPLEGABLE */}
        {menuVisible && (
          <View style={styles.dropdownMenu}>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); router.push("/addProduct") }}>
              <Text style={styles.menuItemText}>Add New Product</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); router.push("/manageProducts") }}>
              <Text style={styles.menuItemText}>Inventory</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={logout}>
              <Text style={[styles.menuItemText, { color: '#FF4D4D' }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* HERO CAROUSEL */}
        <View style={styles.carouselWrapper}>
          <ScrollView
            ref={carouselRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const currentIndex = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveIndex(currentIndex);
            }}
            contentContainerStyle={{ width: width * carouselImages.length }}
          >
            {carouselImages.map((uri, index) => (
              <View key={index} style={{ width: width, height: HERO_HEIGHT }}>
                <Image source={{ uri }} style={styles.heroImage} />
                <View style={styles.heroOverlay}>
                  <Text style={styles.heroTag}>EDITORIAL Nº {index + 1}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.scrollDownBtn} onPress={scrollToEssentials}>
            <Text style={styles.scrollDownText}>EXPLORE</Text>
            <Text style={styles.arrowIcon}>↓</Text>
          </TouchableOpacity>

          <View style={styles.dotContainer}>
            {carouselImages.map((_, i) => (
              <View key={i} style={[styles.dot, activeIndex === i && styles.activeDot]} />
            ))}
          </View>
        </View>

        {/* SECCIÓN DE PRODUCTOS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Products</Text>
          <TouchableOpacity><Text style={styles.viewAll}>Filter</Text></TouchableOpacity>
        </View>

        <View style={[styles.grid, { paddingHorizontal: gap }]}>
          {products.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={[styles.card, { width: cardWidth }]}
              activeOpacity={0.8}
            >
              <View style={styles.imageContainer}>
                <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                <Text style={styles.productPrice}>${Number(product.price).toFixed(2)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footerSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { flex: 1 },

  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingTop: 60,
    zIndex: 100,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileBtn: {
    marginRight: 15,
  },
  profileImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  profilePlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderInitial: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  logo: { fontSize: 22, letterSpacing: 8, fontWeight: "900", color: "#FFF" },
  subtitle: { fontSize: 9, color: "#EEE", letterSpacing: 3, textTransform: 'uppercase', marginTop: 4 },
  menuCircle: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  menuIcon: { fontSize: 24 },

  carouselWrapper: { height: HERO_HEIGHT, backgroundColor: "#000" },
  heroImage: { width: '100%', height: '100%', resizeMode: "cover", opacity: 0.85 },
  heroOverlay: {
    position: "absolute",
    bottom: 220,
    alignSelf: 'center',
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 25,
    paddingVertical: 12,
  },
  heroTag: { fontWeight: "bold", letterSpacing: 4, fontSize: 10, color: '#000' },

  scrollDownBtn: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    alignItems: 'center',
  },
  scrollDownText: { color: '#FFF', fontSize: 10, letterSpacing: 4, fontWeight: 'bold', marginBottom: 5 },
  arrowIcon: { color: '#FFF', fontSize: 28, fontWeight: '200' },

  dotContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center'
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 5 },
  activeDot: { backgroundColor: '#FFF', width: 25 },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    paddingHorizontal: 25,
    marginTop: 40,
    marginBottom: 25,
  },
  sectionTitle: { fontSize: 22, fontWeight: "700", color: "#1A1A1A", letterSpacing: -0.5 },
  viewAll: { fontSize: 12, color: "#888", textDecorationLine: "underline" },

  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-start", gap: 20 },
  card: { marginBottom: 35 },
  imageContainer: {
    width: "100%",
    aspectRatio: 2 / 3,
    backgroundColor: "#F8F8F8",
    borderRadius: 2,
    overflow: "hidden"
  },
  productImage: { width: "100%", height: "100%", resizeMode: "cover" },
  cardContent: { paddingTop: 15, alignItems: "flex-start" },
  productName: { fontSize: 11, fontWeight: "600", color: "#333", textTransform: "uppercase", letterSpacing: 1.5 },
  productPrice: { fontSize: 14, color: "#000", fontWeight: "700", marginTop: 6 },

  dropdownMenu: {
    position: "absolute",
    right: 25,
    top: 110,
    backgroundColor: "#FFF",
    paddingVertical: 10,
    width: 220,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 15,
    zIndex: 1000,
  },
  menuItem: { paddingVertical: 18, paddingHorizontal: 25 },
  menuItemText: { fontSize: 11, fontWeight: "700", letterSpacing: 2, textTransform: 'uppercase' },
  menuDivider: { height: 1, backgroundColor: '#F0F0F0', marginHorizontal: 25 },
  footerSpace: { height: 80 }
});