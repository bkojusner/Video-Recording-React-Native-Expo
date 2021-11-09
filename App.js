import React, { useState, useEffect } from 'react';
import { StyleSheet ,Text, View, Button, Image} from 'react-native';
import { Camera } from 'expo-camera';
import { Video } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';

socket = new WebSocket('wss://tmpherokutest.herokuapp.com');

//import io from 'socket.io-client'
export function connect() {
  socket.onopen = () => { 
    socket.send("Hello");
    alert("Sent Hello");
  };

  // Combine stop and start rec into one
  socket.onmessage = (s) => {      
      alert('Got Reply '+ s.data);
      if (s.data == "StartRec") {
        alert('Recording');
        App.takeVideo();
      }
      if (s.data == "StopRec") {
        App.stopVideo();
        alert('Stopped Recording');
      } 
  };
}

export default function App() {
  const [hasAudioPermission, setHasAudioPermission] = useState(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [camera, setCamera] = useState(null);
  const [record, setRecord] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const video = React.useRef(null);
  const [status, setStatus] = React.useState({});

  connect()

  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');

      const audioStatus = await Camera.requestMicrophonePermissionsAsync();
      setHasAudioPermission(audioStatus.status === 'granted');

    })();
  }, []);

  const takeVideo = async () => {
    if(camera){
        const data = await camera.recordAsync({
          maxDuration:10
        })
        setRecord(data.uri);
        console.log(data.uri);
        saveVideo(data.uri);
    }
  }

  const stopVideo = async () => {
    camera.stopRecording();
  }

  const saveVideo = async (vid) => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status === "granted") {
      const asset = await MediaLibrary.createAssetAsync(vid);
      await MediaLibrary.createAlbumAsync("Download", asset, false);
    } else alert("We need you permission to download this file.");
  }

  if (hasCameraPermission === null || hasAudioPermission === null ) {
    return <View />;
  }
  if (hasCameraPermission === false || hasAudioPermission === false) {
    return <Text>No access to camera</Text>;
  }
  return (
    <View style={{ flex: 1}}>
        <View style={styles.cameraContainer}>
            <Camera 
            ref={ref => setCamera(ref)}
            style={styles.fixedRatio} 
            type={type}
            ratio={'4:3'} 
            height={100} />
        </View>
        <Video
          ref={video}
          style={styles.video}
          source={{
            uri: record,
          }}
          useNativeControls
          resizeMode="contain"
          isLooping
          onPlaybackStatusUpdate={status => setStatus(() => status)}
        />
        <View style={styles.buttons}>
          <Button
            title={status.isPlaying ? 'Pause' : 'Play'}
            onPress={() =>
              status.isPlaying ? video.current.pauseAsync() : video.current.playAsync()
            }
          />
        </View>
        <Button
            title="Flip Video"
            onPress={() => {
              setType(
                type === Camera.Constants.Type.back ? Camera.Constants.Type.front : Camera.Constants.Type.back
              );
            }}>
        </Button>
        <Button title="Take video" onPress={() => takeVideo()} />
        <Button title="Stop Video" onPress={() => stopVideo()} />
    </View>
  );
}

const styles = StyleSheet.create({
  cameraContainer: {
      flex: 1,
      flexDirection: 'row'
  },
  fixedRatio:{
      flex: 1,
      aspectRatio: 1
  },
  video: {
    alignSelf: 'center',
    width: 350,
    height: 220,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
})
