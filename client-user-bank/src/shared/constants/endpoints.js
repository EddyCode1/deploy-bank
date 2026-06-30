import { Platform } from "react-native";
import Constants from "expo-constants";

const DEV_MACHINE_IP = process.env.EXPO_PUBLIC_DEV_HOST || "192.168.1.45";

/**
 * Resuelve el host según plataforma: emulador Android (10.0.2.2),
 * simulador iOS (localhost) o dispositivo físico (IP de la Mac).
 */
export function getHost() {
    if (Platform.OS === "android") {
        return Constants.isDevice ? DEV_MACHINE_IP : "10.0.2.2";
    }
    return Constants.isDevice ? DEV_MACHINE_IP : "localhost";
}

export function getApiBaseUrl(port, pathPrefix = "") {
    return `http://${getHost()}:${port}${pathPrefix}`;
}

export const ENDPOINTS = {
    AUTH:
        process.env.EXPO_PUBLIC_AUTH_URL ||
        getApiBaseUrl(5025, "/api/v1/Auth"),
    API:
        process.env.EXPO_PUBLIC_API_BASE ||
        getApiBaseUrl(5025, "/api/v1"),
    BANKING:
        process.env.EXPO_PUBLIC_BANKING_API_BASE ||
        getApiBaseUrl(3000, "/SistemaBancarioAdmin/v1"),
};
