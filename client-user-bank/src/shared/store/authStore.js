import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    deleteRefreshToken,
    setRefreshToken,
} from "../storage/secureStorage";

export const useAuthStore = create(
    persist(
        (set, get) => ({
            token: null,
            user: null,
            isAuthenticated: false,
            _hasHydrated: false,

            setHasHydrated: (state) => set({ _hasHydrated: state }),

            login: async (accessToken, user, refreshToken) => {
                set({
                    token: accessToken,
                    user,
                    isAuthenticated: true,
                });
                if (refreshToken) {
                    await setRefreshToken(refreshToken);
                }
            },

            setAccessToken: (token) => set({ token }),

            patchUser: (partial) =>
                set((state) => {
                    if (!state.user) return state;
                    return { user: { ...state.user, ...partial } };
                }),

            getToken: () => get().token,
            getUser: () => get().user,

            logout: async () => {
                set({
                    token: null,
                    user: null,
                    isAuthenticated: false,
                });
                await deleteRefreshToken();
            },
        }),
        {
            name: "auth-storage",
            storage: createJSONStorage(() => AsyncStorage),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        },
    ),
);
