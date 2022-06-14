import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SwipeListView } from "react-native-swipe-list-view";
import Device from "./Device";
const colorHighlight = "#e5e5e5";
const colorDanger = "red";
const colorDangerText = "#FFF";
const colorInfoText = "#0000cc";
const backButtonWidth = 75;
const openWidth = backButtonWidth;
const padding = 20;
const fontSize = 18;


const Swipable = ({items, handleDeleteDevice, refreshDevices}) => {
  const handleDelete = (item) => {
    return Alert.alert(
      `Delete ${item.name}?`,
      "This will unpair the device from your account.",
      [
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleDeleteDevice(item.id)
        },
        {
          text: "Cancel",
          style: "cancel"
        },
      ]
    )
  };

  return (
      <SwipeListView
        data={items}
        renderItem={({ item }) => (
          <TouchableHighlight
            style={styles.rowFront}
            underlayColor={colorHighlight}
            key={item.id}
          >
            <Device meta={item} />
          </TouchableHighlight>
        )}
        keyExtractor={(item) => item.id}
        renderHiddenItem={({ item }) => (
          <View style={styles.rowBack}>
            <TouchableOpacity
              style={[styles.backRightBtn, styles.dangerBtn]}
              onPress={() => handleDelete(item)}
            >
              <Text style={styles.backTextDanger}>DELETE</Text>
            </TouchableOpacity>
          </View>
        )}
        rightOpenValue={-openWidth}
        stopRightSwipe={-openWidth}
      />
  );
};
const styles = StyleSheet.create({
  rowFront: {
    justifyContent: "center",
    padding: padding,
    backgroundColor: "#ffffff",
    borderBottomColor: colorHighlight,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  frontText: {
    fontSize: fontSize,
  },
  rowBack: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    flexDirection: "row",
    paddingHorizontal: padding,
  },
  backTextNeutral: {
    color: colorInfoText,
    fontSize: fontSize,
  },
  backTextDanger: {
    color: colorDangerText,
    fontSize: fontSize,
  },
  backRightBtn: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    position: "absolute",
    top: 0,
    width: backButtonWidth,
  },
  dangerBtn: {
    backgroundColor: colorDanger,
    right: 0,
  },
  backLeftBtn: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    position: "absolute",
    top: 0,
    width: backButtonWidth,
  },
});
export default Swipable;
