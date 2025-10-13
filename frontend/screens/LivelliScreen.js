import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function LivelliScreen() {
  const [progress, setProgress] = useState({});
  const navigation = useNavigation();

 const livelli = [
  {
    id: 1,
    nome: "Le basi",
    materie: ["Inglese", "Italiano", "Matematica", "Scienze", "Storia", "Geografia"],
  },
  {
    id: 2,
    nome: "Le scoperte",
    materie: ["Verbi", "Divisioni", "Corpo umano", "Natura", "Antichi popoli", "Continenti"],
  },
  {
    id: 3,
    nome: "Il mondo",
    materie: ["Frasi", "Problemi", "Terra e spazio", "Ecosistemi", "Storia moderna", "Paesi e capitali"],
  },
];


  useEffect(() => {
    const loadProgress = async () => {
      const stored = await AsyncStorage.getItem("progress");
      if (stored) setProgress(JSON.parse(stored));
    };
    loadProgress();
  }, []);

  const handleComplete = (levelId, subject) => {
    navigation.navigate("Quiz", { livello: levelId, materia: subject });
  };

  const renderItem = ({ item }) => {
    const levelUnlocked = item.id === 1 || progress[item.id - 1];
    return (
      <View style={[styles.levelBox, !levelUnlocked && styles.locked]}>
        <Text style={styles.levelTitle}>⭐ Livello {item.id}: {item.nome}</Text>
        {item.materie.map((materia) => (
          <TouchableOpacity
            key={materia}
            disabled={!levelUnlocked}
            onPress={() => handleComplete(item.id, materia)}
            style={[
              styles.subjectButton,
              progress[item.id]?.[materia] && styles.completed,
            ]}
          >
            <Text style={styles.subjectText}>
              {progress[item.id]?.[materia] ? "✅ " : "📘 "}
              {materia}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={livelli}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F3EF",
    padding: 15,
  },
  levelBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
  },
  locked: {
    opacity: 0.5,
  },
  levelTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#5E4B3C",
    marginBottom: 10,
  },
  subjectButton: {
    backgroundColor: "#A3C585",
    borderRadius: 15,
    padding: 10,
    marginVertical: 5,
  },
  completed: {
    backgroundColor: "#7BA864",
  },
  subjectText: {
    color: "#fff",
    fontSize: 16,
  },
});
