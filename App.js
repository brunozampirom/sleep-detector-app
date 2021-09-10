import React from "react";
import AnalysisScreen from "./src/pages/AnalysisScreen";
import InitialScreen from "./src/pages/InitialScreen";
import OnboardingScreen from "./src/pages/OnboardingScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "react-native";

const Stack = createStackNavigator();

export default function App() {
  return (
    <>
      <StatusBar style="inverted" backgroundColor={"black"} />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Onboarding"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Analysis" component={AnalysisScreen} />
          <Stack.Screen name="Initial" component={InitialScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
