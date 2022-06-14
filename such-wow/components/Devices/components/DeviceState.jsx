import React from 'react';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const DeviceState = ({
  name,
  is_locked_in, 
  is_alarm_on,
  handleTurnOffAlarm,
  handleLockIn,
  handleLockOff
}) => {

  const state = is_alarm_on ? "alarm" : (
    is_locked_in 
    ? "locked" 
    : "idle"
  );

  const handleAlarmPress = () => {
    return Alert.alert(
      "Call the police?",
      "You can either turn off the alarm or call the police.",
      [
        {
          text: "Call police",
          style: "destructive",
          onPress: () => Linking.openURL('tel:155')
        },
        {
          text: "Turn the alarm off",
          onPress: () => handleTurnOffAlarm()
        },
        {
          text: "Cancel",
          style: "cancel",
        }
      ]
    )
  };

  const handleIdlePress = () => {
    return Alert.alert(
      `Lock ${name}?`,
      "Would you like to lock?",
      [
        {
          text: "Lock in",
          onPress: () => handleLockIn()
        },
        {
          text: "Cancel",
          style: "cancel",
        }
      ]
    )
  };

  const handleLockedPress = () => {
    return Alert.alert(
      `Turn the lock off?`,
      "Would you like to turn the lock off?",
      [
        {
          text: "Lock off",
          onPress: () => handleLockOff()
        },
        {
          text: "Cancel",
          style: "cancel",
        }
      ]
    )
  };
  
  switch(state){
    case "alarm": 
      return <TouchableOpacity style={styles.status} onPress={handleAlarmPress}>
        <View style={[styles.circle, styles.alarm_circle]}/>
        <Text style={[styles.caption, styles.alarm]}>Alarm on</Text>
      </TouchableOpacity>;
    case "locked":
      return <TouchableOpacity style={styles.status} onPress={handleLockedPress}>
        <View style={[styles.circle, styles.locked_circle]}/>
        <Text style={[styles.caption, styles.locked]}>Locked</Text>
      </TouchableOpacity>;
    default:
      return <TouchableOpacity style={styles.status} onPress={handleIdlePress}>
        <View style={[styles.circle, styles.idle_circle]}/>
        <Text style={[styles.caption, styles.idle]}>Idle</Text>
      </TouchableOpacity>;
  }

};

const styles = StyleSheet.create({
  status: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: "50%"
  },
  caption: {
    marginTop: 4,
    fontSize: 10
  },
  idle_circle: {
    backgroundColor: "gray"
  },
  alarm_circle: {
    backgroundColor: "red",
  },
  locked_circle: {
    backgroundColor: "green",
  },
  locked: {
    color: "green",
  },
  alarm: {
    color: "red",
  },
  idle: {
    color: "gray",
  },
}); 

export default DeviceState;