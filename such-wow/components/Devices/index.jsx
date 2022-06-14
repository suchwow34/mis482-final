import * as React from "react";
import { Alert, Button, Text, View, RefreshControl, ScrollView, LogBox } from "react-native";
import typography from "../typography";
import { auth, db } from "../../modules/firebase";
import { collection, query, where, getDocs, doc, updateDoc, onSnapshot } from "firebase/firestore";
import Swipable from "./Swipable";

const Devices = (props) => {
  const [devices, setDevices] = React.useState([]);
  const [refreshing, setRefreshing] = React.useState(false);

  const q = query(collection(db, "devices"), where("user", "==", auth.currentUser.uid));

  const getDevices = async () => {
    try {
      const querySnapshot = await getDocs(
        q
      );

      const deviceList = [];

      querySnapshot.forEach((doc) =>
        deviceList.push({ id: doc.id, ...doc.data() })
      );

      setDevices(deviceList);
      setRefreshing(false);
    } catch (err) {
      console.log(err);
    }
    return true;
  };

  React.useEffect(() => {
    LogBox.ignoreLogs(['VirtualizedLists should never be nested']);

      const unsubscribe = onSnapshot(
        q, (querySnapshot) => {

          const deviceList = [];

          querySnapshot.forEach((doc) =>
            deviceList.push({ id: doc.id, ...doc.data() })
          );
    
          setDevices(deviceList);
        }
      );
      return () => unsubscribe();

      // setRefreshing(false);
    // getDevices();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getDevices();
  }, []);

  const handleDeleteDevice = async (id) => {
    if (devices.find((_) => _.id === id)) {
      const deviceRef = doc(db, "devices", id);

      await updateDoc(deviceRef, {
        user: null,
        name: "Such-wow Device",
      });
    } else {
      Alert.alert("Device is already unpaired!");
    }
    // getDevices();
  };

  return (
    <ScrollView
      style={{paddingLeft: 20, paddingRight: 20}}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={{paddingBottom:20}}>
      <Text style={typography.h1}>Your Devices</Text>
      {devices.length === 0 && !refreshing 
      ? <Text style={{textAlign: "center", paddingTop: 10}}>You have no paired devices!</Text>
      : <Swipable items={devices} handleDeleteDevice={handleDeleteDevice} />}
      </View>
      <Button title="Connect a new device" onPress={props.navigateToConnect} />
    </ScrollView>
  );
};

export default Devices;
