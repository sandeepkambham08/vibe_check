import React, { Component } from 'react';
import { Text, View, Button, TextComponent, Image, Alert } from 'react-native';
import { StyleSheet } from 'react-native';

// Imoprt RT database from firebase //
import database from '@react-native-firebase/database';

// Import geofire for location services // 
import { initializeApp } from 'firebase'; // added for geofire support 
import geofire from 'geofire';

// Import new geolocation //
import Geolocation from 'react-native-geolocation-service';


// Adding Map view to the application// 
import MapView, { PROVIDER_GOOGLE, Marker, Callout, Circle } from 'react-native-maps';

// Adding camera support // 
import { RNCamera } from 'react-native-camera'

class App extends Component {

  state = {
    count: 0,
    where: { lat: null, lng: null },
    locationFound: false,
    userPoint:false,
    cameraType:RNCamera.Constants.Type.front,
    region: {
      latitude: 43.41058,
      longitude: 73.97794,
      latitudeDelta: 30,
      longitudeDelta: 60,
    },
    

  }
  incrementCounter = () => {
    this.setState({ count: this.state.count + 1 }, () => {
      database().ref('/locations/').update({ count: this.state.count });
      console.log(this.state.count);
    });

  }
  showLocation = () => {
   this.setState({userPoint:!this.state.userPoint})
  }
  calculateDistance = (lat1, lat2, long1, long2) => {
    let p = 0.017453292519943295;    // Math.PI / 180
    let c = Math.cos;
    let a = 0.5 - c((lat1 - lat2) * p) / 2 + c(lat2 * p) * c((lat1) * p) * (1 - c(((long1 - long2) * p))) / 2;
    let dis = (12742 * Math.asin(Math.sqrt(a))); // 2 * R; R = 6371 km
    return dis;
  }
  onRegionChange(region) {
    // this.setState({
    //     region: region
    // });
    let distance = this.calculateDistance(region.latitude, this.state.region.latitude, region.longitude, this.state.region.longitude);

    if (distance > 0) {
      this.setState({ region: region });
    }
  }
  showSomeMessage=()=>{
    Alert.alert(
      'Do you want to upload a pic',
      'It helps others to feel the vibe',[
        {
          text:'no',
          style:'cancel'
        },
        {
          text:'Vibe'
        }
      ]
    )
  }

  // Camera functions // 
  flipCamera =()=>{
    console.log('Camera now flipped')
    this.setState({
      cameraType:
        this.state.cameraType === RNCamera.Constants.Type.back
          ? RNCamera.Constants.Type.front
          : RNCamera.Constants.Type.back,
    });
  }

  render() {
    return (
      <View 
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center"
        }}>
        <Text>Hello, I am at :  </Text>
        {/* <Button
           title = "Increment count"
           onPress={()=>{this.incrementCounter()}}/> */}

        <View>
          {/* <Text>{this.state.count}</Text> */}
          <Text>latitude .: {this.state.region.latitude} </Text>
          <Text>longitude : {this.state.region.longitude} </Text>
          <Button
            title="Show/Hide Location"
            onPress={() => { this.showLocation() }} />
        </View>
        {this.state.locationFound && <View style={{ width: '90%', height: '40%', backgroundColor: 'powderblue' }}>
          {/* <MapView  
            style={{flex: 1}} 
            region={{latitude: 42.882004,longitude: 74.582748,latitudeDelta: 0.0922,longitudeDelta: 0.0421}}
            showsUserLocation={true} />    */}
          <MapView
            provider={PROVIDER_GOOGLE}
            style={{ ...StyleSheet.absoluteFillObject }}
            showsUserLocation={this.state.userPoint}
            showsBuildings={true}
            isZoomEnabled={true}
            showZoomControls={true}
            isRotateEnabled={true}
            initialRegion={this.state.region}
            onRegionChangeComplete={region => {
              this.onRegionChange(region);
            }}>
            {/* <Circle
            center={{latitude: 45.5, longitude: -73.58}}
            radius={1000}
            fillColor={'rgba(100,100,200,0.5)'}
            /> */}
             
            <Marker
              draggable
              coordinate={{ latitude: 45.5, longitude: -73.58 }}
              title={'Location 1'}
            >
              <Callout onPress={this.showSomeMessage}>
                <Text>This is the place where we want to check vibe</Text>
              </Callout>
            </Marker>
          </MapView>
        </View> }
        <Button
            title="Flip camera"
            onPress={() => { this.flipCamera() }} />
        <RNCamera
          style={{ width: '90%', height: '40%', backgroundColor: 'powderblue' }}
          useNativeZoom={true}
          type={this.state.cameraType}
          onDoubleTap={()=>{this.flipCamera() }}
          ref={ref => {
            this.camera = ref
          }}
        />
      </View>
    )
  }
componentDidMount() {
  database().ref('/locations/').on('value', snapshot => {
    console.log(snapshot.val());
  })
  Geolocation.watchPosition(
    (position) => {
      console.log(position);
      console.log("Inside componentDidMount -  watchPosition " + position.coords.latitude + " " + position.coords.longitude)
      // this.setState({ where: { lat: position.coords.latitude, lng: position.coords.longitude }, locationFound:true }, ()=>{
      //   console.log(this.state.where.lat);
      // })
      this.setState({
        region: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        }, locationFound: true
      });
    },
    (error) => {
      // See error code charts below.
      console.log(error.code, error.message);
    },
    { enableHighAccuracy: true, distanceFilter: 20, timeout: 15000, maximumAge: 0 }
  );

}

}



const styles = StyleSheet.create({
  container: {
    marginTop: 50,
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
