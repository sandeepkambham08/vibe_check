import React, { Component } from 'react';
import { Text, View, Button, TextComponent } from 'react-native';
import { StyleSheet } from 'react-native';

// Imoprt RT database from firebase //
import database from '@react-native-firebase/database';

// Import geofire for location services // 
import { initializeApp } from 'firebase'; // added for geofire support 
import geofire from 'geofire';

// Import new geolocation //
import Geolocation from 'react-native-geolocation-service';
// const firebaseApp = initializeApp({
//   apiKey: config.API_KEY, 
//   authDomain: config.AUTH_DOMAIN,
//   databaseURL: config.DATABASE_URL,
//   storageBucket: config.STORAGE_BUCKET
// })

// const geofireRef = new geofire(firebaseApp.database().ref())

// Adding Map view to the application// 
import MapView, {Marker} from 'react-native-maps';


class App extends Component {

  state = {
    count: 0,
    where: { lat: null, lng: null },
    locationFound:false,
    region: {
      latitude: 43.41058,
      longitude: -73.97794,
      latitudeDelta: 0.03,
      longitudeDelta: 0.03,
      }
  }
  incrementCounter = () => {
    this.setState({ count: this.state.count + 1 }, () => {
      database().ref('/locations/').update({ count: this.state.count });
      console.log(this.state.count);
    });

  }
  showLocation = () => {
    //   Geolocation.watchPosition(
    //     (position) => {
    //       console.log(position);
    //       console.log(position.coords.latitude + " " +position.coords.longitude)
    //       this.setState({where:{lat:position.coords.latitude,lng:position.coords.longitude}})
    //     },
    //     (error) => {
    //       // See error code charts below.
    //       console.log(error.code, error.message);
    //     },
    //     { enableHighAccuracy: true, distanceFilter: 1, timeout: 15000, maximumAge: 0 }
    // );
  }
  onRegionChange(region) {
    this.setState({
        region: region
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
          <Text>latitude : {this.state.where.lat} </Text>
          <Text>longitude : {this.state.where.lng} </Text>
          <Button
            title="Show Location"
            onPress={() => { this.showLocation() }} />
        </View>
        {this.state.locationFound && <View style={{width: '80%', height: '50%', backgroundColor: 'powderblue'}}>
          {/* <MapView  
            style={{flex: 1}} 
            region={{latitude: 42.882004,longitude: 74.582748,latitudeDelta: 0.0922,longitudeDelta: 0.0421}}
            showsUserLocation={true} />    */}
          <MapView
            style={{ ...StyleSheet.absoluteFillObject }}
            showsUserLocation={true}
            // region={this.state.region}
            onRegionChangeComplete={region => {
              this.onRegionChange(region);
          }}
          >
          {/* {this.state.markers.map(marker => (
    <Marker
      coordinate={marker.latlng}
      title={marker.title}
      description={marker.description}
    />
  ))} */}
  </MapView>
        </View> }
        
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
        console.log(position.coords.latitude + " " + position.coords.longitude)
        // this.setState({ where: { lat: position.coords.latitude, lng: position.coords.longitude }, locationFound:true }, ()=>{
        //   console.log(this.state.where.lat);
        // })
        this.setState({
          region: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              latitudeDelta: 0.03,
              longitudeDelta: 0.03,
          },locationFound:true
      });
      },
      (error) => {
        // See error code charts below.
        console.log(error.code, error.message);
      },
      { enableHighAccuracy: true, distanceFilter: 10, timeout: 15000, maximumAge: 0 }
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
