const jwt = require('jsonwebtoken');
const crypto = require('crypto')
const AsymmetricKeys = require('../models/asymmetric.keys');
const { Guid } = require('js-guid');
const { createClient } = require('redis');

const createAccessToken = async (data, record) => {
    const accessToken = await jwt.sign({ ...data, kid: record._id }, record.privateKey, {
        algorithm: 'RS256',
        expiresIn: '1h'
    });
    return accessToken;
}


const generateAccessToken = async (userInfo) => {
    const record = await getNewestPrivateKey();
    return await createAccessToken(userInfo, record);
}


async function getNewestPrivateKey() {
    let newestRecord = await AsymmetricKeys.findOne({}).sort('-createdAt').exec();
    if (newestRecord) {
        return newestRecord;
    }
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs1', format: 'pem' }
    });

    const record = await insertKeyPairToDb(privateKey, publicKey);
    return record;
}

const insertKeyPairToDb = async (privateKey, publicKey) => {
    const newRecord = new AsymmetricKeys({
        _id: Guid.newGuid(),
        privateKey: privateKey,
        publicKey: publicKey,
        createdAt: Date.now()
    });
    await newRecord.save();

    const redisClient = await createClient()
        .on('error', err => console.log('Redis Client Error', err))
        .connect();

    await redisClient.set(newRecord._id, publicKey);
    await redisClient.disconnect();
    return newRecord;
}

const getPublicKeyFromCache = async (kid) => {
    const redisClient = await createClient()
        .on('error', err => console.log('Redis Client Error', err))
        .connect();

    const publicKey = await redisClient.get(kid);
    await redisClient.disconnect();
    return publicKey;
}
module.exports = {
    generateAccessToken,
    createAccessToken,
    getPublicKeyFromCache
}
