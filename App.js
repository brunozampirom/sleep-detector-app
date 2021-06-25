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
// import AreaMarker from "./components/AreaMarker";
import FaceAreaMarker from "./components/FaceAreaMarker";
import { Audio } from "expo-av";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";

const alarm = require("./assets/audio/alarm-clock.mp3");

export default function App() {
  const [hasPermission, setHasPermission] = useState(null); // Permission to access camera
  const [faceDetected, setFaceDetected] = useState(false); // Is face detected
  const [config, setConfig] = useState(true); // show information on screen
  const [leftEyeOpenProbability, setLeftEyeOpenProbability] = useState(0); // probability of left eye open
  const [rightEyeOpenProbability, setRightEyeOpenProbabilityy] = useState(0); // probability of right eye open
  const [numbnessDetected, seNumbnessDetected] = useState(false); // Numbness Detected
  const [sleepDetected, setSleepDetected] = useState(false); // sleep Detected
  const [countDownStarted, setCountDownStarted] = useState(false); // count down numbness flag
  const [countDownSeconds, setCountDownSeconds] = useState(0); // count down numbness timer
  const [timer, setTimer] = useState(0); // num of times when handleFacesDetected function call
  const [seconds, setSeconds] = useState(0); // second timer
  const [fps, setFps] = useState(0); // timer / seconds
  const [blinkCount, setBlinksCount] = useState(0); // blink counter
  const [lastBlink, setLastBlink] = useState(0); // last blink detected
  const [blinkInterval, setBlinkInterval] = useState(0); // interval between two blink
  const [blinkDuration, setBlinkDuration] = useState(0); // interval between two blink
  const [blinkDurationCount, setBlinkDurationCount] = useState(0); // interval between two blink
  const [longBlinkDuration, setLongBlinkDuration] = useState(false);
  const [blinkDurationStart, setBlinkDurationStart] = useState(0);
  const [intervalFrequency, setIntervalFrequency] = useState(0); // frequency of blink interval less then blinkIntervalBelowAcceptable
  const [shortBlinkInterval, setShortBlinkInterval] = useState(false);
  const [type, setType] = useState(Camera.Constants.Type.front); // type of camera (front or back)
  const [sound, setSound] = useState(undefined); // alert sound
  const [faceProps, setFaceProps] = useState(); // face measures
  const [faceSizeBigger, setFaceSizeBig] = useState(false); // if face size is bigger than limit
  const [faceSizeSmaller, setFaceSizeSmaller] = useState(false); // if face size is smaller than limit

  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  const openEyeSleep = 0.9;
  const openEyeSleepSeconds = 1.5;
  const blinkIntervalBelowAcceptable = 3;
  const blinkDurationAboveAcceptable = 0.2;
  const faceUpperSizeLimit = Dimensions.get("window").width * 0.85;
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

  const removeInfoOnStorage = async (key) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      alert("There was an error removing informations.");
    }

    alert("Done.");
  };

  const saveInfoOnStorage = async (key, value) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
      alert("There was an error saving informations.");
    }
  };

  const getInfoFromStorage = async (key) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      alert("There was an error when recover informations.");
    }
  };

  const pushAndSave = async (key, value) => {
    const valueList = (await getInfoFromStorage(key)) ?? [];
    if (valueList.length >= 50) {
      valueList.pop();
    }
    valueList.push(value);
    saveInfoOnStorage(key, valueList);
    console.log(key, valueList);
  };

  const saveInfoDateTime = async (key, value) => {
    const timestamp = moment();
    const valueObject = value ? { value, timestamp } : { timestamp };
    pushAndSave(key, valueObject);
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
    // When short blink interval is detected
    if (intervalFrequency > 5) {
      if (!shortBlinkInterval) saveInfoDateTime("ShortBlinkInterval");
      setShortBlinkInterval(true);
    } else {
      setShortBlinkInterval(false);
    }
    // When long blink duration is detected
    if (blinkDurationCount > 5) {
      if (!longBlinkDuration) saveInfoDateTime("LongBlinkDuration");
      setLongBlinkDuration(true);
    } else {
      setLongBlinkDuration(false);
    }
    //When short blink interval and long blink duration is detected
    if (intervalFrequency > 5 && blinkDurationCount > 5) {
      if (!sleepDetected) saveInfoDateTime("Sleep");
      setSleepDetected(true);
    } else {
      setSleepDetected(false);
    }
  }, [intervalFrequency, blinkDurationCount]);

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
      setCountDownSeconds(seconds);
    } else if (seconds > countDownSeconds + openEyeSleepSeconds) {
      playSound();
      seNumbnessDetected(true);
      saveInfoDateTime("Numbness");
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
    if (props?.faces?.length > 0 && onAreaMarked(props?.faces[0]?.bounds)) {
      if (verifyFaceSize(props?.faces[0]?.bounds)) {
        setFaceDetected(true);
        const face = props.faces[0];
        // console.log(face);
        // verifyMonth(face);
        setLeftEyeOpenProbability(face?.leftEyeOpenProbability);
        setRightEyeOpenProbabilityy(face?.rightEyeOpenProbability);
        if (
          face?.leftEyeOpenProbability <= openEyeSleep &&
          face?.rightEyeOpenProbability <= openEyeSleep
        ) {
          if (!countDownStarted) {
            setBlinkDurationStart(seconds);
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
          if (countDownStarted) {
            const blinkDur = seconds - blinkDurationStart;
            setBlinkDuration(blinkDur);
            saveInfoDateTime("Blink", blinkDur);
            if (blinkDur > blinkDurationAboveAcceptable) {
              setBlinkDurationCount(
                (blinkDurationCount) => blinkDurationCount + 1
              );
            } else {
              setBlinkDurationCount(0);
            }
          }
          cancelCountDown();
        }
      } else {
        setFaceDetected(false);
        cancelCountDown();
      }
    } else {
      setFaceDetected(false);
      setFaceProps();
      setFaceSizeSmaller(false);
      setFaceSizeBig(false);
    }
  };

  const getStatusColor = () => {
    if (!faceDetected) {
      return "#000000";
    }
    if (numbnessDetected) {
      return "#FF0000";
    }
    if (sleepDetected) {
      return "#FF6402";
    }
    if (shortBlinkInterval || longBlinkDuration) {
      return "#D9B51D";
    }
    if (faceDetected) {
      return "#039903";
    }
  };

  const getStatusText = () => {
    if (faceSizeBigger) return "move away from the camera";
    if (faceSizeSmaller) return "approach the camera";
    if (!faceDetected) return "Face not detected";
    if (numbnessDetected) return "Numbness";
    if (sleepDetected) return "Sleep";
    if (longBlinkDuration) return "Long blink duration";
    if (shortBlinkInterval) return "Short blink interval";
    return "Awake";
  };

  return (
    <View style={{ ...styles.container }}>
      <StatusBar style="inverted" backgroundColor={"black"} />
      <Camera
        ratio={"16:9"}
        style={styles.camera}
        type={type}
        autoFocus
        useCamera2Api
        faceDetectorEnabled
        onFacesDetected={handleFacesDetected}
        faceDetectorSettings={{
          mode: FaceDetector.Constants.Mode.fast,
          detectLandmarks: FaceDetector.Constants.Landmarks.none,
          runClassifications: FaceDetector.Constants.Classifications.all,
          tracking: true,
        }}
      >
        <View style={[styles.statusBox, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.text}>{getStatusText()}</Text>
        </View>
        {config && (
          <View style={styles.faceInfoBox}>
            <Text style={styles.textInfo}>{`Sec(s): ${seconds.toFixed(
              1
            )}`}</Text>
            <Text style={styles.textInfo}>{`Frames: ${timer}`}</Text>
            <Text style={styles.textInfo}>{`Func called per sec: ${fps}`}</Text>
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
            <Text
              style={styles.textInfo}
            >{`last blink duration: ${blinkDuration.toFixed(3)}`}</Text>
            <Text
              style={styles.textInfo}
            >{`last blink duration count: ${blinkDurationCount}`}</Text>
            {faceDetected && (
              <>
                <Text
                  style={[
                    styles.textInfo,
                    leftEyeOpenProbability < openEyeSleep && { color: "red" },
                  ]}
                >
                  {`Right open prob: ${(leftEyeOpenProbability * 100)?.toFixed(
                    2
                  )}%`}
                </Text>
                <Text
                  style={[
                    styles.textInfo,
                    rightEyeOpenProbability < openEyeSleep && {
                      color: "red",
                    },
                  ]}
                >
                  {`Left open prob: ${(rightEyeOpenProbability * 100)?.toFixed(
                    2
                  )}%`}
                </Text>
              </>
            )}
          </View>
        )}
        <FaceAreaMarker faceProps={faceProps} />
        {/* <AreaMarker faceOnArea={faceDetected} /> */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setConfig(!config)}
          >
            <MaterialIcons
              style={styles.icon}
              name="settings"
              size={40}
              color="white"
            />
          </TouchableOpacity>
          <View style={styles.icon} opacity={sleepDetected ? 1 : 0}>
            <Text
              style={{ color: "white", width: 150, textAlign: "center" }}
              numberOfLines={2}
            >
              It's recommended to stop driving
            </Text>
          </View>
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
            <MaterialIcons
              style={styles.icon}
              name="flip-camera-android"
              size={40}
              color="white"
            />
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    paddingTop: Constants.statusBarHeight,
  },
  camera: {
    borderRadius: 30,
    flex: 1,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  button: {
    flex: 0.3,
    alignItems: "center",
  },
  icon: {
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 50,
  },
  statusBox: {
    backgroundColor: "black",
    position: "absolute",
    width: "65%",
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 40,
    top: 25,
    borderRadius: 20,
  },
  faceInfoBox: {
    marginTop: 80,
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
