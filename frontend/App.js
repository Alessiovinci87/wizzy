import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LogBox } from "react-native";

import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import LivelliScreen from "./screens/LivelliScreen";
import QuizScreen from "./screens/QuizScreen";
import ChatWizzyScreen from "./screens/ChatWizzyScreen";
import MappaRegno from "./screens/MappaRegno";

LogBox.ignoreLogs(["The action 'REPLACE'"]);

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// --- 📘 NUOVA SCHERMATA LEZIONE ---
function LezioneScreen() {
  const [lezione, setLezione] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [correct, setCorrect] = useState(false);

  const current = lezione[index];

  useEffect(() => {
    const loadLesson = async () => {
      try {
        const res = await fetch("http://192.168.1.14:5050/api/ai/lezioni/inglese/1");
        const data = await res.json();
        if (data.lezione) setLezione(data.lezione);
      } catch (err) {
        console.error("❌ Errore caricamento lezione:", err);
      } finally {
        setLoading(false);
      }
    };
    loadLesson();
  }, []);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#5E4B3C" />
        <Text style={styles.subtitle}>Wizzy sta preparando la lezione... ✨</Text>
      </View>
    );

  if (!current)
    return (
      <View style={styles.center}>
        <Text style={styles.subtitle}>Nessuna domanda trovata!</Text>
      </View>
    );

  const handleSelect = (opt) => {
    if (opt === current.answer) {
      setCorrect(true);
    } else {
      setShowHint(true);
    }
  };

  const handleNext = () => {
    setShowHint(false);
    setCorrect(false);
    if (index + 1 < lezione.length) setIndex(index + 1);
  };

  return (
    <View style={styles.center}>
      <Text style={styles.title}>Lezione 1: {current.q}</Text>

      {current.options?.map((opt) => (
        <TouchableOpacity
          key={opt}
          style={[styles.option, correct && opt === current.answer && styles.correct]}
          onPress={() => handleSelect(opt)}
          disabled={correct}
        >
          <Text style={styles.optionText}>{opt}</Text>
        </TouchableOpacity>
      ))}

      {showHint && !correct && <Text style={styles.hintBox}>💡 {current.hint}</Text>}

      {correct && (
        <>
          <Text style={styles.infoText}>{current.info}</Text>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextText}>Prossima domanda ➡️</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

// --- SCHERMATA RICREAZIONE ---
function RicreazioneScreen() {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Ricreazione 🎮</Text>
      <Text style={styles.subtitle}>Piccoli minigiochi per fare una pausa</Text>
    </View>
  );
}

// --- NAVIGAZIONE PRINCIPALE ---
function MainTabs({ user, onLogout }) {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home">
        {() => <HomeScreen user={user} onLogout={onLogout} />}
      </Tab.Screen>

      {/* 🗺️ Nuova schermata: Mappa del Regno */}
      <Tab.Screen name="Mappa" component={MappaRegno} />

      <Tab.Screen name="Livelli" component={LivelliScreen} />
      <Tab.Screen name="Lezione" component={LezioneScreen} />
      <Tab.Screen name="Ricreazione" component={RicreazioneScreen} />
      <Tab.Screen
        name="Chat"
        children={() => (
          <ChatWizzyScreen
            route={{ params: { name: user?.name, age: user?.age } }}
          />
        )}
      />
    </Tab.Navigator>
  );
}


// --- APP PRINCIPALE ---
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startToQuiz, setStartToQuiz] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const stored = await AsyncStorage.getItem("user");
      if (stored) setUser(JSON.parse(stored));
      setLoading(false);
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    setUser(null);
    setStartToQuiz(false);
  };

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login">
            {() => (
              <LoginScreen
                onLogin={(data) => {
                  setUser(data);
                  setStartToQuiz(true);
                }}
              />
            )}
          </Stack.Screen>
        ) : startToQuiz ? (
          <>
            <Stack.Screen
              name="Quiz"
              component={QuizScreen}
              initialParams={{ livello: "1", materia: "Inglese" }}
            />
            <Stack.Screen name="MainTabs">
              {() => <MainTabs user={user} onLogout={handleLogout} />}
            </Stack.Screen>
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs">
              {() => <MainTabs user={user} onLogout={handleLogout} />}
            </Stack.Screen>
            <Stack.Screen name="Quiz" component={QuizScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// --- STILI ---
const styles = StyleSheet.create({
  center: {
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
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#7C6F65",
    textAlign: "center",
    marginBottom: 20,
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
  infoText: {
    marginTop: 20,
    color: "#5E4B3C",
    fontSize: 16,
    textAlign: "center",
  },
  hintBox: {
    backgroundColor: "#FFF8E7",
    borderWidth: 2,
    borderColor: "#FDE047",
    borderRadius: 15,
    padding: 10,
    marginTop: 15,
    width: "80%",
    textAlign: "center",
    color: "#5E4B3C",
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: "#A3C585",
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 20,
  },
  nextText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
});
