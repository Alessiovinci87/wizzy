import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ImageBackground,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function MappaRegno() {
    const navigation = useNavigation();
    const [completate, setCompletate] = useState([]);

    useEffect(() => {
        const loadProgress = async () => {
            const stored = await AsyncStorage.getItem("lezioniCompletate");
            if (stored) setCompletate(JSON.parse(stored));
        };
        loadProgress();
    }, []);

    const handleSelectLezione = (numero) => {
        const titoli = {
            1: "Colori e oggetti",
            2: "Animali e verbo to be",
            3: "Cibo e bevande",
            4: "La scuola e la casa",
            5: "Famiglia e persone",
            6: "Azioni quotidiane",
            7: "Tempo e meteo",
            8: "Luoghi e direzioni",
            9: "Emozioni e congiunzioni",
            10: "Prova magica finale ✨",
        };

        navigation.navigate("Lezione", {
            materia: "inglese",
            numero,
            titolo: titoli[numero] || `Lezione ${numero}`,
        });
    };

    const isCompletata = (num) => completate.includes(num);

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require("../assets/images/regno_test.png")}
                style={styles.background}
                resizeMode="cover"
            >
                {pallini.map((p) => (
                    <TouchableOpacity
                        key={p.id}
                        style={[
                            styles.pallino,
                            { top: `${p.y}%`, left: `${p.x}%` },
                            isCompletata(p.id) && styles.completata,
                        ]}
                        onPress={() => handleSelectLezione(p.id)}
                    >
                        <Text
                            style={[
                                styles.pallinoText,
                                isCompletata(p.id) && styles.pallinoTextCompletato,
                            ]}
                        >
                            {p.id}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ImageBackground>
        </View>
    );
}

// 🔹 Posizioni relative dei pallini sul sentiero
const pallini = [
    { id: 1, x: 85, y: 90 },
    { id: 2, x: 81, y: 81 },
    { id: 3, x: 67, y: 74 },
    { id: 4, x: 31, y: 71 },
    { id: 5, x: 47, y: 70 },
    { id: 6, x: 63, y: 68 },
    { id: 7, x: 69, y: 60 },
    { id: 8, x: 55, y: 57 },
    { id: 9, x: 42, y: 53 },
    { id: 10, x: 41, y: 46 },
];

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#CFE8FF",
    },
    background: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
    pallino: {
        position: "absolute",
        width: 45,
        height: 45,
        borderRadius: 25,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 3,
        borderColor: "#bc9c22",
    },
    pallinoText: {
        fontSize: 18,
        fontWeight: "700",
        color: "#5E4B3C",
    },
    completata: {
        backgroundColor: "#FDD835",
        borderColor: "#FBC02D",
    },
    pallinoTextCompletato: {
        color: "#fff",
    },
});
