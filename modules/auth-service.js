const mongoose = require('mongoose');
let Schema = mongoose.Schema;
require('dotenv').config();
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  userName: {type: String, unique: true},
  password: String,
  email: String,
  loginHistory: [{
    dateTime: Date,
    userAgent: String,
}]
  
});



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://iszcar20:3vwdQ2JU4ZzQnK9R@cluster0.6opq8w2.mongodb.net/";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);




let User;
//let Company = mongoose.model('companies', userSchema);
function initialize()
{
    return new Promise((resolve, reject) =>
    {
        let db = mongoose.createConnection(uri);

        db.on('error', err => 
            reject (err));

        db.once ('open', () => {
            User = db.model("users" , userSchema);
            resolve();
        });
    });
}

function registerUser(userData)
{
    return new Promise((resolve, reject) =>{
        if (userData.password != userData.password2) {
            reject("Passwords do not match");
        }
        else {
            bcrypt
            .hash(userData.password, 10)
            .then(hash => {
                let newUser = new User({
                    
                    userName: userData.userName,
                    password: hash,
                    email: userData.email,
                    loginHistory: []
                });

                newUser.save()
                .then(() => resolve())
                .catch(err=> {
                    if(err.code === 11000) {
                        reject ("User Name already taken");
                    }else{
                      reject(`There was an error creating the user: ${err}`);
                    }
                });
                
            })
            .catch(err => reject(`Error hashing password: ${err}`));
        }
    });
}

function checkUser(userData)
{
    return new Promise((resolve, reject) => {
        User.findOne({userName: userData.userName})
        .then(user => {
            if(!user)
            {
              reject(`Unable to find user: ${userData.userName}`);
            }
            else
            {
                bcrypt
                .compare(userData.password, user.password)
                .then(match => {
                    if(!match)
                    {
                      reject(`Incorrect Password for user: ${userData.userName}`);

                    }
                    else{
                        if (user.loginHistory.length === 8)
                        {
                            user.loginHistory.pop();
                        }

                        user.loginHistory.unshift({dateTime: new Date().toString(), userAgent: userData.userAgent});
                        User.updateOne({ userName: user.userName}, {$set: {loginHistory: user.loginHistory}})

                        .then(() => resolve(user))
                        .catch(err => reject(`There was an error verifying the user: ${err}`));
                    }
                })

                .catch(err => reject(`Error verifying password: ${err}`));
            }
        })

        .catch(err => reject(`Unable to find user: ${userData.userName}`));
    });
}
module.exports = 
{
    initialize,
    registerUser,
     checkUser
};

