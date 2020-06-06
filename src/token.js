// derived from omegaboot by @idiidk, which is taken from quizziz
module.exports = {
  decode: decode,
  encode: encode
}
function decode(token){
  const t = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
  if(t){
    const header = extractHeader(token);
    return decodeRaw(header,true);
  }
  const decoded = decode(extractHeader(token),true);
  const token2 = extractData(token);
  return decodeRaw(token2,false,decoded);
};
function decodeRaw(token,t){
  const code = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : "quizizz.com";
  const version = extractVersion(token);
  let offset = 0;
  offset = t ? code.charCodeAt(0) : code.charCodeAt(0) + code.charCodeAt(code.length-1);
  offset = -offset;
  let str = "";
  for(let i = 0; i<token.length; i++){
    const char = token[i];
    const num = char.charCodeAt(0);
    const result = t ? safeAdd(num,offset) : addOffset(num,offset,i,version);
    str += String.fromCharCode(result);
  }
  return str;
}
function addOffset(num,offset,index,version){
  return 2 === version ? verifyCharCode(num) ? safeAdd(num, index % 2 === 0 ? offset : -offset) : num : safeAdd(num, index % 2 === 0 ? offset : -offset);
}
function safeAdd(num,index){
  const o = 0;
  const n = 65535;
  const a = num + index;
  return a > n ? o + (a - n) - 1 : a < o ? n - (o - a) + 1 : a;
}
function verifyCharCode(num){
  if("number" === typeof num){
    return !(num >= 55296 && num <=56319) && !(num >= 56320 && num <= 57343);
  }
}
function extractHeader(token){
  const position = token.charCodeAt(token.length - 2) - 33;
  return token.slice(0,position);
}
function extractVersion(token){
  if("string" === typeof token && token[token.length - 1]){
    const version = parseInt(token[token.length - 1],10);
    if(!isNaN(version)){
      return version;
    }
  }
  return null;
}
function extractData(token){
  const position = token.charCodeAt(token.length - 2) - 33;
  return token.slice(position,-2);
}
// e = text to encode, t = password? (at least 2 characters)
// a third argument sets the "version" string?
function encode(e,t){
  var o=arguments.length>2&&void 0!==arguments[2]?arguments[2]:2;
  var n=encodeRaw(t,!0);
  var a=encodeRaw(e,!1,t);
  var i=String.fromCharCode(33+n.length);
  return"".concat(n).concat(a).concat(i).concat(o);
}
function encodeRaw(e,t){
  var o=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"quizizz.com";
  var n=0;n=t?o.charCodeAt(0):o.charCodeAt(0)+o.charCodeAt(o.length-1);
  for(var a=[],i=0;i<e.length;i++){
    var r=e[i];
    var s=r.charCodeAt(0);
    var c=t?safeAdd(s,n):addOffset(s,n,i,2);
    a.push(String.fromCharCode(c));
  }
  return a.join("");
}
