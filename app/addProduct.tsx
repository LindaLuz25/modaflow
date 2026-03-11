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
    useWindowDimensions,
    View
} from "react-native";

import { router } from "expo-router";
import { getDatabase, push, ref } from "firebase/database";
import { app } from "../firebaseConfig";

export default function AddProduct() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    const { width } = useWindowDimensions();
    const isDesktop = width > 750; // Umbral para activar el diseño dividido

    const db = getDatabase(app);

    const getDate = () => {
        const date = new Date();
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const handleAddProduct = async () => {
        if (!name || !description || !price || !imageUrl) {
            Alert.alert("Error", "Please fill in all the details.");
            return;
        }

        try {
            const productsRef = ref(db, "products");
            await push(productsRef, {
                name,
                description,
                price: Number(price),
                imageUrl,
                createdAt: getDate(),
                updatedAt: getDate()
            });

            Alert.alert("Success", "Product added to the collection");
            router.replace("/home");
        } catch (error) {
            Alert.alert("Error", "Could not save the product");
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1, backgroundColor: "#FFF" }}
        >
            <ScrollView showsVerticalScrollIndicator={false}>
                
                {/* HEADER MINIMALISTA */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={styles.backBtn}>← CANCEL</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>ADD TO CATALOGUE</Text>
                    <View style={{ width: 60 }} />
                </View>

                {/* CONTENEDOR DIVIDIDO */}
                <View style={[styles.mainWrapper, isDesktop && styles.rowLayout]}>
                    
                    {/* LADO IZQUIERDO: PREVIEW VERTICAL */}
                    <View style={[styles.imageSection, isDesktop && { width: "45%" }]}>
                        {imageUrl ? (
                            <Image source={{ uri: imageUrl }} style={styles.previewImage} />
                        ) : (
                            <View style={styles.placeholderBox}>
                                <Text style={styles.placeholderIcon}>📷</Text>
                                <Text style={styles.placeholderText}>PREVIEW AREA</Text>
                            </View>
                        )}
                    </View>

                    {/* LADO DERECHO: FORMULARIO */}
                    <View style={[styles.formSection, isDesktop && { width: "55%" }]}>
                        <Text style={styles.sectionHeading}>Product Details</Text>
                        
                        <Text style={styles.label}>FULL NAME</Text>
                        <TextInput
                            placeholder="e.g. Linen Blend Blazer"
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                        />

                        <Text style={styles.label}>DESCRIPTION</Text>
                        <TextInput
                            placeholder="Crafted from Italian wool..."
                            style={[styles.input, styles.textArea]}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                        />

                        <View style={styles.priceRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>PRICE (USD)</Text>
                                <TextInput
                                    placeholder="299.00"
                                    style={styles.input}
                                    keyboardType="numeric"
                                    value={price}
                                    onChangeText={setPrice}
                                />
                            </View>
                        </View>

                        <Text style={styles.label}>IMAGE URL</Text>
                        <TextInput
                            placeholder="https://fashion-studio.com/image.jpg"
                            style={styles.input}
                            value={imageUrl}
                            onChangeText={setImageUrl}
                        />

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleAddProduct}
                            activeOpacity={0.9}
                        >
                            <Text style={styles.saveButtonText}>CONFIRM & PUBLISH</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 30,
        paddingTop: 60,
        paddingBottom: 20,
    },
    backBtn: {
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 1,
        color: "#999",
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: "900",
        letterSpacing: 3,
        color: "#1A1A1A",
    },
    mainWrapper: {
        flex: 1,
        paddingHorizontal: 20,
        paddingBottom: 50,
    },
    rowLayout: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 40,
        paddingHorizontal: 40,
        marginTop: 20,
    },
    imageSection: {
        width: "100%",
        aspectRatio: 3/4, // Mantiene la proporción vertical de moda
        backgroundColor: "#F7F7F7",
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 30,
    },
    previewImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    placeholderBox: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    placeholderIcon: {
        fontSize: 30,
        marginBottom: 10,
        opacity: 0.2,
    },
    placeholderText: {
        fontSize: 10,
        fontWeight: "bold",
        letterSpacing: 2,
        color: "#CCC",
    },
    formSection: {
        flex: 1,
    },
    sectionHeading: {
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 25,
        color: "#1A1A1A",
    },
    label: {
        fontSize: 9,
        fontWeight: "800",
        letterSpacing: 1.2,
        color: "#777",
        marginBottom: 5,
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: "#EEE",
        paddingVertical: 10,
        fontSize: 15,
        marginBottom: 25,
        color: "#333",
    },
    textArea: {
        minHeight: 50,
        textAlignVertical: "top",
    },
    priceRow: {
        flexDirection: "row",
    },
    saveButton: {
        backgroundColor: "#1A1A1A",
        paddingVertical: 20,
        marginTop: 10,
        alignItems: "center",
        borderRadius: 2,
        // Sombra sutil para el botón
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    saveButtonText: {
        color: "#FFF",
        fontWeight: "bold",
        fontSize: 12,
        letterSpacing: 2.5,
    }
});