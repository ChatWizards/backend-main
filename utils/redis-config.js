const {Redis} = require('ioredis')
const client = new Redis(process.env.REDIS_URI)

function getOrSetCachedInfo(key,callback){
    return new Promise(async (resolve,reject)=>{
        let data;
        if(!key || !callback) reject("Key and callback must be provided")
        data = await client.get(JSON.stringify(key))
        if(data) return resolve(JSON.parse(data))
        else data = await callback()
        return resolve(data)
    })
    
}

function deleteCachedInfo(key){
    return new Promise(async(resolve,reject)=>{
        let data;
        if(!key) return reject("Key or callback must be provided")
        data = await client.del(key)
        return resolve(data)
    })

}

function updateCachedInfo(key,callback){
    return new Promise(async(resolve,reject)=>{
        let data;
        if(!key) return reject("Key or callback must be provided")
        data = await client.get(JSON.stringify(key))
        if(!data) return reject("given key is not valid")
        const ttl = await client.ttl(JSON.stringify(key))
        data = await callback() // update this to just change the data as json object
        await client.set(JSON.stringify(key),JSON.stringify(data), 'EX', ttl);
        return resolve(data);
    })

}

module.exports = {client,updateCachedInfo,deleteCachedInfo,getOrSetCachedInfo}