import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  TextInput,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const driverIllustration = require("../../assets/img/driver-illustration_gray.png");

export default function InitialScreen({ navigation }) {
  const [name, setName] = useState("");

  const verifyName = () => {
    return name.length > 0;
  };

  const clearAllData = async () => {
    try {
      await AsyncStorage.clear();
    } catch (err) {
      console.error(err);
    }
  };

  const onPressStart = async () => {
    if (verifyName()) {
      await clearAllData();
      return navigation.navigate("Analysis", { name });
    }
    return alert("Please enter a name");
  };

  const onPressSkip = async () => {
    await clearAllData();
    return navigation.navigate("Analysis");
  };

  return (
    <View
      style={{
        flex: 1,
        paddingTop: 20,
        backgroundColor: "#D0D3D4",
      }}
    >
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, alignItems: "center" }}
      >
        <Text
          style={{
            fontSize: 13,
            textAlign: "center",
            fontWeight: "bold",
            letterSpacing: 1.5,
            color: "white",
          }}
        >
          Sleep Detector
        </Text>
        <Text
          style={{
            marginTop: 60,
            fontSize: 40,
            textAlign: "center",
            fontWeight: "300",
            letterSpacing: 1.2,
            color: "white",
          }}
        >
          {"What is your\n name?"}
        </Text>
        <Image
          source={driverIllustration}
          resizeMode={"contain"}
          style={{ height: 250, width: Dimensions.get("window").width * 1.15 }}
        />
        <TextInput
          placeholder="Name"
          autoCompleteType="name"
          value={name}
          onChangeText={setName}
          style={{
            marginTop: 22,
            backgroundColor: "white",
            width: Dimensions.get("window").width * 0.8,
            paddingVertical: 16,
            paddingHorizontal: 26,
            fontSize: 16,
            borderRadius: 50,
          }}
        />
        <View
          style={{
            flex: 1,
            width: Dimensions.get("window").width * 0.8,
            paddingBottom: 40,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <TouchableOpacity onPress={onPressSkip}>
            <Text
              style={{
                marginBottom: 15,
                marginLeft: 5,
                alignSelf: "center",
                fontSize: 16,
                textAlign: "center",
                color: "white",
              }}
            >
              Skip
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              height: 55,
              width: 140,
              borderRadius: 50,
              backgroundColor: "black",
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={onPressStart}
          >
            <Text
              style={{
                alignSelf: "center",
                fontSize: 18,
                textAlign: "center",
                color: "white",
              }}
            >
              Start
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}
