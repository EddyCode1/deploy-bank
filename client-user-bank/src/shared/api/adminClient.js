import axios from "axios";
import { ENDPOINTS } from "../constants/endpoints";
import bankingClient from "./bankingClient";
import authClient from "./authClient";
import { useAuthStore } from "../store/authStore";

function attachAuthHeader(client) {
    client.interceptors.request.use((config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        if (config.data?.constructor?.name === "FormData") {
            delete config.headers["Content-Type"];
        }
        return config;
    });
    return client;
}

const publicClient = attachAuthHeader(
    axios.create({
        baseURL: ENDPOINTS.API,
        headers: { "Content-Type": "application/json" },
    }),
);

const adminClient = attachAuthHeader(
    axios.create({
        baseURL: `${ENDPOINTS.API}/admin`,
        headers: { "Content-Type": "application/json" },
    }),
);

export { bankingClient, publicClient, authClient };
export default adminClient;
