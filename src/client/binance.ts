import axios from 'axios';

export async function getPrice() {
    return await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=XRPAUD');
}

export async function getKline() {
    return await axios.get('https://api.binance.com/api/v3/klines?symbol=XRPAUD&interval=1d&limit=1');
}
