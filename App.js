import React, { Component } from 'react';
import {
  Text, View, Button, TextComponent, Image, Alert, SafeAreaView, ScrollView, Dimensions, TouchableOpacity,
  ImageBackground, Animated, TouchableWithoutFeedback
} from 'react-native';
import { StyleSheet } from 'react-native';
// import camera_shutter from './media/camera_shutter.png'
// Import Mapcomponent // 
import MapScreen from './MapComponent';

// Imoprt RT database, Storage from firebase //
import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import firebase from '@react-native-firebase/app';


// Import geofire for location services // 
import { initializeApp } from 'firebase'; // added for geofire support 
import geofire from 'geofire';

// Import new geolocation //
import Geolocation from 'react-native-geolocation-service';


// Adding Map view to the application// 
import MapView, { PROVIDER_GOOGLE, Marker, Callout, Circle } from 'react-native-maps';

// Adding camera support // 
import { RNCamera } from 'react-native-camera'

// Adding gesture - left & right  support //
import Swipeable from 'react-native-gesture-handler/Swipeable';

// Adding gesture - up & down  support //
// import SwipeUpDown from 'react-native-swipe-up-down';
import GestureRecognizer, { swipeDirections } from 'react-native-swipe-gestures';

// To save image to gallery //
import CameraRoll from "@react-native-community/cameraroll";

import Carousel from 'react-native-snap-carousel';

// Import fetch blob to transfer pictures taken // 
// import RNFetchBlob from 'rn-fetch-blob'

// Import progressbar animation 
import * as Progress from 'react-native-progress';

const windowHeight = Dimensions.get('window').height;
console.log(windowHeight);
const reference = storage().ref().child('images');
reference.listAll();
console.log(reference.listAll());

const url = storage()
  .ref('images/299.jpg')
  .getDownloadURL();
// let storageRef = storage.ref()
console.log(url._W);

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

let percentage = 0;
// // Prepare Blob support
// const Blob = RNFetchBlob.polyfill.Blob
// const fs = RNFetchBlob.fs
// window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
// window.Blob = Blob

class App extends Component {

  state = {
    count: 0,
    where: { lat: null, lng: null },
    mapScreen: true,
    cameraView: false,
    userPoint: true,
    cameraType: RNCamera.Constants.Type.front,
    img: null,
    takingPic: false,
    region: {
      latitude: 43.41058,
      longitude: 73.97794,
      latitudeDelta: 0.3,
      longitudeDelta: 0.3,
    },
    focusCoords: null,
    NearestLocation: null,
    uploadInprogress:false,
    // scrollHeight: 100,
  }

  lastTap = null;

  incrementCounter = () => {
    this.setState({ count: this.state.count + 1 }, () => {
      database().ref('/locations/').update({ count: this.state.count });
      console.log(this.state.count);
    });
  }

  // setScrollHeight = (width, height) => {
  //   this.setState({ scrollHeight: height })
  // }

  // Camera functions // 
  flipCamera = () => {
    console.log('Camera now flipped')
    this.setState({
      cameraType:
        this.state.cameraType === RNCamera.Constants.Type.back
          ? RNCamera.Constants.Type.front
          : RNCamera.Constants.Type.back,
    }, () => {
      console.log(this.state.cameraType);
    });
  }
  takePicture = async () => {
    console.log(this.state.cameraType);
    let that = this;
    let mirrorImage = this.state.cameraType === 1 ? false : true; // To mirror selfie's - 1: backCam, 2: frontCam
    let options = {
      quality: 0.01,
      fixOrientation: true,
      forceUpOrientation: true,
      base64: true,
      mirrorImage: mirrorImage,
    };

    this.setState({ takingPic: true });

    try {
      const data = await this.camera.takePictureAsync(options);
      const stringData = JSON.stringify(data);
      // Alert.alert('Success', JSON.stringify(data));
      //console.log(data);
      console.log(data);
      // console.log(stringData);
      // console.log(data.base64);
      //console.log(data.uri);
      this.setState({ img: data.uri });

    } catch (err) {
      Alert.alert('Error', 'Failed to take picture: ' + (err.message || err));
      return;
    } finally {
      this.setState({ takingPic: false });
    }

  };
  deletePicture = () => {
    this.setState({ img: null });
  }

