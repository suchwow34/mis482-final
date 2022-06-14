import * as React from 'react';
import {
  Text,
  View,
  StyleSheet
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const Logo = () => {
  // Ref or state management hooks

  return (
    <View style={styles.container}>
      <MaterialIcons name="security" size={150} color="black" />
      <Text style={styles.logoText}>IoT Guard</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    display: "flex",
    alignItems : "center",
    justifyContent: "center"
  },
  logoText: {
    fontSize: 30,
    fontWeight: 'bold',
  }
}); 

export default Logo;