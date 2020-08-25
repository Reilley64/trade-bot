import axios from 'axios';

export async function get24hrOHLC() {
  return (await axios.get('https://api.binance.com/api/v3/ticker/24hr?symbol=XRPUSDT')).data;
}
