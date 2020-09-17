import React, { Component } from 'react';
import { Text, View, Button, TextComponent } from 'react-native';

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

class App extends Component {

    state={
        count:0,
        where:{lat:null,lng:null},
    }
    incrementCounter = () =>{
        this.setState({count: this.state.count+1},()=>{
          database().ref('/locations/').update({count:this.state.count});
          console.log(this.state.count);
        });
        
    }
    showLocation = () =>{
      Geolocation.getCurrentPosition(
        (position) => {
          console.log(position);
          console.log(position.coords.latitude + " " +position.coords.longitude)
          this.setState({where:{lat:position.coords.latitude,lng:position.coords.longitude}})
        },
        (error) => {
          // See error code charts below.
          console.log(error.code, error.message);
        },
        { enableHighAccuracy: false, distanceFilter: 100, timeout: 15000, maximumAge: 10000 }
    );
    }


render(){
    return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center"
          }}>
          <Text>Hello, world! My name is sandeep.</Text>
          {/* <Button
           title = "Increment count"
           onPress={()=>{this.incrementCounter()}}/> */}
           
           <View>
           {/* <Text>{this.state.count}</Text> */}
           <Text>latitude : {this.state.where.lat} </Text>
           <Text>longitude : {this.state.where.lng} </Text>
           <Button
           title = "Show Location"
           onPress={()=>{this.showLocation()}}/>
           </View>
        </View>
      )
}
componentDidMount(){
  database().ref('/locations/').on('value',snapshot=>{
    console.log(snapshot.val());
  })
}



}
export default App;
