import * as React from 'react';
import {
  View,
  StyleSheet,
  Linking,
  Button,
  Image
} from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import Logo from '../components/Logo';
import {BACKGROUND_COLOR} from '../utils/theme';
import wifiImage from '../assets/wifi-image.png';
import Connectivity from '../components/Connectivity';
import ConnectWiFi from '../components/ConnectWiFi';

const Connect = ({ navigation }) => {

  const onboardingRef = React.useRef(null);

  const [connectedToESP, setConnectedToESP] = React.useState("");

  const onDone = () => {
    navigation.navigate('Home');
  };

  return (
      <Onboarding
        ref={onboardingRef}
        onDone={onDone}
        
        pages={[
          {
            backgroundColor: BACKGROUND_COLOR,
            image: <View>
            <Image source={wifiImage} style={styles.image} />
            <Button title='Open Wi-Fi Settings' onPress={() => Linking.openURL('App-prefs:WIFI')} />
            <Connectivity connectedToESP={connectedToESP} setConnectedToESP={setConnectedToESP} onDone={() => onboardingRef.current.goNext()} />
            </View>,
            title: 'Connect to the "Such-wow" network in Wi-Fi.',
            subtitle: 'Click the button above to open your wireless settings.',
          },
          {
            backgroundColor: BACKGROUND_COLOR,
            image: <ConnectWiFi connectedToESP={connectedToESP} onDone={() => onboardingRef.current.goNext()} />,
            title: 'Connect to your network.',
            subtitle: 'Please enter your local network credentials and click the connect button.',
          }
        ]}
      />
  );
};

const styles = StyleSheet.create({
  image: {
    width: 300,
    height: 300
  }
}); 

export default Connect;