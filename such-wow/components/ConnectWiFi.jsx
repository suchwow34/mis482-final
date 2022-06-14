import { doc, onSnapshot } from 'firebase/firestore';
import React from 'react';
import { ActivityIndicator, Alert, Button, Text, TextInput, View } from 'react-native';
import { auth, db } from '../modules/firebase';
import * as ESP from '../services/esp.services';

const ConnectWiFi = ({
  connectedToESP
}) => {

  const [loading, setLoading] = React.useState(false);
  const [device, setDevice] = React.useState(null);
  const [ssid, setSSID] = React.useState("");
  const [password, setPassword] = React.useState("");

  const connect = async () => {
    const response = await ESP.sendConnectionDetails(ssid, password, auth.currentUser.uid).catch(err => {
      console.log(err);
      return Alert.alert("Error on sending details", "Error : " + JSON.stringify(err), [{ text: "OK" }]);
    });

    if (response?.success) {
      setLoading(true);
      return Alert.alert("Connecting...", "Waiting for ESP to become online...", [{ text: "OK" }]);
    }else{
      return Alert.alert("Error on sending details", "Error : " + response, [{ text: "OK" }]);
    }

  };

  React.useEffect(() => {
    const unsubDevice = onSnapshot(doc(db, "devices", connectedToESP || "undefined"), (doc) => {
      const deviceData = doc?.data();
      if(deviceData?.user === auth.currentUser.uid){
        setLoading(false);
      }
      if(deviceData){
        setDevice({
          id: doc.id,
          ...deviceData
        });
      }else{
        setDevice(null);
      }
    });

    return () => unsubDevice();
  }, [connectedToESP]);

  return (connectedToESP ?
  <View>
    {device?.user !== auth.currentUser.uid ? <View>
      <TextInput placeholder="SSID" onChangeText={setSSID} />
      <TextInput secureTextEntry={true} placeholder="Password" onChangeText={setPassword} />
      {loading && <ActivityIndicator />}
      <Text>Not connected.</Text>
      <Button title="Connect" onPress={connect} />
    </View> : <View>

    <Text style={{fontSize:50, textAlign: "center"}}>✅</Text>
    <Text>ONLINE!</Text>
    
    </View>}
   
  </View>: <View>
    <Text>Please connect to the device from previous page.</Text>
  </View>);
};

export default ConnectWiFi;