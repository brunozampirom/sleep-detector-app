import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  AppState,
  Dimensions,
} from "react-native";
import { Camera } from "expo-camera";
import * as FaceDetector from "expo-face-detector";
import AreaMarker from "./components/AreaMarker";
import FaceAreaMarker from "./components/FaceAreaMarker";
import { Audio } from "expo-av";
import { StatusBar } from "expo-status-bar";

const alarm = require("./assets/audio/alarm-clock.mp3");

export default function App() {
  const [hasPermission, setHasPermission] = useState(null); // Permission to access camera
  const [faceDetected, setFaceDetected] = useState(false); // Is face detected
  const [config, setConfig] = useState(true); // show information on screen
  const [leftEyeOpenProbability, setLeftEyeOpenProbability] = useState(0); // probability of left eye open
  const [rightEyeOpenProbability, setRightEyeOpenProbabilityy] = useState(0); // probability of right eye open
  const [numbnessDetected, seNumbnessDetected] = useState(false); // Numbness Detected
  const [countDownStarted, setCountDownStarted] = useState(false); // count down numbness flag
  const [countDownSeconds, setCountDownSeconds] = useState(0); // count down numbness timer
  const [timer, setTimer] = useState(0); // num of times when handleFacesDetected function call
  const [seconds, setSeconds] = useState(0); // second timer
  const [fps, setFps] = useState(0); // timer / seconds
  const [blinkCount, setBlinksCount] = useState(0); // blink counter
  const [lastBlink, setLastBlink] = useState(0); // last blink detected
  const [blinkInterval, setBlinkInterval] = useState(0); // interval between two blink
  const [intervalFrequency, setIntervalFrequency] = useState(0); // frequency of blink interval less then blinkIntervalBelowAcceptable
  const [type, setType] = useState(Camera.Constants.Type.front); // type of camera (front or back)
  const [sound, setSound] = useState(undefined); // alert sound
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const [faceProps, setFaceProps] = useState(); // face measures
  const [mouthDiff, setMouthDiff] = useState(); // pixel difference between mouth and chin
  const [mouthOpen, setMouthOpen] = useState(false); // is month open
  const [whenMouthOpen, setWhenMouthOpen] = useState(0); // mark time when mouth open
  const [yawn, setYawn] = useState(false); // is yawn
  const [numberOfYawns, setNumberOfYawns] = useState([]); // list of yawns
  const [faceSizeBigger, setFaceSizeBig] = useState(false); // if face size is bigger than limit
  const [faceSizeSmaller, setFaceSizeSmaller] = useState(false); // if face size is smaller than limit

  const openEyeSleep = 0.9;
  const openEyeSleepSeconds = 0.5;
  const blinkIntervalBelowAcceptable = 3;
  const faceUpperSizeLimit = Dimensions.get("window").width * 0.8;
  const faceLowerSizeLimit = Dimensions.get("window").width * 0.4;

  useEffect(() => {
    AppState.addEventListener("change", _handleAppStateChange);

    return () => {
      AppState.removeEventListener("change", _handleAppStateChange);
    };
  }, []);

  const _handleAppStateChange = (nextAppState) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      alert("App has come to the foreground!");
    }

    appState.current = nextAppState;
    setAppStateVisible(appState.current);
  };

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
      setSeconds((seconds) => seconds + 0.1);
    }, 100);
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
      playSound();
      seNumbnessDetected(true);
    }
  };

  const cancelCountDown = () => {
    setCountDownStarted(false);
    seNumbnessDetected(false);
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
    setFaceProps({
      height: size.height,
      width: size.width,
      left,
      right,
      top,
      bottom,
    });
    // return (
    //   left > (Dimensions.get("window").width - 300) / 2 &&
    //   top > (Dimensions.get("window").height - 450) / 2 &&
    //   right < Dimensions.get("window").width / 2 + 300 / 2 &&
    //   bottom < Dimensions.get("window").height / 2 + 450 / 2
    // );
    return true;
  };

  const verifyMonth = (face) => {
    const bottom = face?.bounds?.origin?.y + face?.bounds?.size?.height;
    if (!mouthDiff)
      setMouthDiff(
        (bottom - face.bottomMouthPosition.y) / face?.bounds?.size?.width - 0.03
      );
    else if (
      mouthDiff >=
      (bottom - face.bottomMouthPosition.y) / face?.bounds?.size?.width
    ) {
      setMouthOpen(true);
      if (whenMouthOpen === 0) setWhenMouthOpen(seconds);
      else if (!yawn && seconds > whenMouthOpen + 1) {
        setYawn(true);
        setNumberOfYawns((oldArray) => [...oldArray, seconds]);
      }
    } else {
      setMouthOpen(false);
      setYawn(false);
      setWhenMouthOpen(0);
    }
  };

  const verifyFaceSize = (bounds) => {
    const width = bounds?.size?.width;
    let isSizeOk = true;
    if (width >= faceUpperSizeLimit) {
      setFaceSizeBig(true);
      isSizeOk = false;
    } else setFaceSizeBig(false);
    if (width <= faceLowerSizeLimit) {
      setFaceSizeSmaller(true);
      isSizeOk = false;
    } else setFaceSizeSmaller(false);
    return isSizeOk;
  };

  const handleFacesDetected = (props) => {
    setTimer((timer) => timer + 1);
    if (
      props?.faces?.length > 0 &&
      verifyFaceSize(props?.faces[0]?.bounds) &&
      onAreaMarked(props?.faces[0]?.bounds)
    ) {
      setFaceDetected(true);
      const face = props.faces[0];
      // console.log(face);
      verifyMonth(face);
      setLeftEyeOpenProbability(face?.leftEyeOpenProbability);
      setRightEyeOpenProbabilityy(face?.rightEyeOpenProbability);
      if (
        face?.leftEyeOpenProbability <= openEyeSleep &&
        face?.rightEyeOpenProbability <= openEyeSleep
      ) {
        if (!countDownStarted) {
          setBlinksCount((blicksCount) => blicksCount + 1);
          if (lastBlink > 0) {
            const thisBlinkInterval = seconds - lastBlink;
            setBlinkInterval(thisBlinkInterval);
            if (thisBlinkInterval < blinkIntervalBelowAcceptable) {
              setIntervalFrequency(
                (intervalFrequency) => intervalFrequency + 1
              );
            } else setIntervalFrequency(0);
          }
          setLastBlink(seconds);
        }
        if (!numbnessDetected) initCountDown();
      } else {
        cancelCountDown();
      }
    } else {
      setFaceProps();
      setFaceDetected(false);
      cancelCountDown();
    }
  };

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
          detectLandmarks: FaceDetector.Constants.Landmarks.all,
          runClassifications: FaceDetector.Constants.Classifications.all,
          minDetectionInterval: 100,
          tracking: true,
        }}
      >
        <View style={styles.faceBox}>
          <View
            style={[
              styles.faceDetectedBox,
              (numbnessDetected && !yawn && { backgroundColor: "red" }) ||
                (((faceDetected && intervalFrequency >= 4) || yawn) && {
                  backgroundColor: "#D9B51D",
                }) ||
                (faceDetected && { backgroundColor: "green" }),
            ]}
          >
            <Text style={styles.text}>
              {(faceSizeBigger && "move away from the camera please") ||
                (faceSizeSmaller && "approach the camera please") ||
                (!faceDetected && "Face not detected") ||
                (numbnessDetected && !yawn && "Numbness detected") ||
                (intervalFrequency >= 4 && "Sleep detected") ||
                (yawn && "Yawn detected") ||
                "Awake"}
            </Text>
          </View>
          {config && (
            <View style={styles.faceInfoBox}>
              <Text style={styles.textInfo}>{`Sec(s): ${seconds.toFixed(
                1
              )}`}</Text>
              <Text style={styles.textInfo}>{`Frames: ${timer}`}</Text>
              <Text style={styles.textInfo}>{`FPS: ${fps}`}</Text>
              <Text style={styles.textInfo}>{`Blinks: ${blinkCount}`}</Text>
              <Text
                style={styles.textInfo}
              >{`Blink interval: ${blinkInterval.toFixed(1)} sec`}</Text>
              <Text
                style={styles.textInfo}
              >{`Low interval count: ${intervalFrequency}`}</Text>
              <Text style={styles.textInfo}>{`count down sec: ${
                countDownSeconds > 0
                  ? ((timer - countDownSeconds) / fps).toFixed(0)
                  : 0
              }`}</Text>
              <Text style={styles.textInfo}>{`mouthDiff: ${mouthDiff}`}</Text>
              <Text style={styles.textInfo}>{`mouth open: ${mouthOpen}`}</Text>
              <Text style={styles.textInfo}>{`yawn: ${yawn}`}</Text>
              <Text
                style={styles.textInfo}
              >{`number of yawns: ${numberOfYawns?.length}`}</Text>
              {Array.isArray(numberOfYawns) && numberOfYawns?.length > 0 && (
                <Text style={styles.textInfo}>{`last yawn: ${numberOfYawns[
                  numberOfYawns.length - 1
                ].toFixed(1)} sec`}</Text>
              )}
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
        <FaceAreaMarker faceProps={faceProps} />
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
    height: 40,
  },
  faceInfoBox: {
    marginTop: 10,
    paddingHorizontal: 10,
  },
  textInfo: {
    fontSize: 12,
    textAlign: "left",
    color: "white",
  },
  text: {
    fontSize: 17,
    textAlign: "center",
    color: "white",
  },
});
