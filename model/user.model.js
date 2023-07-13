const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  userName:{type:String, required:true,immutable:true,unique:true},
  email: { type: String, required: true, immutable: true, unique: true},
  password: { type: String, required: true },
  profilePic:{type:String,default:"https://icons8.com/icon/23264/user"},
  isVerfied:{type:Boolean,default:false},
  contacts: [{type:mongoose.SchemaTypes.ObjectId,ref:'user'}],
  createdAt: { type: Date, default: Date.now(), immutable: true },
  updatedAt:{type:Date,default:Date.now()}
});

// userSchema.methods.pre("create",function(next){
//   let localCopy = this.profilePic
//   const gfs = new mongoose.mongo.GridFSBucket()
//   next()
// })

// userSchema.virtual("gridfs").get(function(){
//  assigning bucket to the user
//   const gfs = GridFsStorage(mongoose.connection.db,{
//     bucketName:"userBucket",
//   })
//   gfs.collection("userBucket")
// })

// userSchema.statics.findWithGridFS = function (query) {
//   const gfs = new GridFSBucket(mongoose.connection.db, {
//     bucketName: 'userBucket'
//   });
//   gfs.collection('userBucket');
  
//   // Add your find query logic here
//   return this.find(query).exec((err, documents) => {
//     if (err) {
//       console.error(err);
//       return;
//     }

//     return documents;
//   });
// };

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;
