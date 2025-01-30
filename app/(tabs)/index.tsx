import {
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
} from "react-native-heroicons/outline";
import { useState } from "react";
import { Image } from "react-native";

export default function HomeScreen() {
  const [textInput, setTextInput] = useState<boolean>(false);
  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1 bg-[#FFF]">
        <View className="flex flex-col items-center">
          <Image
            source={require("../../assets/images/logo.png")}
            className="w-40 h-40"
          />
        </View>
        <View className="flex-row flex-wrap justify-center gap-3 mt-6">
          <View className="bg-white w-44 h-44 flex items-center justify-center rounded-2xl shadow-xl shadow-black android:elevation-10">
            <TouchableOpacity className="w-32 h-32 bg-black border-4 border-white rounded-full flex items-center justify-center shadow-xl shadow-black android:elevation-20">
              <PhotoIcon size={40} color="white" />
            </TouchableOpacity>
          </View>

          <View className="bg-white w-44 h-44 flex items-center justify-center rounded-2xl shadow-xl shadow-black android:elevation-10">
            <TouchableOpacity className="w-32 h-32 bg-black border-4 border-white rounded-full flex items-center justify-center shadow-xl shadow-black android:elevation-20">
              <MicrophoneIcon size={40} color="white" />
            </TouchableOpacity>
          </View>
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}