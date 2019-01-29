let network_index = 0;
let last_updated = 0;
let networks = [
    'wss://ropsten.infura.io/ws',
    'wss://mainnet.infura.io/ws',
    'wss://rinkeby.infura.io/ws',
    'wss://kovan.infura.io/ws'
];

let ws_service = new (require('./ws_service'))(8080);
ws_service.handleEvents();
let addresses = [];
init();

// 0x8f0018fbca00f2f2ab6b445f26df534367c496a0

function init() {
    let web3_service = new (require('./web3_service'))(networks[network_index]);
    web3_service.handleEvents(() => {
        console.log("Successfully connected to Web3 Provider");

        web3_service.subscribe_pendingTransactions((event_name, event_data) => {
            if (event_name !== null) {
                let object = {
                    event_name,
                    event_data
                };
                last_updated = Date.now();
                ws_service.broadcast(object);
            }
        });

        web3_service.subscribe_newBlockHeaders((event_name, event_data) => {
            if (event_name !== null) {
                let object = {
                    event_name,
                    event_data
                };
                last_updated = Date.now();
                ws_service.broadcast(object);
            }
        });

        web3_service.DeviceAdd(contract_address => {
            if (addresses.indexOf(contract_address) === -1) {
                addresses.push(contract_address);
            }

            let object = {
                event_name: 'updateAddresses',
                event_data: addresses
            };
            ws_service.broadcast(object);
        });
    });
}

function hopNetworks() {
    console.log("Web3 provider - hoping networks");
    network_index++;
    if (network_index === networks.length) {
        network_index = 0;
    }
    console.log("Current network: " + networks[network_index]);
    init();
}

setInterval(() => {
    let diff = Date.now() - last_updated;
    let seconds = Math.floor(diff / 1000);
    if (seconds >= 60 * 2) {
        hopNetworks();
    }
}, 60 * 5 * 1000);

function setRopsten() {
    if (network_index !== 0) {
        network_index = 0;
        console.log(`Changed networks by force to ${networks[network_index]}`);
        init();
    }
}

setInterval(() => {
    setRopsten();
}, 60 * 20 * 1000);

setInterval(() => {
    let n = networks[network_index];
    let n2 = n.replace('wss://', '')
    let n3 = n2.replace('.infura.io/ws', '');
    let object = {
        event_name: "hopNetworks",
        event_data: n3
    };
    ws_service.broadcast(object);
}, 5 * 1000);


setInterval(() => {
    let object = {
        event_name: 'updateAddresses',
        event_data: addresses
    };
    ws_service.broadcast(object);
}, 5 * 1000);