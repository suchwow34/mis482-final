import React from 'react';
import moment from 'moment';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import typography from '../typography';
import DeviceState from './components/DeviceState';
import { doc, updateDoc } from "firebase/firestore";
import { db } from '../../modules/firebase';
import { useNavigation } from '@react-navigation/native';

const Device = (props) => {

  const navigation = useNavigation();

  const {
    is_alarm_on,
    is_locked_in,
    last_activity,
    name,
    id,
    
  } = props.meta;

  const [deviceName, setDeviceName] = React.useState(name);
  const [editable, setEditable] = React.useState(true);

  const deviceRef = doc(db, "devices", id);
  
  const updateName = async (text) => {
    // update function
    await updateDoc(deviceRef, {
      name: text
    });
  }

  const onSaveName = () => {
    
    setEditable(false);

    if(deviceName === ""){
      setDeviceName(name);
    }else if(deviceName !== name){
      updateName(deviceName);
    }
  };

  const handleLockIn = async () => {
    await updateDoc(deviceRef, {
      is_locked_in: true
    });
  };

  const handleLockOff = async () => {
    await updateDoc(deviceRef, {
      is_locked_in: false
    });

  };

  const handleTurnOffAlarm = async () => {
    await updateDoc(deviceRef, {
      is_alarm_on: false,
      alarm_reason: null,
      alarm_log: null
    });
  };
  let Wrapper = !props.preventClick ? TouchableOpacity : View;
  return(<Wrapper style={styles.container} key={props.key} onPress={() => !props.preventClick && navigation.navigate("DeviceDetail", {device : props.meta, title: props.meta.name})}>
    <View style={styles.info}>
    <View style={styles.inputWrapper}>
      <TextInput 
        style={[typography.h2, styles.input]}
        value={deviceName}
        onChangeText={setDeviceName}
        onPressIn={() => setEditable(true)}
        onEndEditing={onSaveName}
        editable={editable}
        returnKeyType="done"
      />
    </View>
      <Text>Last activity: {last_activity?.seconds ? moment(last_activity.seconds * 1000).fromNow() : "No problems!"}</Text>
    </View>
    <View style={{minWidth:50, display: 'flex', justifyContent: "center"}}>
      <DeviceState 
        is_alarm_on={is_alarm_on} 
        is_locked_in={is_locked_in}
        name={name}
        handleLockIn={handleLockIn}
        handleLockOff={handleLockOff}
        handleTurnOffAlarm={handleTurnOffAlarm}
      />
    </View>
  </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems:"center",
    justifyContent: "space-between",
  },
  input: {
    marginRight: 10,
  }, 
  inputWrapper : {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  info : {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
  },
  locked_circle: {
    width: 30,
    height: 30,
    backgroundColor : "gray",
    borderRadius: "50%"
  }
}); 

export default Device;