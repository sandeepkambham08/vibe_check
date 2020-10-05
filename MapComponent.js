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

// To calculate distance between points //
import { getDistance } from 'geolib';
import * as geolib from 'geolib';

// Adding gesture - up & down  support //
// import SwipeUpDown from 'react-native-swipe-up-down';
import GestureRecognizer, { swipeDirections } from 'react-native-swipe-gestures';

// To show animations of map items // 
import Carousel from 'react-native-snap-carousel';

// Adding Map view to the application// 
import MapView, { PROVIDER_GOOGLE, Marker, Callout, Circle } from 'react-native-maps';

// Adding gesture support //
import Swipeable from 'react-native-gesture-handler/Swipeable';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
class MapComponent extends Component {

  state = {

    locationFound: false,
    // mapScreen:true,
    cameraView: false,
    userPoint: true,
    scrollHeight: 100,
    region: {
      latitude: 43.41058,
      longitude: 73.97794,
      latitudeDelta: 0.3,
      longitudeDelta: 0.3,
    },
    markers: [],
    locationCoordinates: [
      { locationId:1, locationName: 'De_maisonneuve', latitude: 45.492176, longitude: -73.58, image: require('./media/De_Maisonneuve.jpg') },
      { locationId:2, locationName: 'Mount_Royal', latitude: 45.503496, longitude: -73.587061, image: require('./media/mount_royal.jpg') },
      { locationId:3, locationName: 'Concordia_University', latitude: 45.495176, longitude: -73.58, image: require('./media/concordia_university.jpg') },
      { locationId:4, locationName: 'Old_Port', latitude: 45.511463, longitude: -73.546349, image: require('./media/old_port.jpeg') },
      { locationId:5, locationName: 'Beaver_Lake', latitude: 45.498949, longitude: -73.595817, image: require('./media/beaver_lake.jpeg') },
      { locationId:6, locationName: 'Laronde', latitude: 45.522383, longitude: -73.534879, image: require('./media/laronde.jpg') },
      { locationId:7, locationName: 'Botanical_garden', latitude: 45.555922, longitude: -73.555670, image: require('./media/botanical_garden.jpg') },
      { locationId:8, locationName: 'Angrignon_park', latitude: 45.444521, longitude: -73.601707, image: require('./media/angrignon_park.jpg') },
      { locationId:9, locationName: 'Westmount_park', latitude: 45.480916, longitude: -73.598590, image: require('./media/westmount_park.jpg') },
    ],
    id: null,
    NearestLocation:null,
  }

  showLocation = () => {
    console.log("Inside show location -  watchPosition ");
    console.log(this.state.region.latitude + "  " + this.state.region.longitude);
    this._map.animateToRegion({
      latitude: this.state.region.latitude,
      longitude: this.state.region.longitude,
      latitudeDelta: 0.015,
      longitudeDelta: 0.015,
    })
  }
  // this.setState({ userPoint: !this.state.userPoint })
  // Geolocation.getCurrentPosition(
  //   (position) => {
  //     console.log(position);
  //     console.log("Inside show location -  watchPosition " + position.coords.latitude + " " + position.coords.longitude);
  //       this._map.animateToRegion({
  //         latitude: position.coords.latitude,
  //         longitude: position.coords.longitude,
  //         latitudeDelta: 0.015,
  //         longitudeDelta: 0.015,
  //       })
  //   },
  //   (error) => {
  //     // See error code charts below.
  //     console.log(error.code, error.message);
  //   },
  //   { enableHighAccuracy: false, timeout: 15000, maximumAge: 0 }
  // );

  calculateDistance = (lat1, lat2, long1, long2) => {
    let p = 0.017453292519943295;    // Math.PI / 180
    let c = Math.cos;
    let a = 0.5 - c((lat1 - lat2) * p) / 2 + c(lat2 * p) * c((lat1) * p) * (1 - c(((long1 - long2) * p))) / 2;
    let dis = (12742 * Math.asin(Math.sqrt(a))); // 2 * R; R = 6371 km
    return dis;
  }
  onRegionChange = (region) => {
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
  onCarouselItemChange = (index) => {
    let location = this.state.locationCoordinates[index];
    console.log(this.state.locationCoordinates);
    console.log(index);
    console.log(location);
    this._map.animateToRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.015,
      longitudeDelta: 0.015,
    })

