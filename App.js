import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Camera } from "expo-camera";
import * as FaceDetector from "expo-face-detector";
import AreaMarker from "./components/AreaMarker";
import { Audio } from "expo-av";
import { StatusBar } from "expo-status-bar";

const alarm = require("./assets/audio/alarm-clock.mp3");

export default function App() {
  const [camera, setCamera] = useState(null);
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
  const [sound, setSound] = useState(undefined);
  const openEyeSleep = 0.9;
  const openEyeSleepSeconds = 0.5;

  const stopSound = async () => {
    if (sound) await sound.stopAsync();
  };

  const playSound = async () => {
    console.log("Loading Sound");
    if (sound === undefined) {
      const { sound } = await Audio.Sound.createAsync(alarm);
      setSound(sound);
      sound.setIsLoopingAsync(true);
      await sound.playAsync();
    } else await sound.replayAsync();
  };

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
      playSound();
    }
  };

  const cancelCountDown = () => {
    setCountDownStarted(false);
    setSleepDetected(false);
    setCountDownSeconds(0);
    stopSound();
  };

  const onAreaMarked = (bounds) => {
    const origin = bounds?.origin;
    const size = bounds?.size;
    const left = origin.x;
    const right = origin.x + size.width;
    const top = origin.y;
    const bottom = origin.y + size.height;
    // console.log(
    //   `left: ${left.toFixed(2)} / right: ${right.toFixed(2)}\n
    //   top: ${top.toFixed(2)} / bottom: ${bottom.toFixed(2)}`
    // );
    return left > 10 && top > 250 && right < 400 && bottom < 650;
  };

  const handleFacesDetected = (props) => {
    setTimer((timer) => timer + 1);
    if (props?.faces?.length > 0 && onAreaMarked(props.faces[0].bounds)) {
      setFaceDetected(true);
      const face = props.faces[0];
      // console.log(face);
      setLeftEyeOpenProbability(face?.leftEyeOpenProbability);
      setRightEyeOpenProbabilityy(face?.rightEyeOpenProbability);
      if (
        face?.leftEyeOpenProbability <= openEyeSleep &&
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

  // alert(`height: ${height}, width: ${width}`);
  return (
    <View style={{ ...styles.container }}>
      <StatusBar hidden style="inverted" backgroundColor={"black"} />
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
        ref={(ref) => {
          setCamera(ref);
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
        <AreaMarker faceOnArea={faceDetected} />
      </Camera>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  camera: {
    borderRadius: 30,
    flex: 1,
  },
  buttonContainer: {
    height: 55,
    backgroundColor: "transparent",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  button: {
    flex: 0.3,
    alignItems: "center",
  },
  faceBox: {
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
    opacity: 0.8,
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
    fontSize: 17,
    textAlign: "center",
    color: "white",
  },
});