  handleDoubleTap = () => {
    const now = Date.now();
    console.log(now);
    const DOUBLE_PRESS_DELAY = 500;
    if (this.lastTap && (now - this.lastTap) < DOUBLE_PRESS_DELAY) {
      this.flipCamera();
      this.lastTap = null;
    } else {
      this.lastTap = now;
    }
  }

  onTapToFocus = (touchOrigin) => {
    const { x, y } = touchOrigin;
    console.log(touchOrigin);
    console.log(x + "  " + y);

    const x0 = x / width;
    const y0 = y / height;

    console.log(x0 + "  " + y0);

    this.setState({
      focusCoords: {
        x: x0,
        y: y0
      }
    });

    if (this.focusTimeout) {
      clearTimeout(this.focusTimeout);
      this.focusTimeout = null;
    }

  }

  onSetFocus = () => {
    this.focusTimeout = setTimeout(() => {
      console.log('inside set focus')
    }, 1500);
  }

  renderCamera() {
    const config = {
      velocityThreshold: 0.4,
      directionalOffsetThreshold: 30,
      gestureIsClickThreshold: 5,
    };
    return (
      <GestureRecognizer
        config={config}
        onSwipeDown={() => this.ChangeScreen()}
      ><TouchableWithoutFeedback onPress={() => { this.handleDoubleTap() }}>
          <RNCamera
            style={styles.preview}
            // style={{ width: '90%', height: '30%', marginLeft: 5, backgroundColor: 'powderblue' }}
            useNativeZoom={true}
            autoFocusPointOfInterest={this.state.focusCoords}
            onTap={this.onTapToFocus}
            type={this.state.cameraType}
            // onDoubleTap={() => { this.flipCamera() }}
            // onPictureTaken={()=>this.picTaken()}
            ref={ref => {
              this.camera = ref
            }}
            >
            {this.state.uploadInprogress && <View>
              <Text style={{color:'white'}}>Uploading</Text>
              <Progress.Bar progress={percentage} color={'white'} width={width / 1.2} />
              </View>}
            <Button
              style={{ flex: 1 }}
              title="Flip camera"
              onPress={() => { this.flipCamera() }} />
            <TouchableOpacity style={styles.camera_shutter}
              onPress={() => { this.takePicture() }}>
              <Image
                source={require('./media/camera-shutter.png')}
                //  style={styles.camera_shutter_icon}
                style={{ width: 100, height: 100 }}
              />
            </TouchableOpacity>
            {/* <Button
            title="Snap"
            onPress={() => { this.takePicture() }}
          /> */}
          </RNCamera>
        </TouchableWithoutFeedback>
      </GestureRecognizer>

    )
  }

  // To render preview of the taken picture
  renderImage() {
    return (
      <View>
        <ImageBackground
          source={{ uri: this.state.img }}
          style={styles.preview}
        >
          <Button
            title='Retake'
            onPress={() => this.setState({ img: null })}
          />
          <Button
            title='Upload to db'
            onPress={() => this.uploadToDb()}
          />
          <Button
            title='Save to device'
            onPress={() => CameraRoll.save(this.state.img).then(
              this.setState({ img: null }, () => {
                Alert.alert('Photo saved to camera roll');
              })
            )}
          />
        </ImageBackground>

      </View>
    );
  }


