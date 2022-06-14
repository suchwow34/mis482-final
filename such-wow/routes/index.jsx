import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Register from "../screens/Register";
import Home from "../screens/Home";
import { BACKGROUND_COLOR, MyTheme } from "../utils/theme";
import { auth } from "../modules/firebase";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Connect from "../screens/Connect";
import { StatusBar } from "expo-status-bar";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../modules/firebase";
import { registerForPushNotificationsAsync } from "../utils/push";
import DeviceDetail from "../screens/DeviceDetail";

const Stack = createNativeStackNavigator();

const Routes = () => {
  const [user, setUser] = React.useState(null);

  auth.onAuthStateChanged((user) => {
    if (user) {
      registerForPushNotificationsAsync().then((token) => {
        const userRef = doc(db, "users", user.uid);

        setDoc(
          userRef,
          {
            notification_token: token,
          },
          { merge: true }
        );
      });
    }
    setUser(user);
  });

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator theme={MyTheme}>
          {!user ? (
            <>
              <Stack.Screen
                name="Register"
                component={Register}
              />
            </>
          ) : (
            <>
              <Stack.Screen
                name="Home"
                component={Home}
              />
              <Stack.Screen
                name="Connect"
                component={Connect}
                options={{
                  title: "Connect a new device",
                }}
              />
              <Stack.Screen
                name="DeviceDetail"
                component={DeviceDetail}
                options={({ route }) => ({title: route.params.title})}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
};

export default Routes;
