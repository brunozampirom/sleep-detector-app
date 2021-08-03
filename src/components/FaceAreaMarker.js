import React from "react";
import { View } from "react-native";

export default function AreaMarker({ faceProps }) {
  if (!faceProps) return <></>;
  return (
    <View
      style={{
        position: "absolute",
        left: faceProps.left,
        right: faceProps.right,
        top: faceProps.top,
        bottom: faceProps.bottom,
        height: faceProps.height,
        width: faceProps.width,
        borderColor: "white",
        borderWidth: 5,
        opacity: 0.5,
        borderRadius: faceProps.height / 3,
      }}
    />
  );
}
