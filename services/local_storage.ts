import AsyncStorage from "@react-native-async-storage/async-storage";

export const name_storage = "name";

export const getKey = async (key: string) => {
  return await AsyncStorage.getItem(key);
};

export const saveKey = async (key: string, value: string) => {
  return await AsyncStorage.setItem(key, value);
};
