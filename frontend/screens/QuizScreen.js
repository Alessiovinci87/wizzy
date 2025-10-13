import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import WizzyCharacter from "../components/Wizzy/WizzyCharacter";
import { generateQuiz } from "../src/api/client";
import { Video } from "expo-av";

export default function QuizScreen({ route, navigation }) {
  const { materia } = route.params;
  const [livello, setLivello] = useState(null);
  const [quiz, setQuiz] = useState([]);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [wizzyMessage, setWizzyMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [answerText, setAnswerText] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const current = quiz[index];

  // 🔹 Carica quiz dopo scelta livello
  const loadQuiz = async (lvl) => {
    console.log("🚀 Generazione quiz per:", materia, lvl);
    setLoading(true);
    setError(false);
    setQuiz([]);
    setIndex(0);
    setLivello(lvl);

    try {
      const data = await generateQuiz(materia, lvl, 5, 8);
      console.log("📘 Dati quiz ricevuti:", data);

      if (data.quiz && Array.isArray(data.quiz) && data.quiz.length > 0) {
        setQuiz(data.quiz);
      } else {
        console.warn("⚠️ Nessun quiz ricevuto, uso fallback locale.");
        setQuiz([
          {
            q: "Come si dice 'gatto' in inglese?",
            options: ["Dog", "Cat", "Mouse"],
            answer: "Cat",
            info: "‘Cat’ significa gatto 🐱",
          },
        ]);
      }
    } catch (err) {
      console.error("❌ Errore caricamento quiz:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCorrect(false);
    setShowInfo(false);
    fadeAnim.setValue(0);
    setAnswerText("");
  }, [index]);

  const handleSelect = async (option) => {
    if (!current) return;

    if (option === current.answer) {
      setCorrect(true);
      setWizzyMessage("Ottimo lavoro! 🌟");

      const stored = await AsyncStorage.getItem("progress");
      const progress = stored ? JSON.parse(stored) : {};
      progress[livello] = { ...(progress[livello] || {}), [materia]: true };
      await AsyncStorage.setItem("progress", JSON.stringify(progress));

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    } else {
      setWizzyMessage("Ops! Riprova, ce la farai! 💪");
    }
  };

  const handleNext = () => {
    if (index + 1 < quiz.length) {
      setIndex(index + 1);
    } else {
      setWizzyMessage("Hai completato tutte le domande! 🎉");
      setTimeout(() => navigation.goBack(), 2500);
    }
  };

  // 🧩 schermata scelta livello
  if (!livello) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Scegli il livello di difficoltà 🪄</Text>

        <TouchableOpacity
          style={[styles.levelButton, { backgroundColor: "#6EE7B7" }]}
          onPress={() => loadQuiz(1)}
        >
          <Text style={styles.levelText}>Facile 🌱</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.levelButton, { backgroundColor: "#FDE047" }]}
          onPress={() => loadQuiz(3)}
        >
          <Text style={styles.levelText}>Medio ⚡</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.levelButton, { backgroundColor: "#FCA5A5" }]}
          onPress={() => loadQuiz(5)}
        >
          <Text style={styles.levelText}>Difficile 🔥</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 🎬 caricamento con video
  if (loading) {
    return (
      <View style={styles.container}>
        <Video
          source={require("../assets/video/video.mp4")}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          shouldPlay
          isLooping
          isMuted
        />
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>
            Wizzy sta preparando nuove domande magiche... ✨
          </Text>
        </View>
      </View>
    );
  }

  // ⚠️ errore caricamento
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Oh-oh! La magia si è inceppata 🪄</Text>
        <TouchableOpacity
          style={styles.magicButton}
          onPress={() => loadQuiz(livello)}
        >
          <Text style={styles.magicText}>Riprova ✨</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!current)
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Nessuna domanda trovata per {materia}</Text>
      </View>
    );

  // 🧠 gestione domanda
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {materia} – Livello {livello}
      </Text>
      <Text style={styles.question}>{current.q}</Text>

      {/* 🔹 tipo MULTIPLE */}
      {current.type !== "fill" &&
        current.options?.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[
              styles.option,
              correct && opt === current.answer && styles.correct,
            ]}
            onPress={() => handleSelect(opt)}
            disabled={correct}
          >
            <Text style={styles.optionText}>{opt}</Text>
          </TouchableOpacity>
        ))}

      {current.type === "fill" && !correct && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Scrivi qui la parola mancante..."
            value={answerText}
            onChangeText={setAnswerText}
          />

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => handleSelect(answerText.trim())}
            disabled={!answerText.trim()}
          >
            <Text style={styles.confirmText}>Conferma ✅</Text>
          </TouchableOpacity>
        </>
      )}

      {correct && (
        <>
          <Text style={styles.success}>⭐ Bravo! Esercizio completato!</Text>

          {!showInfo && (
            <TouchableOpacity
              style={styles.magicButton}
              onPress={() => setShowInfo(true)}
            >
              <Text style={styles.magicText}>Scopri di più 🔮</Text>
            </TouchableOpacity>
          )}

          {showInfo && (
            <Animated.View style={[styles.infoBox, { opacity: fadeAnim }]}>
              <Text style={styles.infoText}>{current.info}</Text>
              {current.pronunciation && (
                <Text style={styles.pronText}>
                  🔊 Pronuncia: {current.pronunciation}
                </Text>
              )}
              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNext}
              >
                <Text style={styles.nextText}>Prossima domanda ➡️</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </>
      )}

      <WizzyCharacter message={wizzyMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F3EF",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#5E4B3C",
    marginBottom: 20,
    textAlign: "center",
  },
  question: {
    fontSize: 18,
    color: "#5E4B3C",
    textAlign: "center",
    marginBottom: 20,
  },
  levelButton: {
    width: "80%",
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
  },
  levelText: {
    fontSize: 18,
    textAlign: "center",
    color: "#222",
    fontWeight: "500",
  },
  option: {
    backgroundColor: "#A3C585",
    padding: 12,
    borderRadius: 15,
    marginVertical: 6,
    width: "80%",
  },
  correct: {
    backgroundColor: "#7BA864",
  },
  optionText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
  },
  success: {
    marginTop: 20,
    fontSize: 18,
    color: "#7BA864",
    fontWeight: "600",
  },
  magicButton: {
    marginTop: 20,
    backgroundColor: "#D3B9F3",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
    elevation: 2,
  },
  magicText: {
    color: "#5E4B3C",
    fontSize: 16,
    fontWeight: "600",
  },
  infoBox: {
    marginTop: 15,
    backgroundColor: "#FFF8E7",
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#D3B9F3",
    padding: 12,
    width: "85%",
  },
  infoText: {
    color: "#5E4B3C",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  pronText: {
    color: "#5E4B3C",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 8,
  },
  nextButton: {
    backgroundColor: "#A3C585",
    paddingVertical: 8,
    borderRadius: 12,
  },
  nextText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
  input: {
    borderColor: "#A3C585",
    borderWidth: 2,
    borderRadius: 12,
    padding: 10,
    width: "80%",
    backgroundColor: "#fff",
    marginBottom: 15,
    fontSize: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 20,
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "500",
  },
  confirmButton: {
  backgroundColor: "#A3C585",
  paddingVertical: 10,
  paddingHorizontal: 25,
  borderRadius: 15,
  marginBottom: 20,
  elevation: 2,
},
confirmText: {
  color: "#fff",
  fontSize: 16,
  fontWeight: "600",
  textAlign: "center",
},
});
