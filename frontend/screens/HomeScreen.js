import React, { useRef, useEffect, useState } from "react";
import { Text, TouchableOpacity, Animated, StyleSheet, Alert, View } from "react-native";
import { Video } from "expo-av";
import LottieView from "lottie-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen({ onLogout }) {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleStartQuiz = () => {
  navigation.navigate("Quiz", { materia: "Misto" });
};

  const handleReset = async () => {
    setResetting(true);
    try {
      await AsyncStorage.clear();
      Alert.alert("✅ Tutto pulito!", "Cache e dati utente cancellati.");
      if (onLogout) onLogout();
    } catch (error) {
      Alert.alert("Errore", "Impossibile cancellare la cache.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 🎬 Video di sfondo */}
      <Video
        source={require("../assets/video/video.mp4")}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        shouldPlay
        isLooping
        isMuted
      />

      {/* 🪄 Overlay con contenuto */}
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <LottieView
          source={require("../assets/wizzy.json")}
          autoPlay
          loop
          style={styles.wizzy}
        />
        <Text style={styles.title}>Benvenuto, ti aspettavo ✨</Text>

        <TouchableOpacity style={styles.button} onPress={handleStartQuiz}>
          <Text style={styles.buttonText}>Inizia l’avventura 🪄</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.resetButton]}
          onPress={handleReset}
          disabled={resetting}
        >
          <Text style={styles.buttonText}>
            {resetting ? "Ripristino in corso..." : "🔄 Pulisci cache e riparti"}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)", // leggera oscurazione per leggibilità
  },
  wizzy: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 40,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  button: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 2,
    borderColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 10,
  },
  resetButton: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderColor: "#f5f5f5",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