    this.state.markers[index].showCallout()
  }
  onMarkerPressed = (location, index) => {
    this._map.animateToRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.09,
      longitudeDelta: 0.035
    });

    this._carousel.snapToItem(index);
  }

  renderMapItem = ({ item }) =>{
    const config = {
      velocityThreshold: 0.4,
      directionalOffsetThreshold: 30,
      gestureIsClickThreshold: 5,
    };
    return(
      <View style={styles.cardContainer}>
      <GestureRecognizer
        config={config}
        onSwipeDown={() => this.props.ChangeScreen()}
        onSwipeUp={() => this.props.checkVibe(item)}
      >
      <Text style={styles.cardTitle}>{item.locationName}</Text>
      <Image style={styles.cardImage} source={item.image} />
      </GestureRecognizer>
    </View>
    )
  }
    



  render() {
    return (
      <View>
        {this.state.locationFound &&
          <View
            style={styles.mapScreen}
          >
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.mapView}
              ref={map => this._map = map}
              showsUserLocation={this.state.userPoint}
              showsBuildings={true}
              isZoomEnabled={true}
              showZoomControls={true}
              isRotateEnabled={true}
              initialRegion={this.state.region}
            // onRegionChangeComplete={region => {
            //   this.onRegionChange(region);
            // }}
            >
              {/* <Marker
              draggable
              coordinate={{ latitude: 45.5, longitude: -73.58 }}
              title={'Location 1'}
            >
              <Callout onPress={this.showSomeMessage}>
                <Text>This is the place where we want to check vibe</Text>
              </Callout>
            </Marker> */}
              {
                this.state.locationCoordinates.map((marker, index) => (
                  <Marker
                    key={marker.locationName}
                    ref={ref => this.state.markers[index] = ref}
                    onPress={() => this.onMarkerPressed(marker, index)}
                    coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
                    image={require('./media/map_marker.png')}
                  >
                    <Callout>
                      <Text>{marker.locationName}</Text>
                    </Callout>
                  </Marker>
                ))
              }

              {/* <View style={styles.optionsOnMapView} > */}
              <TouchableOpacity
                style={styles.camera_shutter}
                // style={styles.showLocation}
                onPress={() => { this.props.ChangeScreen(this.state.NearestLocation) }}>
                <Image
                  source={require('./media/camera-shutter.png')}
                  //  style={styles.camera_shutter_icon}
                  style={{ width: 50, height: 50, paddingTop:50 }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { this.showLocation() }}
                style={styles.showLocation}
              >
                <Image
                  source={require('./media/navigation_icon.png')}
                  style={{ width: 50, height: 50 }}
                // style={styles.showLocation}
                />
              </TouchableOpacity>
              {/* </View> */}
            </MapView>
            <Carousel
              ref={(c) => { this._carousel = c; }}
              data={this.state.locationCoordinates}
              containerCustomStyle={styles.carousel}
              renderItem={this.renderMapItem}
              sliderWidth={windowWidth}
              itemWidth={300}
              removeClippedSubviews={false}
              onSnapToItem={(index) => this.onCarouselItemChange(index)}
            />
          </View>
        }
      </View>
    )
  }

  componentDidMount = () => {
    const id = Geolocation.watchPosition(
      (position) => {
        console.log(position);
        console.log("Inside componentDidMount -  watchPosition " + position.coords.latitude + " " + position.coords.longitude)
        console.log(windowHeight);
        console.log(id);
        // this.setState({ where: { lat: position.coords.latitude, lng: position.coords.longitude }, locationFound:true }, ()=>{
        //   console.log(this.state.where.lat);
        // })
        console.log("Distance to old port is : ", (getDistance(
          position.coords,
          { latitude: 45.511463, longitude: -73.546349 }
        )) / 1000, "Kms");
      console.log("Nearest location is : " , geolib.findNearest(position.coords, this.state.locationCoordinates).locationId);
      let NearestLocation = geolib.findNearest(position.coords, this.state.locationCoordinates);
      console.log("Nearest location is ",NearestLocation);
      this.setState({NearestLocation:NearestLocation})
      console.log(this.state.NearestLocation);

        this.setState({
          region: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
          }, locationFound: true, id: id
        });
      },
      (error) => {
        // See error code charts below.
        console.log(error.code, error.message);
      },
      { enableHighAccuracy: true, distanceFilter: 10, timeout: 1000, maximumAge: 0 }
    );
  }

  componentWillUnmount() {
    console.log("Inside unMount");
    Geolocation.clearWatch(this.state.id);
  }
}


const styles = StyleSheet.create({
  container: {
    //  marginTop: 50,
    // ...StyleSheet.absoluteFillObject,
  },

  mapScreen: {
    // flex: 1,
    // height: Dimensions.get('window').height,
    // width: Dimensions.get('window').width,
    // justifyContent: 'flex-end',
    // alignItems: 'center',
  },
  mapView: {
    height: Dimensions.get('window').height / 1,
    width: Dimensions.get('window').width,
  },
  carousel: {
    position: 'absolute',
    bottom: 0,
    // marginLeft:15,
    // alignItems:'center',
    marginBottom: 48,
    zIndex: 5,
  },
  showLocation: {
    position: 'absolute',
    bottom: 0,
    marginLeft: 290,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 24,
    // alignItems:'center',
    marginBottom: 260,
    zIndex: 5,
    overflow: 'hidden',
  },
  cardContainer: {
    // position: 'absolute', 
    // bottom:0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 4,
    paddingTop: 24,
    borderRadius: 24,
    overflow: 'hidden',
  },
  optionsOnMapView: {
    position: 'absolute',
    bottom: 0,
  },
  camera_shutter: {
    position: 'absolute',
    bottom: 0,
    marginLeft: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 24,
    // alignItems:'center',
    marginBottom: 260,
    overflow: 'hidden',

  },
  userLocationButton: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'black',
    zIndex: 2,
  },
  cardImage: {
    height: 150,
    width: 300,
    bottom: 0,
    zIndex: 4,
    // position: 'absolute',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24
  },
  cardTitle: {
    color: 'white',
    fontSize: 22,
    paddingBottom: 10,
    alignSelf: 'center',
  }
});

export default MapComponent;