const events = require("events");
module.exports = class MessageHandler extends events{
  constructor(socket){
    super();
    this.socket = socket;
  }
  message(message){
    switch (message.split("[")[0]) {
      case "3probe":
        socket.send("5");
        this.emit("ready");
        break;
      default:

    }
  }
  ping(){
    socket.send("2");
  }
}
