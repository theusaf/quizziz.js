const path = require("path");
const token = require("./src/token.js"));
const got = require("got");
const EventEmitter = require("events");

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
  }
  join(name,pin){
    return new Promise((resolve, reject) => {
      try {
        await this.resolveToken(pin);
      } catch (e) {
        return reject(e);
      }
      try {
        await this.getQuestions();
      } catch (e) {
        return reject(e);
      }
    });
  }
  resolveToken(pin){
    return new Promise((resolve, reject) => {
      let data;
      try {
        data = await got("https://game.quizizz.com/play-api/v3/checkRoom",{
          method: "POST",
          json: {
            roomCode: "607771"
          }
        }).json();
      } catch (e) {
        return reject(0); // request failed
      }
      try {
        this.token = data.odata;
        const parsedData = token(this.token);
        this.hash = parsedData.hash;
        this.gameOptions = parsedData.options;
      } catch (e) {
        return reject(1); // issue parsing token, might be blocked?
      }
      resolve();
    });
  }
  getQuestions(){
    return new Promise((resolve, reject) => {
      let data;
      try {
        data = await got("https://game.quizizz.com/play-api/v3/getQuestions",{
          method: "POST",
          json: {
            roomHash: this.hash,
            type: this.gameOptions.type
          }
        }).json();
      } catch (e) {
        return reject(2);
      }
      this.questionData = data;
      resolve();
    });
  }
}
