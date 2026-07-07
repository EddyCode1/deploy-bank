import { useState } from "react";
import authClient from "../../../shared/api/authClient";
import { useAuthStore } from "../../../shared/store/authStore";

function mapUserForStore(userDetails = {}) {
    const name = [userDetails.name, userDetails.surname]
        .filter(Boolean)
        .join(" ");
    return {
        id: userDetails.id || userDetails._id || null,
        name: name || userDetails.nombre || userDetails.username || "",
        username: userDetails.username || "",
        email: userDetails.email || "",
        phone:
            userDetails.phone ||
            userDetails.telefono ||
            userDetails.contact_phone_number ||
            "",
        role: userDetails.role || userDetails.rol || "USER_ROLE",
    };
}

function resolveAuthErrorMessage(err, fallback = "Error de autenticación") {
    const apiErrors = err.response?.data?.errors;
    const validationMessages =
        apiErrors && typeof apiErrors === "object"
            ? Object.values(apiErrors).flat().filter(Boolean)
            : [];

    const raw =
        validationMessages[0] ||
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.response?.data?.title ||
        err.message ||
        fallback;

    const normalized = String(raw).toLowerCase();
    if (
        normalized.includes("cuenta pendiente de activación") ||
        normalized.includes("cuenta pendiente de activacion") ||
        normalized.includes("account pending")
    ) {
        return "Tu cuenta aún no ha sido activada por un administrador. Espera la aprobación e intenta de nuevo.";
    }
    if (normalized.includes("email not verified") || normalized.includes("email no verificado")) {
        return "Tu correo aún no está verificado. Revisa tu bandeja y confirma tu cuenta.";
    }
    if (
        normalized.includes("invalid credentials") ||
        normalized.includes("credenciales inválidas") ||
        normalized.includes("credenciales invalidas")
    ) {
        return "Credenciales incorrectas. Verifica tu usuario/email y contraseña.";
    }
    return raw || fallback;
}

export const useAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const login = useAuthStore((state) => state.login);
    const logout = useAuthStore((state) => state.logout);

    const handleLogin = async (data) => {
        try {
            setLoading(true);
            setError(null);

            const payload = {
                password: data.password,
                emailOrUsername: data.emailOrUsername,
                email: data.emailOrUsername?.includes("@") ? data.emailOrUsername : undefined,
                username: data.emailOrUsername?.includes("@") ? undefined : data.emailOrUsername,
            };

            const response = await authClient.post("/login", payload);

            const { accessToken, refreshToken, userDetails, token, user } =
                response.data;

            const mappedAccessToken = accessToken || token;
            const mappedUser = mapUserForStore(userDetails || user);

            await login(mappedAccessToken, mappedUser, refreshToken);
            return response.data;
        } catch (err) {
            const message = resolveAuthErrorMessage(err, "Error al iniciar sesión");
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (data) => {
        try {
            setLoading(true);
            setError(null);

            const payload = {
                name: data.name,
                surname: data.surname,
                username: data.username,
                email: data.email,
                password: data.password,
                phone: data.phone,
            };

            const response = await authClient.post("/register", payload);
            return response.data;
        } catch (err) {
            const message = resolveAuthErrorMessage(err, "Error al registrarse");
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    return { handleLogin, handleRegister, loading, error, logout };
};
