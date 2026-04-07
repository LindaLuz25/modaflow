import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

import { auth } from "../firebaseConfig";
import Chat from "./chat";

type ChatUser = {
    id: string;
    name: string;
};

export default function Support() {
    const [users, setUsers] = useState<ChatUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
    const [sidebarVisible, setSidebarVisible] = useState(true);

    useEffect(() => {
        // 🔥 Mock (luego Firebase)
        setUsers([
            { id: "1", name: "Cliente 1" },
            { id: "2", name: "Cliente 2" },
            { id: "3", name: "Cliente 3" },
        ]);
    }, []);

    const logout = async () => {
        await signOut(auth);
        router.replace("/");
    };

    return (
        <SafeAreaView style={styles.container}>

            {/* HEADER */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => setSidebarVisible(!sidebarVisible)}>
                        <Text style={styles.menuIcon}>☰</Text>
                    </TouchableOpacity>

                    <View>
                        <Text style={styles.logo}>MODAFLOW</Text>
                        <Text style={styles.subtitle}>Support Panel</Text>
                    </View>
                </View>

                <TouchableOpacity onPress={logout}>
                    <Text style={styles.logout}>Logout</Text>
                </TouchableOpacity>
            </View>

            {/* CONTENT */}
            <View style={{ flex: 1, flexDirection: "row" }}>

                {/* SIDEBAR */}
                {sidebarVisible && (
                    <View style={styles.sidebar}>
                        <Text style={styles.sidebarTitle}>Chats</Text>

                        <FlatList
                            data={users}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.userItem,
                                        selectedUser?.id === item.id && styles.activeUser
                                    ]}
                                    onPress={() => {
                                        setSelectedUser(item);
                                        setSidebarVisible(false); // 🔥 mejor UX mobile
                                    }}
                                >
                                    <View style={styles.userRow}>
                                        <View style={styles.avatar}>
                                            <Text style={styles.avatarText}>
                                                {item.name.charAt(0)}
                                            </Text>
                                        </View>

                                        <View>
                                            <Text style={[
                                                styles.userText,
                                                selectedUser?.id === item.id && styles.userTextActive
                                            ]}>
                                                {item.name}
                                            </Text>
                                            <Text style={styles.userStatus}>Online</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                )}

                {/* CHAT AREA */}
                <View style={styles.chatArea}>
                    {selectedUser ? (
                        <>
                            <Text style={styles.chatHeader}>
                                Chat con {selectedUser.name}
                            </Text>

                            <View style={styles.chatBox}>
                                <Chat />
                            </View>
                        </>
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyTitle}>No chat selected</Text>
                            <Text style={styles.emptyText}>
                                Choose a conversation to start assisting users
                            </Text>
                        </View>
                    )}
                </View>

            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF",
    },

    header: {
        height: 100,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 25,
        paddingTop: 30, // 👈 AGREGA ESTO
        borderBottomWidth: 1,
        borderColor: "#EEE",
    },

    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
    },

    menuIcon: {
        fontSize: 24,
        marginRight: 12,
    },

    logo: {
        fontSize: 18,
        fontWeight: "900",
        letterSpacing: 3,
    },

    subtitle: {
        fontSize: 10,
        color: "#888",
        letterSpacing: 2,
        marginTop: 4,
    },

    logout: {
        color: "#FF4D4D",
        fontWeight: "600",
    },

    sidebar: {
        width: 260,
        borderRightWidth: 1,
        borderColor: "#EEE",
        padding: 15,
        backgroundColor: "#FAFAFA",
    },

    sidebarTitle: {
        fontSize: 14,
        fontWeight: "700",
        marginBottom: 15,
    },

    userItem: {
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
        backgroundColor: "#F5F5F5",
    },

    activeUser: {
        backgroundColor: "#000",
    },

    userRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    avatar: {
        width: 35,
        height: 35,
        borderRadius: 20,
        backgroundColor: "#DDD",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },

    avatarText: {
        fontSize: 14,
        fontWeight: "700",
    },

    userText: {
        fontSize: 12,
        color: "#000",
        fontWeight: "600",
    },

    userTextActive: {
        color: "#FFF",
    },

    userStatus: {
        fontSize: 10,
        color: "#4CAF50",
    },

    chatArea: {
        flex: 1,
        padding: 20,
    },

    chatHeader: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 10,
    },

    chatBox: {
        flex: 1,
        backgroundColor: "#FFF",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#EEE",
        overflow: "hidden",
    },

    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    emptyTitle: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 5,
    },

    emptyText: {
        color: "#888",
        fontSize: 12,
        textAlign: "center",
    },
});