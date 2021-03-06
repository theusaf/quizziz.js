const path = require("path");
const handler = require("./src/messages.js");
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
    return new Promise(async(resolve, reject) => {
      // setup
      try {
        await this.resolveToken(pin);
        await this.getQuestions();
        await this.createSocket();
      } catch (e) {
        return reject(e);
      }
    });
  }
  resolveToken(pin){
    return new Promise(async(resolve, reject) => {
      try {
        const data = await got("https://game.quizizz.com/play-api/v4/checkRoom",{
          method: "POST",
          json: {
            roomCode: pin
          }
        }).json();
        this.hash = data.room.hash;
        this.gameOptions = data.room.options;
      } catch (e) {
        return reject(0);
      }
      resolve();
    });
  }
  createSocket(){
    return new Promise(async(resolve, reject) => {
      let data;
      try {
        let data = await got("https://socket.quizizz.com/socket.io/?EIO=4&transport=polling");
        data = JSON.parse("{" + data.body.split("{")[1]);
        this.sid = data.sid;
        this.socket = new ws(`wss://socket.quizizz.com/socket.io/?EIO=4&transport=websocket&sid=${this.sid}`);
      } catch (e) {
        reject(2);
      } finally {
        this.socket.on("open",()=>{
          resolve();
          this.handler = new handler(this.socket);
          this.socket.on("message",m=>{
            handler.message(m);
          });
          handler.on("ready",()=>{
            // send packet
          });
          this.socket.send("2probe");
        });
      }
    });
  }
  getQuestions(){
    return new Promise(async(resolve, reject) => {
      try {
        const data = await got("https://game.quizizz.com/play-api/v4/getQuestions",{
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
