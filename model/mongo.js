const MongoClient = require('mongodb').MongoClient;
// Connection URL
const url = 'mongodb://127.0.0.1:27017/?gssapiServiceName=mongodb';
// Create a new MongoClient
const client = new MongoClient(url, { useUnifiedTopology: true } );

function connect(dbName = 'hwq'){
    return new Promise((res,rej)=>{
        client.connect(async function(err) {
            if(err) rej(err);
            else{
                const db = client.db(dbName);
                await res(db);
            }
          });
    })
}

function find(collection,filters = {},{findOne=false}={}){
    return new Promise((res,rej) =>{
        return connect().then(r=>{
            r.collection(collection).find(filters).toArray(
                (err,docs)=>{
                    if(err) rej(err);
                    if(docs.length)
                        res(findOne?docs[0]:docs);
                    else res(null)
                }
            )
        })
    })
}

module.exports = {connect,find};
