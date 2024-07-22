import React, { useState } from 'react';
import { View, Text, Button, FlatList, Image, Alert, StyleSheet, ActivityIndicator, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage, ref, uploadBytes, list, deleteObject } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDQh-Zc7Ms8AAPlYKnldvOiqbkeTz-j3h4",
  authDomain: "aula-app-mobile.firebaseapp.com",
  projectId: "aula-app-mobile",
  storageBucket: "aula-app-mobile.appspot.com",
  messagingSenderId: "550853828525",
  appId: "1:550853828525:web:2c90d12b6056e5cb494b24"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const ImagePickerExample = () => {
  const [imageUri, setImageUri] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageList, setImageList] = useState([]);
  const [visible, setVisible] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.uri);
    }
  };

  const getRandom = (max) => {
    return Math.floor(Math.random() * max + 1);
  };

  const uploadImage = async () => {
    if (!imageUri) {
      Alert.alert('Selecione uma imagem antes de enviar.');
      return;
    }

    setUploading(true);
    try {
      const storage = getStorage();
      const name = getRandom(200);
      const imageRef = ref(storage, `${name}.jpg`);

      const response = await fetch(imageUri);
      const blob = await response.blob();

      await uploadBytes(imageRef, blob);
      Alert.alert('Imagem enviada com sucesso!');
      LinkImage();  
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
      Alert.alert('Erro ao enviar imagem');
    } finally {
      setUploading(false);
    }
  };

  const LinkImage = async () => {
    try {
      const storage = getStorage();
      const listRef = ref(storage);

      const firstPage = await list(listRef, { maxResults: 100 });
      const urls = await Promise.all(firstPage.items.map(async (item) => {
        const url = `https://firebasestorage.googleapis.com/v0/b/${item.bucket}/o/${encodeURIComponent(item.fullPath)}?alt=media`;
        return { uri: url, ref: item.fullPath };
      }));

      setImageList(urls);
      setVisible(true);
    } catch (error) {
      console.error('Erro ao listar imagens:', error);
      Alert.alert('Erro ao listar imagens');
    }
  };

  const deleteImage = async (imageRef) => {
    try {
      const storage = getStorage();
      const imageRefObj = ref(storage, imageRef);
      await deleteObject(imageRefObj);
      Alert.alert('Imagem excluída com sucesso!');
      LinkImage(); 
    } catch (error) {
      console.error('Erro ao excluir imagem:', error);
      Alert.alert('Erro ao excluir imagem');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.imageContainer}>
      <TouchableWithoutFeedback onPress={() => deleteImage(item.ref)}>
        <View style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>x</Text>
        </View>
      </TouchableWithoutFeedback>
      <Image source={{ uri: item.uri }} style={styles.image} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Button title="Escolher Imagem" onPress={pickImage} style={styles.button} />
      {imageUri && <Image source={{ uri: imageUri }} style={styles.previewImage} />}
      {uploading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.spinner} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={uploadImage} disabled={!imageUri}>
          <Text style={styles.buttonText}>Enviar Imagem</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.button} onPress={LinkImage}>
        <Text style={styles.buttonText}>Ver Imagens</Text>
      </TouchableOpacity>
      {visible && (
        <FlatList
          data={imageList}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          numColumns={3}
          contentContainerStyle={styles.imageList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  button: {
    margin: 10,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    width: '80%',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  previewImage: {
    width: 200,
    height: 200,
    marginVertical: 20,
    borderRadius: 10,
  },
  spinner: {
    marginVertical: 20,
  },
  imageList: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    margin: 5,
    padding: 5,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    position: 'relative',
  },
  image: {
    width: 100,
    height: 100,
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#FF0000',
    borderRadius: 15,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 15,
    bottom: 2
  },
});

export default ImagePickerExample;
