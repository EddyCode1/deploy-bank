import {
    View,
    Text,
    StyleSheet,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { COLORS, SPACING, FONT_SIZE, RADIUS, GRADIENTS } from "../../../shared/constants/theme";
import Input from "../../../shared/components/Input";
import Button from "../../../shared/components/Button";
import { useAuth } from "../hooks/useAuth";

import bankLogo from "../../../../assets/bank-logo.png";

const LoginScreen = ({ navigation }) => {
    const { handleLogin, loading, error } = useAuth();

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            emailOrUsername: "",
            password: "",
        },
    });

    const onSubmit = async (data) => {
        try {
            await handleLogin(data);
        } catch (loginError) {
            const message =
                loginError.message ||
                loginError.response?.data?.message ||
                "Error al iniciar sesión";
            Alert.alert("No se pudo iniciar sesión", message);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <LinearGradient
                colors={GRADIENTS.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerGradient}
            />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View
                    entering={FadeInDown.duration(500).springify().damping(14)}
                    style={styles.header}
                >
                    <View style={styles.logoWrapper}>
                        <Image
                            source={bankLogo}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={styles.title}>Banco del Quetzal</Text>
                    <Text style={styles.subtitle}>Tu banca digital, siempre contigo</Text>
                </Animated.View>

                <Animated.View
                    entering={FadeInUp.duration(500).delay(150).springify().damping(16)}
                    style={styles.card}
                >
                    <Controller
                        control={control}
                        rules={{ required: "Email o usuario requerido" }}
                        render={({ field: { onChange, value } }) => (
                            <Input
                                label="Email o usuario"
                                placeholder="correo@ejemplo.com o usuario"
                                onChangeText={onChange}
                                value={value}
                                autoCapitalize="none"
                                error={errors.emailOrUsername?.message}
                            />
                        )}
                        name="emailOrUsername"
                    />

                    <Controller
                        control={control}
                        rules={{ required: "Contraseña requerida" }}
                        render={({ field: { onChange, value } }) => (
                            <Input
                                label="Contraseña"
                                placeholder="••••••••"
                                secureTextEntry
                                onChangeText={onChange}
                                value={value}
                                autoCapitalize="none"
                                error={errors.password?.message}
                            />
                        )}
                        name="password"
                    />

                    <Button
                        title="Iniciar Sesión"
                        onPress={handleSubmit(onSubmit)}
                        loading={loading}
                        style={styles.button}
                    />

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <Text
                        style={[styles.link, { textAlign: 'center', marginTop: 4 }]}
                        onPress={() => navigation.navigate("ForgotPassword")}
                    >
                        ¿Olvidaste tu contraseña?
                    </Text>
                </Animated.View>

                <Animated.View
                    entering={FadeInUp.duration(500).delay(280)}
                    style={styles.footer}
                >
                    <Text style={styles.footerText}>¿No tienes cuenta? </Text>
                    <Text
                        style={styles.link}
                        onPress={() => navigation.navigate("Register")}
                    >
                        Regístrate
                    </Text>
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    headerGradient: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 280,
    },
    scrollContent: {
        flexGrow: 1,
        padding: SPACING.xl,
        justifyContent: "center",
        paddingTop: SPACING.xxl + SPACING.lg,
    },
    header: {
        alignItems: "center",
        marginBottom: SPACING.xl,
    },
    logoWrapper: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.xl,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
    logo: {
        height: 60,
        width: 160,
    },
    title: {
        fontSize: FONT_SIZE.xxl,
        fontWeight: "800",
        color: COLORS.surface,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: FONT_SIZE.sm,
        color: "rgba(255,255,255,0.9)",
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 6,
    },
    button: {
        marginTop: SPACING.lg,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: SPACING.xl,
    },
    footerText: {
        fontSize: FONT_SIZE.md,
        color: COLORS.textLight,
    },
    link: {
        fontSize: FONT_SIZE.md,
        color: COLORS.primary,
        fontWeight: "700",
    },
    errorText: {
        marginTop: SPACING.md,
        color: "#ef4444",
        fontSize: FONT_SIZE.sm,
        textAlign: "center",
        lineHeight: 20,
    },
});

export default LoginScreen;
