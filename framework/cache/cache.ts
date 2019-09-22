const config = require('../../application/config/cache.ts');
var AWS = require('aws-sdk');


AWS.config.update({
accessKeyId: 'foo',
secretAccessKey: 'foo',
region: "eu-central-1",
endpoint: "http://dynamodb:8000"
});

const docClient = new AWS.DynamoDB.DocumentClient();

export class Cache {

    private static tableName = 'cache';
    private static keyPrefix = 'cache-';

    public static remember(name, ttlInSeconds, callback) {
        return this.get(name)
            .then((data) => {
                if (data) {
                    return data;
                }

                const newData = callback();

                return this.put(name, ttlInSeconds, newData)
                    .then(() => {
                        return newData;
                    });
            })
            .catch((err) => {
                console.log('DynamoDB error', err);
            });
    }

    public static get(name) {
        const params = {
            TableName: this.tableName,
            Key: {'key': this.generateKey(name)}
        };

        return docClient.get(params).promise()
            .then((data) => {
                if (data.Item && data.Item.value) {
                    return data.Item.value;
                }
            });
    }

    public static put(name, ttlInSeconds, value) {
        const params = {
            TableName: this.tableName,
            Item: {
                'key': this.generateKey(name),
                'value': value,
                'ttl': Math.floor(Date.now() / 1000) + ttlInSeconds
            }
        };

        return docClient.put(params, value)
            .promise();
    }

    public static remove(name) {
        const params = {
            TableName: this.tableName,
            Key: {'key': this.generateKey(name)}
        };

        return docClient.delete(params).promise();
    }


    private static generateKey(name: string) {
        return this.keyPrefix + name;
    }
}