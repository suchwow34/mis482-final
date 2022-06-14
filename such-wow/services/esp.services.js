import axios from 'axios';
import { DEFAULT_ESP_ADDR } from '../config';
import qs from 'qs';

export const settings = (ESP_URL = DEFAULT_ESP_ADDR) => {
  return axios.get(`${ESP_URL}/settings`).then(res => res.data);
};

export const ping = (ESP_URL = DEFAULT_ESP_ADDR) => {
  return axios.get(`${ESP_URL}/ping`).then(res => res.data?.ping === "pong" ? res.data.id : "").catch((err) => {
    console.log(err);
    return "";
  });
};

export const sendConnectionDetails = (ssid, password, userId, ESP_URL = DEFAULT_ESP_ADDR) => {
  return axios.post(`${ESP_URL}/connect`, qs.stringify({ ssid, password, userId })).then(res => res.data);
};