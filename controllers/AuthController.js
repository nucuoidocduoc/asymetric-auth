
const projectId = 'folkloric-light-361907';
const locationId = 'us-east1';
const keyRingId = 'my-key-ring';
const keyId = 'testKey';
const versionId = '1';
const data = {
    "iss": "https://example.auth0.com/",
    "aud": "https://api.example.com/calendar/v1/",
    "sub": "usr_123",
    "scope": "read write",
    "iat": 1458785796,
    "exp": 1458872196
};
const payload = Buffer.from(JSON.stringify(data));
class AuthController {
    static async authorizeByCredentials(ctx) {


        try {
            const { KeyManagementServiceClient } = require('@google-cloud/kms');
            const client = new KeyManagementServiceClient();
            const versionName = client.cryptoKeyVersionPath(
                projectId,
                locationId,
                keyRingId,
                keyId,
                versionId
            );

            const crypto = require('crypto');
            const hash = crypto.createHash('sha256');
            hash.update(payload);
            const digest = hash.digest();

            const [signResponse] = await client.asymmetricSign({
                name: versionName,
                digest: {
                    sha256: digest,
                }
            });
            const siganture = signResponse.signature.toString('base64');
            const header = Buffer.from(JSON.stringify({
                "alg": "RS256",
                "typ": "JWT"
            })).toString('base64');

            const body = payload.toString('base64');

            ctx.body = {
                token: `${header}.${body}.${siganture}`
            };
        }
        catch (err) {
            console.log(err);
        }
    }

    static async getPublicKey(ctx) {
        const signatureBuffer = Buffer.from(ctx.request.body.signature, 'base64');

        const { KeyManagementServiceClient } = require('@google-cloud/kms');
        const client = new KeyManagementServiceClient();

        const versionName = client.cryptoKeyVersionPath(
            projectId,
            locationId,
            keyRingId,
            keyId,
            versionId
        );

        const [publicKey] = await client.getPublicKey({
            name: versionName,
        });

        const crypto = require('crypto');
        const verify = crypto.createVerify('sha256');
        verify.update(payload);
        verify.end();

        const verified = verify.verify({
            key: publicKey.pem,
        }, signatureBuffer);
    }

}

module.exports = AuthController;