  uploadToDb = () => {
    let that = this;
    let imgUri = this.state.img;
    this.setState({ uploadInprogress: true }, () => {
      this.setState({img:null});
      let nearestLocation = this.state.NearestLocation;
      console.log(imgUri, nearestLocation.locationName);
      // Create a root reference
      let storageRef = storage().ref('/VibePictures/' + nearestLocation.locationName + '/' + Date.now());
      let uploadTask = storageRef.putFile(imgUri);
      // Add a progress observer to an upload task
      uploadTask.on('state_changed', function (snapshot) {
        console.log(`${snapshot.bytesTransferred} transferred out of ${snapshot.totalBytes}`);
        percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('progress:' + percentage + '%');
      }, function (error) {
        // Handle unsuccessful uploads
        console.log('Upload was not successfull', error)
      }, function () {
        // Handle successful uploads on complete
        console.log('Image uploaded to the bucket!');
        that.setState({ uploadInprogress: false });
        uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
        console.log('File available at', downloadURL);
        database().ref('/locations/'+nearestLocation.locationName).push({url:downloadURL,});
        });
      });

    })

  }

  uploadImage = (mime = 'image/jpg') => {

    // return new Promise((resolve, reject) => {
    let imgUri = this.state.img;

    let uploadBlob = null;
    const uploadUri = imgUri.replace('file://', '');
    console.log(uploadUri);
    // const { currentUser } = firebase.auth();
    const imageRef = storage().ref('/images/')
    console.log(imageRef);

    fs.readFile(uploadUri, 'base64')
      .then(data => {
        // console.log(data);
        return Blob.build(data, { type: `${mime};BASE64` });
      })
      .then(blob => {
        uploadBlob = blob;
        console.log(uploadBlob);
        imageRef.put(blob, { contentType: mime });
      })
  }


  //  Swipable fuctions 

  ChangeScreen = (nearestLocation) => {
    if (nearestLocation) {
      console.log('Received from map compoenent', nearestLocation)
      this.setState({ NearestLocation: nearestLocation });
    }
    this.setState({ mapScreen: !this.state.mapScreen, cameraView: !this.state.cameraView });
  }

  render() {

    leftActions = (progress, dragX) => {
      const scale = dragX.interpolate({
        inputRange: [0, 100],
        outputRange: [0, 1],
        extrapolate: 'clamp'
      })
      return (
        <View style={styles.leftAction}>
          <Animated.Text style={[styles.swipeText, { transform: [{ scale }] }]}>
            Go to maps
          </Animated.Text>
          {/* <MapComponent
            ChangeScreen={()=>this.ChangeScreen()}
            /> */}
        </View>
      )
    }

    return (
      <View
      // style={{ height: windowHeight, alignItems: "center", flex: 1 }}
      >
        {/* <ScrollView
          style={{ flex: 1 }}
          scrollEnabled={true}> */}
        {this.state.mapScreen &&
          <View>
            <MapScreen
              ChangeScreen={this.ChangeScreen}
            />
          </View>}
        {/* <Swipeable
            renderLeftActions={leftActions}
            onSwipeableLeftOpen={()=>{this.ChangeScreen()}}> */}
        {this.state.cameraView &&
          <View>
            {this.state.img ? this.renderImage() : this.renderCamera()}
          </View>}
        {/* </Swipeable> */}

        {/* </ScrollView> */}
      </View>
    )
  }
  componentDidMount() {

    database().ref('/locations/').on('value', snapshot => {
      console.log(snapshot.val());
    })

  }
  // End of componentDidMount
}
// End of class


const styles = StyleSheet.create({
  container: {
    marginTop: 50,
  },
  preview: {
    // flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
  },
  mapScreen: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: Dimensions.get('window').height / 1.1,
    width: Dimensions.get('window').width,
  },
  optionsOnMapView: {
    position: 'absolute',
    bottom: 0,
  },
  userLocationButton: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'black',
    zIndex: 2,
  },
  leftAction: {
    backgroundColor: '#388e3c',
    justifyContent: 'center',
    flex: 1,
  },
  swipeText: {
    color: 'white',
    fontWeight: '700',
    padding: 20,
  },
  camera_shutter: {
    borderRadius: 100,
    overflow: 'hidden',
  },
  camera_shutter_icon: {
    width: 60,
    height: 60,
  },
  bigBlue: {
    color: 'blue',
    fontWeight: 'bold',
    fontSize: 30,
  },
  red: {
    color: 'red',
  },
});

export default App;
