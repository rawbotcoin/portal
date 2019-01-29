const Web3 = require('web3');

class Web3Service {

    constructor(ws_endpoint) {
        this.ws_endpoint = ws_endpoint;
        this.provider = new Web3.providers.WebsocketProvider(this.ws_endpoint);
        this.web3 = new Web3(this.provider);

        this.DEVICE_SPAWNER = new this.web3.eth.Contract(require('./DeviceSpawner.json').abi, '0x8f0018fbca00f2f2ab6b445f26df534367c496a0', {
            gasLimit: 3000000
        });
    }

    DeviceAdd(callback) {
        this.DEVICE_SPAWNER.events.DeviceAdd({
            fromBlock: 0, toBlock: 'latest'
        }, function (error, event) {
            if (!error) {
                return callback(event['returnValues']['_contract']);
            }
        })
            .on('data', function (event) {

            })
            .on('changed', function (event) {
                // return callback(null, 'changed', event);
            })
            .on('error', function (error) {
                // return callback(error, 'error', null);
            });
    };

    renewInstances(callback) {
        console.log("Renewing Web3 service instances.");
        this.provider = new Web3.providers.WebsocketProvider(this.ws_endpoint);
        this.web3 = new Web3(this.provider);
        callback();
    }

    subscribe_pendingTransactions(callback) {
        this.web3.eth.subscribe('pendingTransactions', (error, result) => {
            if (error) {
                return callback(null, null);
            }
            this.web3.eth.getTransaction(result, (err, txObject) => {
                if (err) {
                    return callback(null, null);
                }
                if (typeof txObject !== "undefined" && txObject !== null) {
                    return callback('pendingTransactions', txObject);
                }
            });
        });
    };

    subscribe_newBlockHeaders(callback) {
        this.web3.eth.subscribe('newBlockHeaders', (error, blockHeader) => {
            if (error) {
                return callback(null, null);
            }
            this.web3.eth.getBlockTransactionCount(blockHeader.number, function (err, number) {
                if (err) {
                    return callback(null, null);
                }
                return callback('newBlockHeaders', number);
            });
        });
    }

    handleEvents(callback) {
        this.provider.on('connect', () => {
            callback();
        });

        this.provider.on('error', e => console.error(e));
        this.provider.on('end', () => {
            this.renewInstances(callback);
        });
    }
}

module.exports = Web3Service;