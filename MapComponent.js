import React, { Component } from 'react';
import {
  Text, View, Button, TextComponent, Image, Alert, SafeAreaView, ScrollView, Dimensions, TouchableOpacity,
  ImageBackground
} from 'react-native';
import { StyleSheet } from 'react-native';

// Imoprt RT database from firebase //
import database from '@react-native-firebase/database';
// Import new geolocation //
import Geolocation from 'react-native-geolocation-service';


// Adding Map view to the application// 
import MapView, { PROVIDER_GOOGLE, Marker, Callout, Circle } from 'react-native-maps';

// Adding gesture support //
import Swipeable from 'react-native-gesture-handler/Swipeable';

const windowHeight = Dimensions.get('window').height;
class MapComponent extends Component {

    state = {
        
        locationFound: false,
        // mapScreen:true,
        cameraView:false,
        userPoint: true,
        scrollHeight: 100,
        region: {
          latitude: 43.41058,
          longitude: 73.97794,
          latitudeDelta: 0.3,
          longitudeDelta: 0.3,
        },
        id:null,
      }

      showLocation = () => {
        this.setState({ userPoint: !this.state.userPoint })
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
      showSomeMessage = () => {
        Alert.alert(
          'Do you want to upload a pic',
          'It helps others to feel the vibe', [
          {
            text: 'no',
            style: 'cancel'
          },
          {
            text: 'Vibe'
          }
        ]
        )
      }

      render(){
          return(
                <View>
                {this.state.locationFound &&
                  <MapView
                    provider={PROVIDER_GOOGLE}
                    style={styles.mapScreen}
                    showsUserLocation={this.state.userPoint}
                    showsBuildings={true}
                    isZoomEnabled={true}
                    showZoomControls={true}
                    isRotateEnabled={true}
                    initialRegion={this.state.region}
                    onRegionChangeComplete={region => {
                      this.onRegionChange(region);
                    }}>
                     
                    <Marker
                      draggable
                      coordinate={{ latitude: 45.5, longitude: -73.58 }}
                      title={'Location 1'}
                    >
                      <Callout onPress={this.showSomeMessage}>
                        <Text>This is the place where we want to check vibe</Text>
                      </Callout>
                    </Marker>
                    <View style={styles.optionsOnMapView} >
                      <TouchableOpacity style={styles.camera_shutter}
                       onPress={() => { this.props.ChangeScreen()}}>
                       <Image 
                        source={require('./media/camera-shutter.png')}
                       //  style={styles.camera_shutter_icon}
                       style={{ width: 100, height: 100 }} 
                         /> 
                          </TouchableOpacity>
                          </View>
                        </MapView>}
                      {/* <Button
                      title="Show/Hide Location"
                      style={styles.userLocationButton}
                      onPress={() => { this.showLocation() }} />  */}
                  </View>
          )
      }

componentDidMount=()=>{
    const id = Geolocation.watchPosition(
        (position) => {
          console.log(position);
          console.log("Inside componentDidMount -  watchPosition " + position.coords.latitude + " " + position.coords.longitude)
          console.log(windowHeight);
          console.log(id);
          // this.setState({ where: { lat: position.coords.latitude, lng: position.coords.longitude }, locationFound:true }, ()=>{
          //   console.log(this.state.where.lat);
          // })
          this.setState({
            region: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              latitudeDelta: 0.03,
              longitudeDelta: 0.03,
            }, locationFound: true, id:id
          });
        },
        (error) => {
          // See error code charts below.
          console.log(error.code, error.message);
        },
        { enableHighAccuracy: true, distanceFilter: 10, timeout: 15000, maximumAge: 0 }
      );
}

componentWillUnmount(){
    console.log("Inside unMount");
    Geolocation.clearWatch(this.state.id);
}
}


const styles = StyleSheet.create({
    container: {
      marginTop: 50,
    },
    preview: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
      height: Dimensions.get('window').height/1.5 ,
      width: Dimensions.get('window').width,
    },
    mapScreen:{
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
      height: Dimensions.get('window').height/1,
      width: Dimensions.get('window').width,
    },
    optionsOnMapView:{
      position: 'absolute',
      bottom:0,
    },
    camera_shutter:{
      borderRadius:100,
      overflow:'hidden',
    },
    userLocationButton:{
      position: 'absolute',
      bottom:0,
      backgroundColor:'black',
      zIndex:2,
    },
    leftAction:{
      backgroundColor:'#388e3c',
      justifyContent:'center',
      flex:1,
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

export default  MapComponent;