import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Camera } from "expo-camera";
import * as FaceDetector from "expo-face-detector";

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [config, setConfig] = useState(true);
  const [leftEyeOpenProbability, setLeftEyeOpenProbability] = useState(0);
  const [rightEyeOpenProbability, setRightEyeOpenProbabilityy] = useState(0);
  const [sleepDetected, setSleepDetected] = useState(false);
  const [countDownStarted, setCountDownStarted] = useState(false);
  const [countDownSeconds, setCountDownSeconds] = useState(0);
  const [timer, setTimer] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [fps, setFps] = useState(0);
  const [blinkCount, setBlicksCount] = useState(0);
  const [type, setType] = useState(Camera.Constants.Type.front);

  const openEyeSleep = 0.9;
  const openEyeSleepSeconds = 0.5;

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  useEffect(() => {
    if (seconds > 0) setFps((timer / seconds).toFixed(2));
  }, [seconds]);

  useEffect(() => {
    const counter = setInterval(() => {
      setSeconds((seconds) => seconds + 1);
    }, 1000);
    return () => clearInterval(counter);
  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const initCountDown = () => {
    setCountDownStarted(true);
    if (countDownSeconds === 0) {
      setCountDownSeconds(timer);
    } else if (timer - countDownSeconds >= openEyeSleepSeconds * fps) {
      setSleepDetected(true);
    }
  };

  const cancelCountDown = () => {
    setCountDownStarted(false);
    setSleepDetected(false);
    setCountDownSeconds(0);
  };

  const handleFacesDetected = (props) => {
    setTimer((timer) => timer + 1);
    if (props?.faces?.length > 0) {
      setFaceDetected(true);
      const face = props.faces[0];
      setLeftEyeOpenProbability(face?.leftEyeOpenProbability);
      setRightEyeOpenProbabilityy(face?.rightEyeOpenProbability);
      if (
        face?.leftEyeOpenProbability <= openEyeSleep ||
        face?.rightEyeOpenProbability <= openEyeSleep
      ) {
        if (!countDownStarted) setBlicksCount((blicksCount) => blicksCount + 1);
        if (!sleepDetected) initCountDown();
      } else {
        cancelCountDown();
      }
    } else {
      setFaceDetected(false);
      cancelCountDown();
    }
  };

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={type}
        autoFocus
        ratio={"16:9"}
        onFacesDetected={handleFacesDetected}
        faceDetectorSettings={{
          mode: FaceDetector.Constants.Mode.fast,
          detectLandmarks: FaceDetector.Constants.Landmarks.none,
          runClassifications: FaceDetector.Constants.Classifications.all,
          minDetectionInterval: 100,
          tracking: true,
        }}
      >
        <View style={styles.faceBox}>
          <View
            style={[
              styles.faceDetectedBox,
              (sleepDetected && { backgroundColor: "red" }) ||
                (faceDetected && { backgroundColor: "green" }),
            ]}
          >
            <Text style={styles.text}>
              {!faceDetected
                ? "Face not detected"
                : sleepDetected
                ? "Sleep detected"
                : "Face detected"}
            </Text>
          </View>
          {config && (
            <View style={styles.faceInfoBox}>
              <Text style={styles.textInfo}>{`Sec(s): ${seconds}`}</Text>
              <Text style={styles.textInfo}>{`Frames: ${timer}`}</Text>
              <Text style={styles.textInfo}>{`FPS: ${fps}`}</Text>
              <Text style={styles.textInfo}>{`Blinks: ${blinkCount}`}</Text>
              <Text style={styles.textInfo}>{`count down sec: ${
                countDownSeconds > 0
                  ? ((timer - countDownSeconds) / fps).toFixed(0)
                  : 0
              }`}</Text>
              {faceDetected && (
                <>
                  <Text
                    style={[
                      styles.textInfo,
                      leftEyeOpenProbability < openEyeSleep && { color: "red" },
                    ]}
                  >
                    {`Right open prob: ${(
                      leftEyeOpenProbability * 100
                    )?.toFixed(2)}%`}
                  </Text>
                  <Text
                    style={[
                      styles.textInfo,
                      rightEyeOpenProbability < openEyeSleep && {
                        color: "red",
                      },
                    ]}
                  >
                    {`Left open prob: ${(
                      rightEyeOpenProbability * 100
                    )?.toFixed(2)}%`}
                  </Text>
                </>
              )}
            </View>
          )}
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setType(
                type === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back
              );
            }}
          >
            <Text style={styles.text}> Flip </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setConfig(!config)}
          >
            <Text style={styles.text}> Config </Text>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 20,
  },
  button: {
    flex: 0.3,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  faceBox: {
    marginTop: 25,
    position: "absolute",
    width: "100%",
    height: 180,
    left: 0,
    right: 0,
  },
  faceDetectedBox: {
    backgroundColor: "black",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 30,
  },
  faceInfoBox: {
    marginTop: 10,
    paddingHorizontal: 10,
  },
  textInfo: {
    fontSize: 14,
    textAlign: "left",
    color: "white",
  },
  text: {
    fontSize: 20,
    textAlign: "center",
    color: "white",
  },
});
