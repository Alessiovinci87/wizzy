// frontend/screens/ChatWizzyScreen.js
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import { askWizzy } from "../src/api/client";

export default function ChatWizzyScreen({ route }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([
    { role: "assistant", content: "Ciao! Sono Wizzy 🪄\nScrivimi una domanda e risponderò in modo magico!" },
  ]);

  const scrollViewRef = useRef(null);
  const name = route?.params?.name || "amico";
  const age = route?.params?.age || 8;

  // 🔹 Scroll automatico ogni volta che cambia la chat
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => scrollViewRef.current.scrollToEnd({ animated: true }), 200);
    }
  }, [history]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;

    const newHistory = [...history, { role: "user", content: text }];
    setHistory(newHistory);
    setInput("");
    setLoading(true);

    try {
      const data = await askWizzy(text, name, age, newHistory);
      const wizzyReply = data.reply || "Oggi la magia è lenta... riproviamo! ✨";
      setHistory([...newHistory, { role: "assistant", content: wizzyReply }]);
    } catch (err) {
      setHistory([
        ...newHistory,
        {
          role: "assistant",
          content: "Oh-oh! Wizzy non riesce a sentirti! 😅 Controlla la connessione.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Nuova chat
  const newChat = () => {
    setHistory([
      {
        role: "assistant",
        content: "Ciao! Sono Wizzy 🪄\nPronto per una nuova chiacchierata magica!",
      },
    ]);
    setInput("");
    if (scrollViewRef.current) scrollViewRef.current.scrollTo({ y: 0, animated: true });
  };

  return (
    <LinearGradient colors={["#7b2ff7", "#f107a3"]} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* 🧙‍♂️ Animazione Wizzy */}
        <View style={styles.wizzyContainer}>
          <LottieView
            source={require("../assets/wizzy.json")}
            autoPlay
            loop
            style={styles.wizzyAnimation}
          />
        </View>

        {/* 🔹 Titolo + Nuova chat */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>Chat con Wizzy</Text>
          <TouchableOpacity onPress={newChat} style={styles.newChatBtn}>
            <Text style={styles.newChatText}>🔄 Nuova Chat</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.chatBox}
          contentContainerStyle={{ paddingBottom: 10 }}
          showsVerticalScrollIndicator={false}
        >
          {history.map((msg, i) => (
            <View key={i} style={styles.messageContainer}>
              {msg.role === "assistant" && <Text style={styles.roleLabel}>🧙‍♂️ Wizzy</Text>}
              <View
                style={[
                  styles.bubble,
                  msg.role === "user" ? styles.userBubble : styles.assistantBubble,
                ]}
              >
                <Text style={styles.text}>{msg.content}</Text>
              </View>
            </View>
          ))}
          {loading && <ActivityIndicator size="large" color="#fff" style={{ marginTop: 10 }} />}
        </ScrollView>

        <TextInput
          style={styles.input}
          placeholder="Scrivi qui..."
          placeholderTextColor="rgba(255,255,255,0.7)"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={send}
        />

        <TouchableOpacity style={styles.button} onPress={send} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "..." : "Invia ✉️"}</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  wizzyContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 180,
    marginTop: 20,
  },
  wizzyAnimation: { width: 160, height: 160 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  newChatBtn: {
    borderColor: "rgba(255,255,255,0.6)",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  newChatText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  chatBox: { flex: 1, marginBottom: 10 },
  messageContainer: { marginBottom: 8 },
  roleLabel: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 4,
    marginBottom: 2,
  },
  bubble: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 10,
    maxWidth: "90%",
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderColor: "rgba(255,255,255,0.4)",
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(255,255,255,0.3)",
    borderColor: "rgba(255,255,255,0.6)",
  },
  text: { color: "#fff", fontSize: 16 },
  input: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderColor: "rgba(255,255,255,0.4)",
    borderWidth: 1.5,
    borderRadius: 20,
    color: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderColor: "#fff",
    borderWidth: 2,
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
