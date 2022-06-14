import * as React from "react";
import { LogBox } from "react-native";
import Routes from "./routes";

const App = () => {
  // console.log(MyTheme);
  React.useEffect(() => {
    LogBox.ignoreLogs(['AsyncStorage has been extracted from react-native core ']);
  }, []);
  return (
    <Routes />
  );
};

export default App;
