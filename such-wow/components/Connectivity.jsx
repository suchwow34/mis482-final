import React from 'react';
import { Button, Text, View } from 'react-native';
import * as ESP from '../services/esp.services';

const Connectivity = ({
  connectedToESP,
  setConnectedToESP,
  onDone,
}) => {

  const getState = async () => {
    const isUp = await ESP.ping();
    setConnectedToESP(isUp);
    if(isUp){
      onDone();
    }
  };

  React.useEffect(() => {
    getState();
  }, []);

  return (
  <View>
    <Text style={{textAlign: "center"}}>{connectedToESP ? "✅ SUCCESSFULLY CONNECTED!" : `Not connected.`}</Text>
    <Button title="Test again" onPress={getState} />
  </View>);
};

export default Connectivity;