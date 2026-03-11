import { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    Image,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View
} from "react-native";

import { router } from "expo-router";
import { getDatabase, onValue, ref, remove } from "firebase/database";
import { app } from "../firebaseConfig";

type Product = {
    firebaseId: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    createdAt: string;
    updatedAt: string;
};

export default function ManageProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const { width } = useWindowDimensions();
    const db = getDatabase(app);

    // Configuración de columnas
    const numColumns = width > 700 ? 3 : 2;
    const gap = 15;
    const cardWidth = (width - (gap * (numColumns + 1))) / numColumns;

    useEffect(() => {
        const productsRef = ref(db, "products");
        const unsubscribe = onValue(productsRef, (snapshot) => {
            const data = snapshot.val() || {};
            const list = Object.keys(data).map((key) => ({
                firebaseId: key,
                ...data[key]
            }));
            setProducts(list);
        });
        return () => unsubscribe();
    }, []);

    const handleDelete = (id: string) => {
        const performDelete = () => remove(ref(db, `products/${id}`));

        if (Platform.OS === "web") {
            if (confirm("¿Eliminar este producto de la colección?")) performDelete();
        } else {
            Alert.alert(
                "Eliminar Producto",
                "Esta acción no se puede deshacer.",
                [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Eliminar", style: "destructive", onPress: performDelete }
                ]
            );
        }
    };

    const renderItem = ({ item }: { item: Product }) => (
        <View style={[styles.card, { width: cardWidth }]}>
            <View style={styles.imageWrapper}>
                <Image source={{ uri: item.imageUrl }} style={styles.image} />
                <View style={styles.priceTag}>
                    <Text style={styles.priceText}>${Number(item.price).toFixed(0)}</Text>
                </View>
            </View>

            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.date}>Updated: {item.updatedAt}</Text>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => router.push({ pathname: "/editProduct", params: { id: item.firebaseId } })}
                    >
                        <Text style={styles.btnText}>EDIT</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDelete(item.firebaseId)}
                    >
                        <Text style={styles.deleteIcon}>✕</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backLink}>← APP</Text>
                </TouchableOpacity>
                <Text style={styles.title}>INVENTORY</Text>
                <TouchableOpacity onPress={() => router.push("/addProduct")}>
                    <Text style={styles.addBtn}>+ NEW</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={products}
                renderItem={renderItem}
                keyExtractor={(item) => item.firebaseId}
                numColumns={numColumns}
                key={numColumns} // Forzar re-render al cambiar columnas
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : null}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 25,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    backLink: {
        fontSize: 10,
        fontWeight: "800",
        color: "#BBB",
        letterSpacing: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: "900",
        letterSpacing: 4,
        color: "#1A1A1A",
    },
    addBtn: {
        fontSize: 10,
        fontWeight: "800",
        color: "#1A1A1A",
        letterSpacing: 1,
    },
    listContent: {
        padding: 15,
    },
    columnWrapper: {
        justifyContent: "flex-start",
        gap: 15,
    },
    card: {
        backgroundColor: "#FFF",
        marginBottom: 20,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: "#F2F2F2",
        overflow: "hidden",
    },
    imageWrapper: {
        width: "100%",
        aspectRatio: 3 / 4, // Proporción vertical de moda
        backgroundColor: "#F9F9F9",
    },
    image: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    priceTag: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: "rgba(255,255,255,0.9)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 2,
    },
    priceText: {
        fontSize: 10,
        fontWeight: "bold",
        color: "#1A1A1A",
    },
    info: {
        padding: 12,
    },
    name: {
        fontSize: 12,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        color: "#1A1A1A",
        marginBottom: 4,
    },
    date: {
        fontSize: 9,
        color: "#AAA",
        marginBottom: 12,
    },
    actions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    editBtn: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#1A1A1A",
        paddingVertical: 8,
        alignItems: "center",
        borderRadius: 2,
    },
    btnText: {
        fontSize: 9,
        fontWeight: "800",
        letterSpacing: 1,
        color: "#1A1A1A",
    },
    deleteBtn: {
        width: 35,
        height: 35,
        backgroundColor: "#FEE2E2",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 2,
    },
    deleteIcon: {
        color: "#EF4444",
        fontSize: 12,
        fontWeight: "bold",
    },
});