import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  TextInput,
} from "react-native";
import Constants from "expo-constants";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const driverIllustration = require("../../../assets/img/driver-illustration_gray.png");

export default function InitialScreen({ navigation }) {
  const [name, setName] = useState("");

  const verifyName = () => {
    return name.length > 0;
  };

  const onPressStart = () => {
    if (verifyName()) return navigation.navigate("Analysis", { name });
    return alert("Please enter a name");
  };

  return (
    <View
      style={{
        flex: 1,
        paddingTop: Constants.statusBarHeight + 10,
        backgroundColor: "#D0D3D4",
      }}
    >
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, alignItems: "center" }}
      >
        <Text
          style={{
            marginTop: 60,
            fontSize: 40,
            textAlign: "center",
            color: "white",
          }}
        >
          {"What is your\n name?"}
        </Text>
        <Image
          source={driverIllustration}
          resizeMode={"contain"}
          style={{ height: 250, width: Dimensions.get("window").width * 1.2 }}
        />
        <TextInput
          placeholder="Name"
          autoCompleteType="name"
          value={name}
          onChangeText={setName}
          style={{
            marginVertical: 20,
            backgroundColor: "white",
            width: Dimensions.get("window").width * 0.8,
            paddingVertical: 20,
            paddingHorizontal: 28,
            fontSize: 18,
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
          <TouchableOpacity onPress={() => navigation.navigate("Analysis")}>
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
              height: 60,
              width: 150,
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
                fontSize: 20,
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
