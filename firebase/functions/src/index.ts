/* eslint-disable camelcase */
import * as functions from "firebase-functions";
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();

const chunk = <T>(arr : T[], len : number) => {
  const chunks = [];
  let i = 0;
  const n = arr.length;

  while (i < n) {
    chunks.push(arr.slice(i, i += len));
  }

  return chunks;
};

const db = admin.firestore();
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//

const VARIABLES = {
  PIR_TRESHOLD: 3,
  FIRE_TRESHOLD: 2,
};

export const sensorDataWrite = functions.firestore
    .document("sensordata/{logId}")
    .onCreate(async (snap, context) => {
      const newValue = snap.data();

      const deviceRef = await db.doc(newValue.device).get();
      const deviceDoc = deviceRef?.data();

      if (newValue.fireVal > VARIABLES.FIRE_TRESHOLD) { // if fire is detected
        db.doc(newValue.device).update({
          is_alarm_on: true,
          alarm_reason: "fire",
          alarm_log: snap.ref,
          last_activity: newValue.ts,
        });
      } else if (deviceDoc?.is_locked_in && newValue.motionVal > VARIABLES.PIR_TRESHOLD) { // if motion is detected
        db.doc(newValue.device).update({
          is_alarm_on: true,
          alarm_reason: "motion",
          alarm_log: snap.ref,
          last_activity: newValue.ts,
        });
      }
    });

export const deviceUpdate = functions.firestore
    .document("devices/{deviceId}")
    .onUpdate(async (change, context) => {
      const changedState = change.after.data();
      const prevState = change.before.data();

      // Alarm on action
      if (prevState?.is_alarm_on === false && changedState?.is_alarm_on) {
        let alarmTitle = "Emergency";

        if (changedState.alarm_reason === "fire") {
          alarmTitle = "Fire";
        }

        if (changedState.alarm_reason === "motion") {
          alarmTitle = "Motion";
        }

        const user = await db.doc("users/" + changedState.user).get();
        const userDoc = user?.data();

        if (userDoc?.notification_token) {
          const pushResponse = await axios.post("https://exp.host/--/api/v2/push/send", {
            "to": userDoc?.notification_token,
            "title": `${alarmTitle} detected at ${changedState.name}!`,
            "body": "Click for more info about the incident!",
          }).catch(console.error);

          console.log(pushResponse.data);
        }
      }

      // Handle unpairing
      if (!changedState?.user && prevState?.user) {
        const snapshot = await db.collection("sensordata").where("device", "==", "/devices/" + context.params.deviceId).get();
        const MAX_WRITES_PER_BATCH = 500; /** https://cloud.google.com/firestore/quotas#writes_and_transactions */

        /**
         * `chunk` function splits the array into chunks up to the provided length.
         * You can get it from either:
         * - [Underscore.js](https://underscorejs.org/#chunk)
         * - [lodash](https://lodash.com/docs/4.17.15#chunk)
         * - Or one of [these answers](https://stackoverflow.com/questions/8495687/split-array-into-chunks#comment84212474_8495740)
         */
        const batches : any[][] = chunk(snapshot.docs, MAX_WRITES_PER_BATCH);
        const commitBatchPromises: any[] = [];

        batches.forEach((batch) => {
          const writeBatch = db.batch();
          batch.forEach((doc) => writeBatch.delete(doc.ref));
          commitBatchPromises.push(writeBatch.commit());
        });

        await Promise.all(commitBatchPromises);
      }
    });

export const matchDevice = functions.https.onRequest(async (req, res) => {
  const {id, user} = req.query;

  await db.doc("devices/" + id).update({
    user,
  });

  res.send("ok");
});

export const sendData = functions.https.onRequest(async (req, res) => {
  const {ap, device, fireVal, motionVal, user} = req.query;

  const deviceRef = await db.doc("devices/" + device).get();
  const deviceDoc = deviceRef?.data();

  if (!deviceDoc?.user || deviceDoc?.user !== user) {
    res.send("clear");
    return;
  }

  if (deviceDoc?.user === user) {
    await db.collection("sensordata").add({
      ap,
      device: "/devices/" + device,
      fireVal: parseInt((fireVal as string) || "0"),
      motionVal: parseInt((motionVal as string) || "0"),
      ts: new Date(),
    }).catch(console.error);

    res.send(deviceDoc?.is_alarm_on ? "zrr" : "ok");
    return;
  }
  res.send("clear");

  return;
});
