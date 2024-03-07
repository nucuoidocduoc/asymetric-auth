const { Schema, model } = require('mongoose');
const asymmetricKeysSchema = new Schema({
    _id: Schema.Types.UUID,
    privateKey: Schema.Types.String,
    publicKey: Schema.Types.String,
    createdAt: Schema.Types.Date
});

const AsymmetricKeys = model('AsymmetricKeys', asymmetricKeysSchema);
module.exports = AsymmetricKeys;