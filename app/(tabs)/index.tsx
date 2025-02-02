import {
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
import { useState } from "react";
import { Image } from "react-native";
import { Audio } from "expo-av";
import * as DocumentPicker from "expo-document-picker";

export default function HomeScreen() {
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
    console.log(allRecordings);
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
        if (playingSoundIndex !== null && playingSoundIndex !== soundIndex) {
          await loadedSounds[playingSoundIndex].sound.stopAsync();
        }
        await sound.sound.playAsync();
        setPlayingSoundIndex(soundIndex);
      }
    } catch (error) {
      console.log("Error toggling playback:", error);
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
  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1 bg-[#FFF]">
        <View className="flex flex-col items-center">
          <Image
            source={require("../../assets/images/logo.png")}
            className="w-40 h-40"
          />
        </View>
        <View className="flex flex-wrap justify-center gap-3 mt-6">
          <View className="flex-row justify-center gap-3">
            <View className="bg-white w-44 h-44 flex items-center justify-center rounded-2xl shadow-xl shadow-black android:elevation-10">
              <TouchableOpacity className="w-32 h-32 bg-black border-4 border-white rounded-full flex items-center justify-center shadow-xl shadow-black android:elevation-20">
                <PhotoIcon size={40} color="white" />
              </TouchableOpacity>
            </View>

            <View className="bg-white w-44 h-44 flex items-center justify-center rounded-2xl shadow-xl shadow-black android:elevation-10">
              <TouchableOpacity
                onPress={() => {
                  setUploadAudio(false);
                  setAudioInput(!audioInput);
                }}
                className="w-32 h-32 bg-black border-4 border-white rounded-full flex items-center justify-center shadow-xl shadow-black android:elevation-20"
              >
                <MicrophoneIcon size={40} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row justify-center gap-3">
            <View className="bg-white w-44 h-44 flex items-center justify-center rounded-2xl shadow-xl shadow-black android:elevation-10">
              <TouchableOpacity className="w-32 h-32 bg-black border-4 border-white rounded-full flex items-center justify-center shadow-xl shadow-black android:elevation-20">
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

        <View className="flex justify-center mt-16">
          {textInput && (
            <View className="flex items-center">
              <Text className="text-black text-xl font-bold">
                Enter your text
              </Text>
              <TextInput
                className="w-[80%] h-auto bg-gray-500 text-white text-lg border-2 border-black rounded-xl mt-4"
                placeholder="Type your text here"
                placeholderTextColor="lightgray"
                multiline={true}
              />
              <TouchableOpacity className="w-auto h-10 bg-black border rounded-lg flex items-center justify-center mt-6 mb-4 p-2">
                <Text className="text-white font-bold">Submit</Text>
              </TouchableOpacity>
            </View>
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
                    onPress={() => setAudioInput(false)}
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
                        <TouchableOpacity>
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
                                onPress={() => setUploadAudio(false)}
                              >
                                <TrashIcon size={20} color="white" />
                                <Text className="text-white text-base font-bold">
                                  Delete
                                </Text>
                              </TouchableOpacity>
                              <TouchableOpacity className="w-24 bg-black flex-row items-center gap-1 p-2 rounded-lg">
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
