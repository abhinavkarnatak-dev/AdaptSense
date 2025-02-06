import { StatusBar } from "react-native";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  MicrophoneIcon,
  PencilSquareIcon,
  PhotoIcon,
  Squares2X2Icon,
  XMarkIcon,
  ArrowUpTrayIcon,
  ArrowLeftIcon,
  StopCircleIcon,
  PlayCircleIcon,
  PauseCircleIcon,
  ArrowUpIcon,
  TrashIcon,
} from "react-native-heroicons/outline";
import { useEffect, useState } from "react";
import { Image } from "react-native";
import { Audio } from "expo-av";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";

export default function HomeScreen() {
  const [text, setText] = useState<string>("");
  const [textInput, setTextInput] = useState<boolean>(false);
  const [audioInput, setAudioInput] = useState<boolean>(false);
  const [recordAudio, setRecordAudio] = useState<boolean>(false);
  const [uploadAudio, setUploadAudio] = useState<boolean>(false);
  const [recording, setRecording] = useState<any>();
  const [recordings, setRecordings] = useState<any>([]);
  const [audioName, setAudioName] = useState<string>("");
  const [loadedSounds, setLoadedSounds] = useState<any>([]);
  const [playingSoundIndex, setPlayingSoundIndex] = useState<number | null>(
    null
  );
  const [playingRecordingIndex, setPlayingRecordingIndex] = useState<
    number | null
  >(null);
  const [showOutput, setShowOutput] = useState<boolean>(false);
  const [inputType, setInputType] = useState<string>("");
  const [outputType, setOutputType] = useState<string>("");
  const [textOutput, setTextOutput] = useState<string>("");
  const [brailleOutput, setBrailleOutput] = useState<string>("");
  const [signGif, setSignGif] = useState<string | null>(null);
  const [audioOutput, setAudioOutput] = useState<string>("");
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [outputSoundName, setOutputSoundName] = useState<string>("");

  async function loadAudioFile(uri: string) {
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: false }
    );
    return sound;
  }

  async function startRecording() {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(recording);
      }
    } catch (error) {}
  }
  async function stopRecording() {
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    let allRecordings = [...recordings];
    const { sound, status } = await recording.createNewLoadedSoundAsync();
    allRecordings.push({
      sound: sound,
      duration: getDuration(status.durationMillis),
      file: recording.getURI(),
    });
    setRecordings(allRecordings);
    setRecording(undefined);
  }
  function getDuration(milliseconds: number) {
    const minutes = milliseconds / 1000 / 60;
    const seconds = Math.round((minutes - Math.floor(minutes)) * 60);
    return seconds < 10
      ? `${Math.floor(minutes)}:0${seconds}`
      : `${Math.floor(minutes)}:${seconds}`;
  }
  function getRecordingLines() {
    return recordings.map((recordingLine: any, index: number) => {
      const isPlaying = playingRecordingIndex === index;
      return (
        <View
          key={index}
          className="relative flex-row items-center justify-between w-11/12 mb-10 border border-black p-2 rounded-lg"
        >
          <Text className="text-lg text-red-500 font-bold">
            Audio {index + 1} | {recordingLine.duration}
          </Text>
          <TouchableOpacity onPress={() => toggleRecordingPlayback(index)}>
            {isPlaying ? (
              <PauseCircleIcon size={40} color="red" />
            ) : (
              <PlayCircleIcon size={40} color="red" />
            )}
          </TouchableOpacity>
        </View>
      );
    });
  }

  function clearRecording() {
    setRecordings([]);
  }

  async function togglePlayback(soundIndex: number) {
    const sound = loadedSounds[soundIndex];
    if (!sound || !sound.sound) return;

    try {
      const status = await sound.sound.getStatusAsync();

      if (status.isPlaying) {
        await sound.sound.pauseAsync();
        setPlayingSoundIndex(null);
      } else {
        // if (playingSoundIndex !== null && playingSoundIndex !== soundIndex) {
        //   await loadedSounds[playingSoundIndex].sound.stopAsync();
        // }
        await sound.sound.playAsync();
        setPlayingSoundIndex(soundIndex);
      }
    } catch (error) {
      console.log("Error toggling playback:", error);
    }
  }

  async function clearPlayback(soundIndex: number) {
    const sound = loadedSounds[soundIndex];
    if (!sound || !sound.sound) return;

    try {
      await sound.sound.unloadAsync();
      setPlayingSoundIndex(null);
    } catch (error) {
      console.log("Error toggling playback:", error);
    }
  }
  async function deletePlayback(soundIndex: number) {
    const sound = loadedSounds[soundIndex];
    if (!sound || !sound.sound) return;

    try {
      const status = await sound.sound.getStatusAsync();

      if (status.isPlaying) {
        await sound.sound.stopAsync();
        setPlayingSoundIndex(null);
      } else {
        if (playingSoundIndex !== null && playingSoundIndex !== soundIndex) {
          await loadedSounds[playingSoundIndex].sound.stopAsync();
        }
        await sound.sound.stopAsync();
        setPlayingSoundIndex(soundIndex);
      }
    } catch (error) {
      console.log("Error deleting playback:", error);
    }
  }

  async function toggleRecordingPlayback(index: number) {
    const recording = recordings[index];

    if (!recording || !recording.sound) return;

    try {
      const status = await recording.sound.getStatusAsync();

      if (status.isPlaying) {
        await recording.sound.pauseAsync();
        setPlayingRecordingIndex(null);
      } else {
        if (playingSoundIndex !== null) {
          await loadedSounds[playingSoundIndex].sound.stopAsync();
        }

        if (playingRecordingIndex !== null && playingRecordingIndex !== index) {
          await recordings[playingRecordingIndex].sound.stopAsync();
        }

        await recording.sound.playAsync();
        setPlayingRecordingIndex(index);
      }

      setRecordAudio(true);
    } catch (error) {
      console.log("Error toggling playback:", error);
    }
  }
  async function pickAudio() {
    try {
      loadedSounds.forEach((sound: any) => {
        if (sound.sound !== undefined) {
          sound.sound.unloadAsync();
        }
      });

      const res = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
      });

      if (res && !res.canceled) {
        const selectedFileName = res.assets[0].name;
        console.log("Selected File Name:", selectedFileName);
        setAudioName(selectedFileName);
        setLoadedSounds([]);

        const loadedSound = await loadAudioFile(res.assets[0].uri);
        setLoadedSounds([
          {
            sound: loadedSound,
            uri: res.assets[0].uri,
          },
        ]);
      }
    } catch (err) {
      console.log("Error picking audio:", err);
    }
  }

  const convertAudio = async (uri: string) => {
    try {
      const fileName = "audio.m4a";
      const fileType = "audio/m4a";

      const formData = new FormData();
      formData.append("file", {
        uri: uri,
        name: fileName,
        type: fileType,
      } as any);

      console.log("FormData prepared:", formData);
      const response = await fetch(
        "https://adapt-sense-backend.onrender.com/speech_to_text/",
        {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setTextOutput(data.transcribed_text);
    } catch (err) {
      console.error("Error preparing audio file:", err);
    }
  };

  const textToBraille = async (text: string) => {
    try {
      const response = await fetch(
        "https://adapt-sense-backend.onrender.com/to_braille",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: text,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setBrailleOutput(data.braille);
    } catch (err) {
      console.error("Error preparing text for Braille:", err);
    }
  };


  const textToSign = async (text: string) => {
    try {
      const encodedText = encodeURIComponent(text);
      const url = `https://adapt-sense-backend.onrender.com/stream_sign_images?text=${encodedText}`;
      setSignGif(url);
    } catch (err) {
      console.error("Error converting text to sign:", err);
      return null;
    }
  };

  const textToSpeech = async (text: string) => {
    try {
      const response = await fetch(
        "https://adapt-sense-backend.onrender.com/text_to_speech",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const contentDisposition = response.headers.get("content-disposition");

      let fileName = "";
      if (contentDisposition) {
        const match = contentDisposition.split("=");
        if (match && match[1]) {
          fileName = match[1];
        }
      }
      setOutputSoundName(fileName);

      const audioBlob = await response.blob();

      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result.split(",")[1];
        const filePath = `${FileSystem.documentDirectory}audio.mp3`;
        await FileSystem.writeAsStringAsync(filePath, base64Audio, {
          encoding: FileSystem.EncodingType.Base64,
        });
        setAudioOutput(filePath);
        console.log(audioOutput);
      };
    } catch (err) {
      console.error("Error preparing text for speech:", err);
    }
  };

  const handleAudio = async () => {
    if (isPlaying && sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      if (sound) {
        await sound.playAsync();
        setIsPlaying(true);
      } else if (audioOutput) {
        const { sound: newSound } = await Audio.Sound.createAsync({
          uri: audioOutput,
        });
        setSound(newSound);
        await newSound.playAsync();
        setIsPlaying(true);
      }
    }
  };

  const clearAudio = async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
    }
  };
  useEffect(() => {
    if (textOutput.length > 0) {
      textToBraille(textOutput);
      textToSign(textOutput);
      textToSpeech(textOutput);
    }
  }, [textOutput]);

  return (
    <SafeAreaView className="flex-1">
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      <View className="flex-1 bg-[#FFF]">
        <View className="flex flex-col items-center">
          <Image
            source={require("../../assets/images/logo.png")}
            className="w-40 h-40"
          />
        </View>
        <View className="flex flex-wrap justify-center gap-3 mt-6">
          <View className="flex-row justify-center gap-3">
            <View className="bg-white w-44 h-44 flex items-center justify-center rounded-2xl shadow-xl shadow-black android:elevation-10">
              <TouchableOpacity
                className="w-32 h-32 bg-black border-4 border-white rounded-full flex items-center justify-center shadow-xl shadow-black android:elevation-20"
              >
                <PhotoIcon size={40} color="white" />
              </TouchableOpacity>
            </View>

            <View className="bg-white w-44 h-44 flex items-center justify-center rounded-2xl shadow-xl shadow-black android:elevation-10">
              <TouchableOpacity
                onPress={() => {
                  setUploadAudio(false);
                  setAudioInput(true);
                }}
                className="w-32 h-32 bg-black border-4 border-white rounded-full flex items-center justify-center shadow-xl shadow-black android:elevation-20"
              >
                <MicrophoneIcon size={40} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row justify-center gap-3">
            <View className="bg-white w-44 h-44 flex items-center justify-center rounded-2xl shadow-xl shadow-black android:elevation-10">
              <TouchableOpacity
                className="w-32 h-32 bg-black border-4 border-white rounded-full flex items-center justify-center shadow-xl shadow-black android:elevation-20"
              >
                <Squares2X2Icon size={40} color="white" />
              </TouchableOpacity>
            </View>

            <View className="bg-white w-44 h-44 flex items-center justify-center rounded-2xl shadow-xl shadow-black android:elevation-10">
              <TouchableOpacity
                onPress={() => setTextInput(!textInput)}
                className="w-32 h-32 bg-black border-4 border-white rounded-full flex items-center justify-center shadow-xl shadow-black android:elevation-20"
              >
                <PencilSquareIcon size={40} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {textInput && (
          <Modal
            transparent={true}
            onRequestClose={() => setTextInput(false)}
            animationType="fade"
          >
            <View className="flex-1 bg-black/50 items-center justify-center">
              <View className="w-4/5 h-96 bg-white p-10 rounded-2xl flex-col items-center shadow-xl shadow-black android:elevation-20 border-2 border-dotted">
                <TouchableOpacity
                  onPress={() => setTextInput(false)}
                  className="absolute top-3 right-3"
                >
                  <XMarkIcon size={30} color="black" />
                </TouchableOpacity>
                <Text className="text-black text-xl font-bold">
                  Enter your text
                </Text>
                <TextInput
                  className="w-full h-48 bg-gray-500 text-white text-lg border-2 border-black rounded-xl mt-4 p-2"
                  placeholder="Type your text here"
                  placeholderTextColor="lightgray"
                  multiline
                  value={text}
                  onChangeText={(text) => setText(text)}
                  style={{ textAlignVertical: "top" }}
                />
                <TouchableOpacity
                  disabled={text === ""}
                  onPress={() => {
                    setInputType("Text");
                    setTextInput(false);
                    setShowOutput(true);
                    setTextOutput(text);
                  }}
                  className={`w-24 h-10 border rounded-lg flex items-center justify-center mt-4 mb-4 p-2 ${
                    text === "" ? "bg-gray-400" : "bg-black"
                  }`}
                >
                  <View className="flex-row items-center gap-1 p-2">
                    <ArrowUpIcon size={20} color="white" />
                    <Text className="text-white font-bold">Submit</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

        {audioInput && (
          <Modal
            transparent={true}
            onRequestClose={() => setAudioInput(false)}
            animationType="fade"
          >
            <View className="flex-1 bg-black/50 items-center justify-center">
              <View className="w-4/5 h-2/5 bg-white p-10 rounded-2xl flex-col items-center justify-center shadow-xl shadow-black android:elevation-20 border-2 border-dotted">
                <TouchableOpacity
                  onPress={() => {
                    setLoadedSounds([]);
                    setAudioInput(false);
                  }}
                  className="absolute top-3 right-3"
                >
                  <XMarkIcon size={30} color="black" />
                </TouchableOpacity>
                {recordAudio || uploadAudio ? (
                  <TouchableOpacity
                    onPress={() => {
                      clearRecording();
                      setRecordAudio(false);
                      setUploadAudio(false);
                    }}
                    className="absolute top-4 left-4"
                  >
                    <ArrowLeftIcon size={20} color="black" />
                  </TouchableOpacity>
                ) : null}
                {getRecordingLines()}
                {!recordAudio && !uploadAudio ? (
                  <View className="items-center">
                    <TouchableOpacity
                      className="w-40 h-16 bg-black border rounded-lg flex-row items-center justify-center mt-6 mb-4 p-2"
                      onPress={() => setRecordAudio(true)}
                    >
                      <MicrophoneIcon size={20} color="white" />
                      <Text className="text-white font-bold ml-2">
                        Record Audio
                      </Text>
                    </TouchableOpacity>
                    <Text className="text-black text-xl font-bold">or</Text>
                    <TouchableOpacity
                      className="w-40 h-16 bg-black border rounded-lg flex-row items-center justify-center mt-6 mb-4 p-2"
                      onPress={() => {
                        pickAudio();
                        setUploadAudio(true);
                      }}
                    >
                      <ArrowUpTrayIcon size={20} color="white" />
                      <Text className="text-white font-bold ml-2">
                        Upload Audio
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : recordAudio && !uploadAudio ? (
                  <View>
                    <TouchableOpacity
                      onPress={recording ? stopRecording : startRecording}
                      className={recordings.length > 0 ? "hidden" : ""}
                    >
                      {recording ? (
                        <View className="flex-col items-center gap-2">
                          <StopCircleIcon size={40} color="red" />
                          <Text className="text-lg text-red-500 font-bold">
                            Stop
                          </Text>
                        </View>
                      ) : (
                        <View className="flex-col items-center gap-2">
                          <MicrophoneIcon size={40} color="red" />
                          <Text className="text-lg text-red-500 font-bold">
                            Start
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                    <View className="flex-col items-center gap-4">
                      <TouchableOpacity onPress={clearRecording}>
                        {recordings.length > 0 ? (
                          <View className="w-24 bg-black text-white flex-row items-center gap-1 p-2 rounded-lg">
                            <TrashIcon size={20} color="white" />
                            <Text className="text-white text-base font-bold">
                              Delete
                            </Text>
                          </View>
                        ) : null}
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setInputType("Audio");
                          setAudioInput(false);
                          setShowOutput(true);
                          convertAudio(recordings[0].file);
                        }}
                      >
                        {recordings.length > 0 ? (
                          <View className="w-24 bg-black text-white flex-row items-center gap-1 p-2 rounded-lg">
                            <ArrowUpIcon size={20} color="white" />
                            <Text className="text-white text-base font-bold">
                              Submit
                            </Text>
                          </View>
                        ) : null}
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  uploadAudio &&
                  !recordAudio && (
                    <View>
                      {loadedSounds.map((sound: any, index: number) => (
                        <View>
                          <View
                            key={index}
                            className=" flex-row h-28 items-center justify-between border border-black p-2 rounded-xl mt-4"
                          >
                            <ScrollView>
                              <Text className="w-2/3 text-red-500 text-lg font-bold">
                                {audioName}
                              </Text>
                            </ScrollView>

                            <TouchableOpacity
                              onPress={() => togglePlayback(index)}
                            >
                              {playingSoundIndex === index ? (
                                <PauseCircleIcon size={40} color="red" />
                              ) : (
                                <PlayCircleIcon size={40} color="red" />
                              )}
                            </TouchableOpacity>
                          </View>
                          <View className="flex-col items-center gap-4 mt-6">
                            <TouchableOpacity
                              className="w-24 bg-black flex-row items-center gap-1 p-2 rounded-lg"
                              onPress={() => {
                                deletePlayback(index);
                                setUploadAudio(false);
                              }}
                            >
                              <TrashIcon size={20} color="white" />
                              <Text className="text-white text-base font-bold">
                                Delete
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => {
                                setInputType("Audio");
                                setAudioInput(false);
                                setShowOutput(true);
                                convertAudio(loadedSounds[index].uri);
                                clearPlayback(index);
                              }}
                              className="w-24 bg-black flex-row items-center gap-1 p-2 rounded-lg"
                            >
                              <ArrowUpIcon size={20} color="white" />
                              <Text className="text-white text-base font-bold">
                                Submit
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                    </View>
                  )
                )}
              </View>
            </View>
          </Modal>
        )}


        {showOutput && (
          <Modal transparent={true} animationType="fade">
            <View className="flex-1 bg-black/50 items-center justify-center">
              <View className="w-10/12 h-3/5 bg-white p-10 rounded-2xl flex-col items-center shadow-xl shadow-black android:elevation-20 border-2 border-dotted">
                <TouchableOpacity
                  onPress={() => {
                    setShowOutput(false);
                    setInputType("");
                    setText("");
                    setTextOutput("");
                    setBrailleOutput("");
                    setOutputType("");
                    clearAudio();
                    setAudioOutput("");
                  }}
                  className="absolute top-3 right-3"
                >
                  <XMarkIcon size={30} color="black" />
                </TouchableOpacity>
                <Text className="text-black text-2xl font-bold">
                  Select the output type
                </Text>
                <View className="flex-row items-center justify-center gap-2 mt-3">
                  <TouchableOpacity
                    onPress={() => setOutputType("Text")}
                    className={`${
                      inputType === "Text"
                        ? "hidden"
                        : `w-16 border border-black p-1 rounded-lg ${
                            outputType === "Text" ? "bg-black" : ""
                          }`
                    }`}
                  >
                    <Text
                      className={`${
                        outputType === "Text" ? "text-white" : "text-black"
                      } text-lg font-bold text-center`}
                    >
                      Text
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setOutputType("Audio")}
                    className={`${
                      inputType === "Audio"
                        ? "hidden"
                        : `w-16 border border-black p-1 rounded-lg ${
                            outputType === "Audio" ? "bg-black" : ""
                          }`
                    }`}
                  >
                    <Text
                      className={`${
                        outputType === "Audio" ? "text-white" : "text-black"
                      } text-lg font-bold text-center`}
                    >
                      Audio
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setOutputType("Sign")}
                    className={`${
                      inputType === "Sign"
                        ? "hidden"
                        : `w-16 border border-black p-1 rounded-lg ${
                            outputType === "Sign" ? "bg-black" : ""
                          }`
                    }`}
                  >
                    <Text
                      className={`${
                        outputType === "Sign" ? "text-white" : "text-black"
                      } text-lg font-bold text-center`}
                    >
                      Sign
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setOutputType("Braille")}
                    className={`${
                      inputType === "Braille"
                        ? "hidden"
                        : `w-16 border border-black p-1 rounded-lg ${
                            outputType === "Braille" ? "bg-black" : ""
                          }`
                    }`}
                  >
                    <Text
                      className={`${
                        outputType === "Braille" ? "text-white" : "text-black"
                      } text-lg font-bold text-center`}
                    >
                      Braille
                    </Text>
                  </TouchableOpacity>
                </View>
                {outputType !== "" && (
                  <Text className="text-black text-xl font-bold mt-10">
                    {outputType} Output
                  </Text>
                )}

                {outputType === "Text" && (
                  <ScrollView className="border-2 rounded-xl w-full mt-2">
                    {textOutput.length > 0 ? (
                      <Text className="text-black text-lg text-center p-2">
                        {textOutput}
                      </Text>
                    ) : (
                      <View className="flex justify-center items-center space-x-2 mt-4">
                        <ActivityIndicator size="large" color="black" />
                      </View>
                    )}
                  </ScrollView>
                )}
                {outputType === "Sign" && (
                  <View className="border-2 rounded-xl w-full h-3/5 p-4 mt-2">
                    {signGif ? (
                      <Image
                        source={{ uri: signGif }}
                        className="w-full h-60 mt-4"
                        resizeMode="contain"
                      />
                    ) : (
                      <View className="flex justify-center items-center space-x-2">
                        <ActivityIndicator size="large" color="black" />
                      </View>
                    )}
                  </View>
                )}
                {outputType === "Braille" && (
                  <ScrollView className="border-2 rounded-xl w-full p-4 mt-2">
                    {brailleOutput.length > 0 ? (
                      <Text className="text-black text-lg text-center">
                        {brailleOutput}
                      </Text>
                    ) : (
                      <View className="flex justify-center items-center space-x-2">
                        <ActivityIndicator size="large" color="black" />
                      </View>
                    )}
                  </ScrollView>
                )}
                {outputType === "Audio" && (
                  <View className="w-full p-4 mt-2">
                    {audioOutput ? (
                      <View className="flex-row justify-center items-center border-2 rounded-xl p-2">
                        <Text>{outputSoundName}</Text>
                        <TouchableOpacity
                          onPress={handleAudio}
                          className="p-2 rounded-lg flex justify-center items-center"
                        >
                          {isPlaying ? (
                            <PauseCircleIcon size={30} color="red" />
                          ) : (
                            <PlayCircleIcon size={30} color="red" />
                          )}
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View className="flex justify-center items-center space-x-2">
                        <ActivityIndicator size="large" color="black" />
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>
          </Modal>
        )}
      </View>
    </SafeAreaView>
  );
}
