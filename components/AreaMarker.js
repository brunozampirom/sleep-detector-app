import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";

export default AreaMarker = ({ faceOnArea = false }) => {
  return (
    <View style={styles.Container}>
      <View
        style={[
          styles.Borders,
          styles.BorderLeftTop,
          faceOnArea && { borderColor: "white" },
        ]}
      />
      <View
        style={[
          styles.Borders,
          styles.BorderRightTop,
          faceOnArea && { borderColor: "white" },
        ]}
      />
      <View
        style={[
          styles.Borders,
          styles.BorderLeftBottom,
          faceOnArea && { borderColor: "white" },
        ]}
      />
      <View
        style={[
          styles.Borders,
          styles.BorderRightBottom,
          faceOnArea && { borderColor: "white" },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  Container: {
    position: "absolute",
    height: 450,
    width: 300,
    marginTop: 25,
    top: (Dimensions.get("window").height - 450) / 2,
    bottom: (Dimensions.get("window").height - 450) / 2,
    left: (Dimensions.get("window").width - 300) / 2,
    right: (Dimensions.get("window").width - 300) / 2,
  },
  Borders: {
    position: "absolute",
    width: 50,
    height: 50,
    borderColor: "rgba(255,255,255, 0.4)",
  },
  BorderLeftTop: {
    borderLeftWidth: 8,
    borderTopWidth: 8,
  },
  BorderRightTop: {
    left: 300 - 50,
    borderTopWidth: 8,
    borderRightWidth: 8,
  },
  BorderLeftBottom: {
    top: 450 - 50,
    borderLeftWidth: 8,
    borderBottomWidth: 8,
  },
  BorderRightBottom: {
    top: 450 - 50,
    left: 300 - 50,
    borderRightWidth: 8,
    borderBottomWidth: 8,
  },
});
