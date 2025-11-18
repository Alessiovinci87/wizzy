import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchLesson } from "../src/api/client";

export default function LezioneScreen({ route, navigation }) {
    const { materia, numero, titolo } = route.params;
    const [lezione, setLezione] = useState([]);
    const [index, setIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showHint, setShowHint] = useState(false);
    const [correct, setCorrect] = useState(false);

    const current = lezione[index];

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const loadLesson = async () => {
            try {
                const data = await fetchLesson(materia, numero, controller.signal);
                if (isMounted && data?.lezione) setLezione(data.lezione);
            } catch (err) {
                if (err.name === "AbortError") return;
                console.error("❌ Errore caricamento lezione:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadLesson();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [materia, numero]);

    const handleSelect = (opt) => {
        if (opt === current.answer) {
            setCorrect(true);
            setShowHint(false);
        } else {
            setShowHint(true);
        }
    };

    const handleNext = async () => {
        setCorrect(false);
        setShowHint(false);

        if (index + 1 < lezione.length) {
            setIndex(index + 1);
        } else {
            try {
                const stored = await AsyncStorage.getItem("lezioniCompletate");
                const completate = stored ? JSON.parse(stored) : [];

                if (!completate.includes(numero)) {
                    completate.push(numero);
                    await AsyncStorage.setItem("lezioniCompletate", JSON.stringify(completate));
                }
            } catch (err) {
                console.error("❌ Errore salvataggio completamento:", err);
            }

            // ✅ Reset completo prima di tornare alla mappa
            setIndex(0);
            setLezione([]);
            setShowHint(false);
            setCorrect(false);

            // 🏰 Torna alla mappa
            navigation.navigate("Mappa");
        }
    };


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

    return (
        <View style={styles.center}>
            <Text style={styles.title}>
                Lezione {numero}: {titolo}
            </Text>

            <Text style={styles.question}>{current.q}</Text>

            {current.options?.map((opt) => (
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

            {showHint && !correct && (
                <Text style={styles.hintBox}>💡 {current.hint}</Text>
            )}

            {correct && (
                <>
                    {current.info ? (
                        <Text style={styles.infoText}>{current.info}</Text>
                    ) : (
                        <Text style={styles.infoText}>
                            ✨ Ottimo! Hai risposto correttamente!
                        </Text>
                    )}

                    <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                        <Text style={styles.nextText}>
                            {index + 1 === lezione.length
                                ? "🎉 Fine lezione"
                                : "Prossima domanda ➡️"}
                        </Text>
                    </TouchableOpacity>
                </>
            )}

        </View>
    );
}

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
        marginBottom: 20,
    },
    question: {
        fontSize: 18,
        color: "#5E4B3C",
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
        paddingVertical: 10,
        borderRadius: 12,
        marginTop: 25,
        width: "70%",
    },
    nextText: {
        color: "#fff",
        fontWeight: "600",
        textAlign: "center",
        fontSize: 16,
    },
});
