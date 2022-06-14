import * as React from "react";
import { Alert, Button } from "react-native";
import { auth } from '../modules/firebase';
import Devices from "../components/Devices";
import { SafeAreaView } from "react-native-safe-area-context";

const Home = ({navigation}) => {

  const showConfirmDialog = () => {
    return Alert.alert(
      "Are you sure?",
      "This will log you out of your account.",
      [
        {
          text: "Sign out",
          style: "destructive",
          onPress: () => auth.signOut()
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    )
  };
  
  return (
    <SafeAreaView style={{flex : 1,}}>
      <Devices navigateToConnect={() => navigation.navigate('Connect')}/>
      <Button title="Sign out" onPress={showConfirmDialog} />
    </SafeAreaView>
  );
};

export default Home;
