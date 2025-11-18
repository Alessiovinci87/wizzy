import React, { useRef, useEffect, useState } from "react";
import {
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Alert,
  View,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen({ onLogout }) {
  const navigation = useNavigation();
  const videoRef = useRef(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const [resetting, setResetting] = useState(false);
  const [lezioneInfo, setLezioneInfo] = useState(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  useEffect(() => {
    const caricaProgresso = async () => {
      const saved = await AsyncStorage.getItem("ultimaLezione");
      if (saved) {
        const data = JSON.parse(saved);
        console.log("📘 Ultima lezione:", data);
        setLezioneInfo(data);
      }
    };
    caricaProgresso();
  }, []);

  useEffect(() => {
    const resumeVideo = async () => {
      try {
        await videoRef.current?.setStatusAsync({ shouldPlay: true, positionMillis: 0 });
      } catch (error) {
        console.warn("⚠️ Video resume error:", error?.message);
      }
    };
    resumeVideo();
  }, []);

  const handleStartQuiz = () => {
    navigation.navigate("Quiz", { materia: "Misto" });
  };

  const handleOpenLesson = () => {
    const giornoProssimo = lezioneInfo ? lezioneInfo.giorno + 1 : 1;
    navigation.navigate("Lezione", {
      materia: "Inglese",
      livello: 1,
      giorno: giornoProssimo,
    });
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
      <Video
        ref={videoRef}
        source={require("../assets/video/video.mp4")}
        style={StyleSheet.absoluteFill}
        resizeMode={ResizeMode.COVER}
        isMuted
        shouldPlay
        isLooping
        onError={(e) => console.warn("⚠️ Video error:", e)}
      />

      <LinearGradient
        colors={["rgba(0,0,0,0.7)", "rgba(20,10,50,0.8)", "rgba(0,0,0,0.9)"]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <LottieView
            source={require("../assets/wizzy.json")}
            autoPlay
            loop
            style={styles.wizzy}
          />
        </Animated.View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Benvenuto, ti aspettavo</Text>
          <Text style={styles.subtitle}>✨ Inizia il tuo viaggio magico ✨</Text>
        </View>

        {lezioneInfo && (
          <View style={styles.progressCard}>
            <Text style={styles.progressText}>
              📚 Progresso: Lezione {lezioneInfo.giorno}
            </Text>
          </View>
        )}

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleStartQuiz}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#8B5CF6", "#6366F1", "#3B82F6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonIcon}>🪄</Text>
              <Text style={styles.primaryButtonText}>Inizia l'Avventura</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleOpenLesson}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#EC4899", "#8B5CF6", "#6366F1"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonIcon}>🎓</Text>
              <Text style={styles.secondaryButtonText}>
                {lezioneInfo ? `Continua Lezione ${lezioneInfo.giorno + 1}` : "Lezione del Giorno"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resetButtonWrapper}
            onPress={handleReset}
            disabled={resetting}
            activeOpacity={0.7}
          >
            <View style={styles.resetButton}>
              <Text style={styles.resetButtonText}>
                {resetting ? "⏳ Ripristino..." : "🔄 Pulisci Cache"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>Tocca un pulsante per iniziare il tuo percorso</Text>
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
    paddingHorizontal: 20,
  },
  wizzy: {
    width: 220,
    height: 220,
    marginBottom: 10,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    textShadowColor: "rgba(139, 92, 246, 0.8)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "rgba(255,255,255,0.8)",
    marginTop: 8,
    textAlign: "center",
  },
  progressCard: {
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.5)",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginBottom: 25,
  },
  progressText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonsContainer: {
    width: "100%",
    alignItems: "center",
    gap: 16,
  },
  primaryButton: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  secondaryButton: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#EC4899",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 12,
  },
  buttonIcon: {
    fontSize: 24,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  secondaryButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  resetButtonWrapper: {
    width: "100%",
    marginTop: 8,
  },
  resetButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.3)",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  resetButtonText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "600",
  },
  footerText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    marginTop: 30,
    textAlign: "center",
    fontStyle: "italic",
  },
});
