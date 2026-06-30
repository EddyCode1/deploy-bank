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

            console.log("Login payload:", payload);
            const response = await authClient.post("/login", payload);
            console.log("Login response:", response.data);

            const { accessToken, refreshToken, userDetails, token, user } =
                response.data;

            const mappedAccessToken = accessToken || token;
            const mappedUser = mapUserForStore(userDetails || user);

            await login(mappedAccessToken, mappedUser, refreshToken);
            return response.data;
        } catch (err) {
            const message =
                err.response?.data?.message ||
                err.response?.data?.title ||
                err.response?.statusText ||
                err.message ||
                "Error al iniciar sesión";
            console.error("Login error details:", {
                message,
                status: err.response?.status,
                data: err.response?.data,
                request: err.config,
            });
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
            setError(err.response?.data?.message || "Error al registrarse");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { handleLogin, handleRegister, loading, error, logout };
};
