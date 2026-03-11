import { router } from "expo-router";
import { deleteUser } from "firebase/auth";
import { equalTo, getDatabase, onValue, orderByChild, query, ref, remove, update } from "firebase/database";
import { useEffect, useState } from "react";
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
import { auth } from "../firebaseConfig";

export default function ProfileScreen() {
    const [loading, setLoading] = useState(true);
    const [clientKey, setClientKey] = useState<string | null>(null);

    // Estados para los campos
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [profile, setProfile] = useState("");

    useEffect(() => {
        if (auth.currentUser?.email) {
            const db = getDatabase();
            const clientsRef = ref(db, "clients");
            const userQuery = query(clientsRef, orderByChild("email"), equalTo(auth.currentUser.email));

            onValue(userQuery, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const key = Object.keys(data)[0];
                    setClientKey(key);
                    setFullName(data[key].fullName);
                    setPhone(data[key].phone);
                    setAddress(data[key].address);
                    setProfile(data[key].profile || "");
                }
                setLoading(false);
            });
        }
    }, []);

    const handleUpdate = async () => {
        if (!clientKey) return;
        try {
            const db = getDatabase();
            const userRef = ref(db, `clients/${clientKey}`);

            await update(userRef, {
                fullName,
                phone,
                address,
                profile
            });
            router.back()


        } catch (error: any) {
            Alert.alert("Error", error.message);
        }
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            "DELETE ACCOUNT",
            "Are you sure? This action is permanent and all your data will be removed.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "DELETE",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const user = auth.currentUser;
                            if (user && clientKey) {
                                const db = getDatabase();
                                // 1. Eliminar de la base de datos
                                await remove(ref(db, `clients/${clientKey}`));
                                // 2. Eliminar del sistema de autenticación
                                await deleteUser(user);
                                router.replace("/");
                            }
                        } catch (error: any) {
                            Alert.alert("Security Notice", "For security reasons, please log in again before deleting your account.");
                        }
                    }
                }
            ]
        );
    };

    if (loading) return <View style={styles.loading}><Text>Loading Studio...</Text></View>;

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>

                    {/* HEADER */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Text style={styles.backLink}>← BACK</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>MY PROFILE</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    {/* AVATAR SECTION */}
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarWrapper}>
                            {profile ? (
                                <Image source={{ uri: profile }} style={styles.avatarImage} />
                            ) : (
                                <View style={styles.placeholderAvatar}>
                                    <Text style={styles.placeholderText}>{fullName.charAt(0)}</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.userEmail}>{auth.currentUser?.email}</Text>
                    </View>

                    {/* FORM */}
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>FULL NAME</Text>
                            <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>PROFILE IMAGE URL</Text>
                            <TextInput style={styles.input} value={profile} onChangeText={setProfile} placeholder="https://..." />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>PHONE NUMBER</Text>
                            <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>SHIPPING ADDRESS</Text>
                            <TextInput style={styles.input} value={address} onChangeText={setAddress} multiline />
                        </View>

                        <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
                            <Text style={styles.saveBtnText}>SAVE CHANGES</Text>
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
                            <Text style={styles.deleteBtnText}>DELETE ACCOUNT</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#FFF" },
    scrollContainer: { paddingHorizontal: 25, paddingBottom: 50 },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
    },
    backLink: { fontSize: 10, fontWeight: '800', letterSpacing: 2, color: '#BBB' },
    headerTitle: { fontSize: 14, fontWeight: '900', letterSpacing: 4, color: '#1A1A1A' },

    avatarSection: { alignItems: 'center', marginVertical: 30 },
    avatarWrapper: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F5F5F5',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#EEE',
        marginBottom: 15,
    },
    avatarImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    placeholderAvatar: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    placeholderText: { fontSize: 40, fontWeight: '200', color: '#CCC' },
    userEmail: { fontSize: 12, color: '#888', letterSpacing: 1 },

    form: { marginTop: 10 },
    inputGroup: { marginBottom: 25 },
    label: { fontSize: 9, fontWeight: '800', letterSpacing: 2, color: '#1A1A1A', marginBottom: 5 },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        paddingVertical: 10,
        fontSize: 15,
        color: '#333',
    },
    saveBtn: {
        backgroundColor: '#1A1A1A',
        paddingVertical: 18,
        alignItems: 'center',
        marginTop: 20,
        borderRadius: 2,
    },
    saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12, letterSpacing: 3 },

    divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 40 },

    deleteBtn: {
        paddingVertical: 10,
        alignItems: 'center',
    },
    deleteBtnText: { color: '#FF4D4D', fontWeight: 'bold', fontSize: 10, letterSpacing: 2 },
});