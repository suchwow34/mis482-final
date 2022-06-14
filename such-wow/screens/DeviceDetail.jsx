import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import React from "react";
import { ScrollView, Text, StyleSheet } from "react-native";
import Device from "../components/Devices/Device";
import typography from "../components/typography";
import { db } from "../modules/firebase";
import { Table, Row, Rows } from 'react-native-table-component';
import moment from "moment";

const DeviceDetail = ({ route, navigation }) => {
  const { device } = route.params;

  const [deviceLogs, setDeviceLogs] = React.useState([]);

  // const OneDayAgo = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);

  React.useEffect(() => {

    const logQ = query(
      collection(db, "sensordata"),
      where("device", "==", "/devices/" + device.id),
    );

    const unsubDevice = onSnapshot(doc(db, "devices", device.id), (doc) => {
      const deviceData = doc.data();
      navigation.setParams({
        device: {
          id: doc.id,
          ...deviceData,
        },
        title: deviceData.name,
      });
    });

    const unsubLogs = onSnapshot(logQ, (querySnapshot) => {
      const logs = [];

      querySnapshot.forEach((doc) => logs.push({ id: doc.id, ...doc.data() }));

      const logsSorted = logs.sort((a,b) => b.ts?.seconds - a.ts?.seconds);

      setDeviceLogs(logsSorted);
    });
    return () => {
      unsubLogs();
      unsubDevice();
    };
  }, []);

  return (
    <ScrollView style={{padding: 20}}>
      {/* <Button title="change" onPress={() => navigation.setParams({title: 'Hello'})} /> */}
      <Device meta={device} preventClick={true}/>
      <Text style={[typography.h1, {marginTop: 20}]}>Latest Logs</Text>
      <Table borderStyle={{borderWidth: 2, borderColor: '#ffffff'}}>
        <Row data={["Date", "Motion", "Fire", "AP"]} style={styles.head} textStyle={styles.text}/>
        <Rows data={deviceLogs.map(l => [l.ts?.seconds && moment(l.ts.seconds * 1000).fromNow(), `${l.motionVal}${l.motionVal > 3 ? "*" : ""}`, `${l.fireVal}${l.fireVal > 2 ? "*" : ""}`,l.ap])} textStyle={styles.text}/>
      </Table>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  head: { height: 40, backgroundColor: '#ffffff' },
  text: { margin: 6 }
});

export default DeviceDetail;
