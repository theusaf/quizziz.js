const path = require("path");
const token = require("./src/token.js"));
const got = require("got");
const EventEmitter = require("events");
const ws = require("ws");

class Client extends EventEmitter {
  constructor(options) {
    super();
    this.options = options || {
      logging: false // whether to log messages and other stuff
    };
    this.token = null;
    this.hash = null;
    this.gameOptions = {};
    this.questionData = {};
    this.sid = null;
    this.socket = null;
  }
  join(name,pin){
    return new Promise((resolve, reject) => {
      // setup
      try {
        await this.resolveToken(pin);
        await this.getQuestions();
      } catch (e) {
        return reject(e);
      }
    });
  }
  resolveToken(pin){
    return new Promise((resolve, reject) => {
      try {
        const data = await got("https://game.quizizz.com/play-api/v3/checkRoom",{
          method: "POST",
          json: {
            roomCode: "607771"
          }
        }).json();
        this.token = data.odata;
        const parsedData = token.decode(this.token);
        this.hash = parsedData.hash;
        this.gameOptions = parsedData.options;
      } catch (e) {
        return reject(0);
      }
      resolve();
    });
  }
  createSocket(){
    return new Promise((resolve, reject) => {
      let data;
      try {
        let data = await got("https://socket.quizizz.com/socket.io/?EIO=3&transport=polling");
        data = JSON.parse("{" + data.split("{")[1]);
        this.sid = data.sid;
        this.socket = new ws(`wss://socket.quizizz.com/socket.io/?EIO=3&transport=websocket&sid=${this.sid}`);
      } catch (e) {
        reject(2);
      } finally {
        this.socket.send("2probe");
      }
    });
  }
  getQuestions(){
    return new Promise((resolve, reject) => {
      try {
        const data = await got("https://game.quizizz.com/play-api/v3/getQuestions",{
          method: "POST",
          json: {
            roomHash: this.hash,
            type: this.gameOptions.type
          }
        }).json();
        this.questionData = data;
      } catch (e) {
        return reject(1);
      }
      resolve();
    });
  }
}
