import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import { useNavigation } from "@react-navigation/native";

export default function LoginScreen({ onLogin }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogin = async () => {
    if (name.trim() && age.trim()) {
      const userData = { name, age };
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      if (onLogin) onLogin(userData);

      // ✅ Naviga subito al quiz
      navigation.replace("Quiz", {
        livello: "1",
        materia: "Inglese", // puoi cambiare o renderlo dinamico
      });
    }
  };

  return (
    <LinearGradient colors={["#7b2ff7", "#f107a3"]} style={styles.gradient}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <LottieView
          source={require("../assets/wizzy.json")}
          autoPlay
          loop
          style={styles.wizzy}
        />

        <Text style={styles.title}>Ciao! Io sono Wizzy 🪄</Text>
        <Text style={styles.subtitle}>Come ti chiami?</Text>

        <TextInput
          style={styles.input}
          placeholder="Il tuo nome"
          placeholderTextColor="rgba(255,255,255,0.6)"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.subtitle}>Quanti anni hai?</Text>
        <TextInput
          style={styles.input}
          placeholder="Età"
          placeholderTextColor="rgba(255,255,255,0.6)"
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Inizia l’avventura 🌈</Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 30,
  },
  wizzy: {
    width: 180,
    height: 180,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    marginTop: 10,
    marginBottom: 5,
    textAlign: "center",
  },
  input: {
    width: "85%",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    padding: 12,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
    fontSize: 16,
    color: "#fff",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 2,
    borderColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 25,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
