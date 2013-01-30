var config = require('../config').config;
var mongo = require("mongoskin");
var GridStore = require("mongoskin/lib/mongoskin/gridfs");
var db = mongo.db(config.db);
exports.Table = function(con){
  var clt = db.collection(con);
  return clt;
};

//exports.GridStore = function (){
//	return GridStore.SkinGridStore(db);
//}

exports.close = function(){
   db.close();
};

/*
 * 鍒涘缓objectid,杩欐牱鎵嶅彲浠ュ湪mongoskin涓娇鐢�
 * db.collection.id()杩欎釜涔熷彲浠�
*/
exports.ObjID = function(id){
  //return db.ObjectID.createFromHexString(id);
  return id;
};