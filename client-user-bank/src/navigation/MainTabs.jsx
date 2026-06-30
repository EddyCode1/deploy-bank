import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "../shared/constants/theme";

// Tabs principales
import DashboardScreen from "../features/dashboard/screens/DashboardScreen";
import AccountScreen from "../features/account/screens/AccountScreen";
import FavoriteScreen from "../features/favorite/screens/FavoriteScreen";

// Stack: Transacciones
import TransactionScreen from "../features/transaction/screens/TransactionScreen";
import AdminDepositsScreen from "../features/transaction/screens/AdminDepositsScreen";

// Stack: Más
import MoreMenuScreen from "../features/more/screens/MoreMenuScreen";
import ProfileScreen from "../features/profile/screens/ProfileScreen";
import ProductScreen from "../features/product/screens/ProductScreen";
import ServiceScreen from "../features/service/screens/ServiceScreen";
import FinancialScreen from "../features/financial/screens/FinancialScreen";
import ScheduleScreen from "../features/schedule/screens/ScheduleScreen";
import UsersScreen from "../features/user/screens/UsersScreen";
import UserDetailScreen from "../features/user/screens/UserDetailScreen";

const Tab = createBottomTabNavigator();
const TransStack = createNativeStackNavigator();
const MoreStack = createNativeStackNavigator();

function TransactionsStack() {
    return (
        <TransStack.Navigator screenOptions={{ headerShown: false }}>
            <TransStack.Screen name="TransactionMain" component={TransactionScreen} />
            <TransStack.Screen name="AdminDeposits" component={AdminDepositsScreen} />
        </TransStack.Navigator>
    );
}

function MoreStackNavigator() {
    return (
        <MoreStack.Navigator screenOptions={{ headerShown: false }}>
            <MoreStack.Screen name="MoreMenu" component={MoreMenuScreen} />
            <MoreStack.Screen name="Profile" component={ProfileScreen} />
            <MoreStack.Screen name="Products" component={ProductScreen} />
            <MoreStack.Screen name="Services" component={ServiceScreen} />
            <MoreStack.Screen name="Financial" component={FinancialScreen} />
            <MoreStack.Screen name="Schedule" component={ScheduleScreen} />
            <MoreStack.Screen name="Users" component={UsersScreen} />
            <MoreStack.Screen name="DetalleUsuario" component={UserDetailScreen} />
        </MoreStack.Navigator>
    );
}

const TAB_ICONS = {
    Dashboard: "dashboard",
    Account: "account-balance",
    Transacciones: "swap-horiz",
    Favorites: "star",
    More: "menu",
};

export default function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: true,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.secondary,
                tabBarStyle: {
                    backgroundColor: COLORS.surface,
                    borderTopWidth: 1,
                    borderTopColor: COLORS.border,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 4,
                },
                tabBarIcon: ({ color, size }) => (
                    <MaterialIcons
                        name={TAB_ICONS[route.name]}
                        size={size}
                        color={color}
                    />
                ),
            })}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{ title: "Inicio" }}
            />
            <Tab.Screen
                name="Account"
                component={AccountScreen}
                options={{ title: "Cuentas" }}
            />
            <Tab.Screen
                name="Transacciones"
                component={TransactionsStack}
                options={{ title: "Transacciones", headerShown: false }}
            />
            <Tab.Screen
                name="Favorites"
                component={FavoriteScreen}
                options={{ title: "Favoritos" }}
            />
            <Tab.Screen
                name="More"
                component={MoreStackNavigator}
                options={{ title: "Más", headerShown: false }}
            />
        </Tab.Navigator>
    );
}
