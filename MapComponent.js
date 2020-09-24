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
    markers:[],
    locationCoordinates: [
      { locationName: 'Concordia University', latitude: 45.495176, longitude: -73.58, image: require('./media/concordia_university.jpg') },
      { locationName: 'Old Port', latitude: 45.511463, longitude: -73.546349, image: require('./media/old_port.jpeg') },
      { locationName: 'Mount Royal', latitude: 45.503496, longitude: -73.587061, image: require('./media/mount_royal.jpg') },
      { locationName: 'Beaver Lake', latitude: 45.498949, longitude: -73.595817, image: require('./media/beaver_lake.jpeg') },
      { locationName: 'Laronde', latitude: 45.522383, longitude: -73.534879, image: require('./media/laronde.jpg') },
      { locationName: 'Botanical garden', latitude: 45.555922, longitude: -73.555670, image: require('./media/botanical_garden.jpg') },
      { locationName: 'Angrignon park', latitude: 45.444521, longitude: -73.601707, image: require('./media/angrignon_park.jpg') },
      { locationName: 'Westmount park', latitude: 45.480916, longitude: -73.598590, image: require('./media/westmount_park.jpg') },
    ],
    id: null,
  }

  showLocation = () => {
    // this.setState({ userPoint: !this.state.userPoint })
    Geolocation.getCurrentPosition(
      (position) => {
        console.log(position);
        console.log("Inside show location -  watchPosition " + position.coords.latitude + " " + position.coords.longitude);
          this._map.animateToRegion({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          })
      },
      (error) => {
        // See error code charts below.
        console.log(error.code, error.message);
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 0 }
    );
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

  renderMapItem =({item}) =>
   
      <View style={styles.cardContainer}>
          <Text style={styles.cardTitle}>{item.locationName}</Text>
         <Image style={styles.cardImage} source={item.image}/>
      </View>
    
  

  render() {
    return (
      <View>
        {/* {this.state.locationFound && */}
        <View
        style={styles.mapView}
        >
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.mapScreen}
            ref={map => this._map = map}
            showsUserLocation={this.state.userPoint}
            showsBuildings={true}
            isZoomEnabled={true}
            showZoomControls={true}
            isRotateEnabled={true}
            initialRegion={this.state.region}
            onRegionChangeComplete={region => {
              this.onRegionChange(region);
            }}>
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
                >
                  <Callout>
                    <Text>{marker.locationName}</Text>
                  </Callout>
                </Marker>
              ))
            }

            {/* <View style={styles.optionsOnMapView} > */}
              <TouchableOpacity style={styles.camera_shutter}
                onPress={() => { this.props.ChangeScreen() }}>
                <Image
                  source={require('./media/camera-shutter.png')}
                  //  style={styles.camera_shutter_icon}
                  style={{ width: 100, height: 100 }}
                />
              </TouchableOpacity>
              <Button
            title="Show location"
            onPress={() => { this.showLocation() }}
          />
            {/* </View> */}
          </MapView>
          <Carousel
          ref={(c) => { this._carousel = c; }}
          data={this.state.locationCoordinates}
          containerCustomStyle={styles.carousel}
          renderItem={this.renderMapItem}
          sliderWidth={windowWidth}
          itemWidth={320}
          removeClippedSubviews={false}
          onSnapToItem={(index) => this.onCarouselItemChange(index)}
        />
        </View>
          {/* } */}
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
      { enableHighAccuracy: true, distanceFilter: 10, timeout: 15000, maximumAge: 0 }
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
  mapView: {
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
  },
  mapScreen: {
    flex: 1,
    justifyContent: 'flex-end',
    // alignItems: 'center',
   
  },
  carousel: {
    // position: 'absolute',
    // top: 0,
    // marginLeft:15,
    // alignItems:'center',
    marginBottom: 48,
    zIndex: 5,
  },
  cardContainer: {
    position: 'absolute', 
    bottom:0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex:4,
    paddingTop: 24,
    borderRadius: 24,
    overflow: 'hidden',
  },
  optionsOnMapView: {
    position: 'absolute',
    bottom: 0,
  },
  camera_shutter: {
    borderRadius: 100,
    overflow: 'hidden',
  },
  userLocationButton: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'black',
    zIndex: 2,
  },
  cardImage: {
    height: 250,
    width: 310,
    bottom: 0,
    zIndex:4,
    // position: 'absolute',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24
  },
  cardTitle: {
    color: 'white',
    fontSize: 22,
    paddingBottom:10,
    alignSelf: 'center'
  }
});

export default MapComponent;