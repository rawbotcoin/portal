const Web3 = require('web3');
var io = require('socket.io')();

let networks = [
    'wss://ropsten.infura.io/ws',
    'wss://rinkeby.infura.io/ws',
    'wss://kovan.infura.io/ws',
    'wss://mainnet.infura.io/ws'
];

let network_index = 0;
let last_time_updated = 0;
let provider = new Web3.providers.WebsocketProvider(networks[network_index]);
let web3 = new Web3(provider);

provider.on('connect', () => {
    subscribeAll();
});

provider.on('error', e => console.error(e));
provider.on('end', () => {
    hopNetworks();
});


setInterval(() => {
    let diff = Date.now() - last_time_updated;
    let seconds = Math.floor(diff / 1000);
    if (seconds >= 60 * 2) {
        hopNetworks();
    }
}, 60 * 2 * 1000);

function hopNetworks() {
    console.log("Hoping networks");
    network_index++;
    if (network_index === networks.length) {
        network_index = 0;
    }
    web3 = new Web3(provider);
    console.log("Current network: " + networks[network_index]);
    subscribeAll();
}


let getTransaction = (transaction) => {
    return new Promise((resolve, reject) => {
        web3.eth.getTransaction(transaction, (err, result) => {
            if (err) {
                return reject(err);
            } else {
                return resolve(result);
            }
        });
    });
};

let getBlockTransactionCount = function (number) {
    return new Promise((resolve, reject) => {
        web3.eth.getBlockTransactionCount(number, function (err, object) {
            if (err) {
                return reject(err);
            } else {
                return resolve(object);
            }
        });
    })
};

subscribe_pendingTransactions = function () {
    web3.eth.subscribe('pendingTransactions', async (error, result) => {
        if (error) {
            return;
        }
        try {
            let txObject = await getTransaction(result);
            io.emit('pendingTransactions', txObject);
            last_time_updated = Date.now();
        } catch (e) {
            console.log(e)
        }
    });
};

subscribe_newBlockHeaders = function () {
    web3.eth.subscribe('newBlockHeaders', async (error, blockHeader) => {
        if (error) {
            return;
        }
        try {
            let number = await getBlockTransactionCount(blockHeader.number);
            io.emit('newBlockHeaders', number);
            last_time_updated = Date.now();
        } catch (e) {
            console.log(e);
        }
    })
};

function subscribeAll() {
    setTimeout(() => {
        let network_name = networks[network_index].replace('wss://', '').replace('.infura.io/ws', '');
        io.emit('hopNetworks', network_name);
        subscribe_pendingTransactions();
        subscribe_newBlockHeaders();
    }, 2500);
}

setInterval(() => {
    let network_name = networks[network_index].replace('wss://', '').replace('.infura.io/ws', '');
    io.emit('hopNetworks', network_name);
}, 5000);

function sendFakeTx() {
    let tx = {
        blockHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
        blockNumber: null,
        from: "0x1d76b2CDF8964d1f9bC5D22625A00586839dAcc4",
        gas: 4000000,
        gasPrice: "12000000000",
        hash: "0xa74861e7b14354f11b5e31cde4b5ed85db33b60c563d123126537580856569b8",
        input: "0xa69beaba142125e3229b3cc3ae8e4884c11861164297c14dc4ec4243dffc47a99608af05",
        nonce: 4395,
        r: "0x92546ad2ac3ab53e9fe9ca23824c7d54fdc6b4a2451dc08d377cb182e6ca14ee",
        s: "0x1369b367312da9ea6f41d0a6002421f963b2b814bbad2e3591f37dc5105d372b",
        to: "0xd41b66a9d95d1b372d8985950255ecfddbd4c5db",
        transactionIndex: 0,
        v: "1e18",
        value: "0"
    }
    io.emit('pendingTransactions', tx);
}

setInterval(() => {
    sendFakeTx();
}, 60 * 2 * 1000);


let _clientKey = 'RawbotR1';
io.on('connection', (client) => {
    client.on('connected', function (data) {
        console.log(`${client.id} just joined ${data.clientKey}`);
        let clientKey = data.clientKey;
        client.join(clientKey);
    });
    client.on('disconnect', function (data) {
        console.log(`${client.id} just left - reason: ${data}`);
        client.leave(_clientKey);
    });
});

io.listen(8080);