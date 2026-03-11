import { useEffect, useState } from "react";
import {
    ActivityIndicator,
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

import { router, useLocalSearchParams } from "expo-router";
import { get, getDatabase, ref, update } from "firebase/database";
import { app } from "../firebaseConfig";

export default function EditProduct() {
    const { id } = useLocalSearchParams();
    const { width } = useWindowDimensions();
    const isDesktop = width > 750;

    const db = getDatabase(app);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const productRef = ref(db, `products/${id}`);
        get(productRef).then((snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                setName(data.name);
                setDescription(data.description);
                setPrice(String(data.price));
                setImageUrl(data.imageUrl);
            }
            setLoading(false);
        }).catch(() => {
            setLoading(false);
            Alert.alert("Error", "Could not fetch product data");
        });
    }, [id]);

    const getDate = () => {
        const date = new Date();
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const handleUpdate = async () => {
        if (!name || !price || !imageUrl) {
            Alert.alert("Error", "Please fill essential fields");
            return;
        }

        try {
            await update(ref(db, `products/${id}`), {
                name,
                description,
                price: Number(price),
                imageUrl,
                updatedAt: getDate()
            });

            Alert.alert("Success", "Collection updated");
            router.back(); // Regresa a la pantalla anterior
        } catch (error) {
            Alert.alert("Error", "Could not update product");
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingCenter}>
                <ActivityIndicator size="large" color="#1A1A1A" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1, backgroundColor: "#FFF" }}
        >
            <ScrollView showsVerticalScrollIndicator={false}>
                
                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={styles.backBtn}>← DISCARD</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>EDIT PIECE</Text>
                    <View style={{ width: 60 }} />
                </View>

                {/* LAYOUT DIVIDIDO */}
                <View style={[styles.mainWrapper, isDesktop && styles.rowLayout]}>
                    
                    {/* IZQUIERDA: IMAGEN VERTICAL PREVIEW */}
                    <View style={[styles.imageSection, isDesktop && { width: "45%" }]}>
                        {imageUrl ? (
                            <Image source={{ uri: imageUrl }} style={styles.previewImage} />
                        ) : (
                            <View style={styles.placeholderBox}>
                                <Text style={styles.placeholderText}>NO IMAGE URL</Text>
                            </View>
                        )}
                        <View style={styles.editBadge}>
                            <Text style={styles.editBadgeText}>CURRENT PREVIEW</Text>
                        </View>
                    </View>

                    {/* DERECHA: FORMULARIO */}
                    <View style={[styles.formSection, isDesktop && { width: "55%" }]}>
                        <Text style={styles.sectionHeading}>Update Information</Text>
                        
                        <Text style={styles.label}>PRODUCT NAME</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                        />

                        <Text style={styles.label}>DESCRIPTION</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                        />

                        <Text style={styles.label}>PRICE (USD)</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={price}
                            onChangeText={setPrice}
                        />

                        <Text style={styles.label}>IMAGE URL</Text>
                        <TextInput
                            style={styles.input}
                            value={imageUrl}
                            onChangeText={setImageUrl}
                        />

                        <TouchableOpacity
                            style={styles.updateButton}
                            onPress={handleUpdate}
                            activeOpacity={0.9}
                        >
                            <Text style={styles.updateButtonText}>SAVE CHANGES</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.cancelLink}
                            onPress={() => router.back()}
                        >
                            <Text style={styles.cancelText}>Cancel and go back</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    loadingCenter: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#FFF'
    },
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
        aspectRatio: 3/4,
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
    editBadge: {
        position: 'absolute',
        bottom: 15,
        right: 15,
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 2,
    },
    editBadgeText: {
        fontSize: 9,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    placeholderBox: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
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
    updateButton: {
        backgroundColor: "#1A1A1A",
        paddingVertical: 20,
        marginTop: 10,
        alignItems: "center",
        borderRadius: 2,
    },
    updateButtonText: {
        color: "#FFF",
        fontWeight: "bold",
        fontSize: 12,
        letterSpacing: 2.5,
    },
    cancelLink: {
        marginTop: 20,
        alignItems: 'center',
    },
    cancelText: {
        color: '#999',
        fontSize: 12,
        textDecorationLine: 'underline',
    }
});