module.exports = class MessageHandler{
  constructor(socket){
    this.socket = socket;
  }
  message(message){
    switch (message.split("[")[0]) {
      case "3probe":
        socket.send("5");
        break;
      default:

    }
  }
  ping(){
    socket.send("2");
  }
}
