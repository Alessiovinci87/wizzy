import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import LottieView from "lottie-react-native";
import * as Speech from "expo-speech";

export default function WizzyCharacter({ message }) {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (message) {
            Speech.speak(message, {
                language: "it-IT",
                pitch: 1.3,           // tono più acuto
                rate: 0.95,           // un po’ più rapido
                volume: 1.0,
            });

            Animated.sequence([
                Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.delay(1500),
                Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
            ]).start();
        }
    }, [message]);

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <LottieView
                source={require("../../assets/wizzy.json")}
                autoPlay
                loop
                style={styles.lottie}
            />
            <View style={styles.bubble}>
                <Text style={styles.text}>{message}</Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 40,
        left: 20,
        flexDirection: "row",
        alignItems: "flex-end",
    },
    lottie: {
        width: 120,
        height: 120,
    },
    bubble: {
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 15,
        marginLeft: 10,
        borderWidth: 2,
        borderColor: "#A3C585",
        maxWidth: 200,
    },
    text: {
        fontSize: 16,
        color: "#5E4B3C",
    },
});
