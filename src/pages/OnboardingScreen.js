import React from "react";
import { Image, Dimensions } from "react-native";
import PaperOnboarding from "@gorhom/paper-onboarding";

const carCamera = require("../../assets/img/carCamera.png");
const slepDetectorIcon = require("../../assets/icon.png");
const safetyDriver = require("../../assets/img/safetyDriver.png");
const ear = require("../../assets/img/ear.png");

const data = [
  {
    title: "Sleep Detector",
    description: "Welcome to the Sleep Detector!\n\n(swipe left to learn more)",
    backgroundColor: "#B8C8D5",
    image: (
      <Image
        source={slepDetectorIcon}
        resizeMethod="resize"
        style={{ height: 260, width: 260 }}
      />
    ),
  },
  {
    title: "Drive safely",
    description:
      "We help you by warning and alerting you when you get fatigued or fall asleep.",
    backgroundColor: "#768DEA",
    image: (
      <Image
        source={safetyDriver}
        resizeMethod="resize"
        style={{
          height: 230,
          width: 230,
        }}
      />
    ),
  },
  {
    title: "Position your device",
    description:
      'Position your device\'s camera covering your entire face. If it is correct, the app will show the message "Awake" at the top.',
    backgroundColor: "#2C87C8",
    image: (
      <Image
        source={carCamera}
        resizeMethod="resize"
        style={{
          height: 260,
          width: Dimensions.get("window").width - 25,
          borderRadius: 25,
        }}
      />
    ),
  },
  {
    title: "Turn up the volume",
    description:
      "Turn up the volume to hear the alert sounds and enjoy the app better!",
    backgroundColor: "#9E8DBE",
    image: (
      <Image
        source={ear}
        resizeMethod="resize"
        style={{
          height: 230,
          width: 230,
        }}
      />
    ),
  },
];

export default function OnboardingScreen({ navigation }) {
  const handleOnClosePress = () => navigation.navigate("Initial");
  return (
    <PaperOnboarding
      data={data}
      onCloseButtonPress={handleOnClosePress}
      closeButtonTextStyle={{ fontSize: 18, fontWeight: "bold" }}
      titleStyle={{
        width: Dimensions.get("window").width - 80,
        fontSize: 30,
        fontWeight: "bold",
      }}
      descriptionStyle={{
        width: Dimensions.get("window").width - 50,
        fontSize: 17,
        fontWeight: "normal",
      }}
      indicatorSize={20}
    />
  );
}
