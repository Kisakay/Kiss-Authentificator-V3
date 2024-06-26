const serviceConfig = {
    port: 3030,
    url: "127.0.0.1",
    serviceName: "Example software name"
};

//---------------------------------------------------------
const readline = require('readline');
const process = require('process');
const fs = require('node:fs');
require('colors');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function ipify({ useIPv6 = true, endpoint } = {}) {
    const IPIFY_ENDPOINT_IPV4 = 'https://api.ipify.org';
    const IPIFY_ENDPOINT_IPV6 = 'https://api6.ipify.org';

    if (endpoint === undefined) {
        endpoint = useIPv6 ? IPIFY_ENDPOINT_IPV6 : IPIFY_ENDPOINT_IPV4;
    }

    try {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.text();
    } catch (error) {
        throw new Error(`Failed to fetch IP address: ${error.message}`);
    }
};

async function licenceChecker() {

    console.log('Checking if you are already activate the software...');

    let myip = await ipify({ useIPv6: false });

    if (!fs.existsSync("key.db")) {
        return get()
    } else {
        fs.readFile('key.db', 'utf8', (err, data) => {
            if (data) {
                let lines = data.split("\n");

                fetch(`http://${serviceConfig.url}:${serviceConfig.port}/api/json`, {
                    method: 'POST',
                    body: JSON.stringify({
                        adminKey: "unknow",
                        ip: myip,
                        key: lines[0],
                        tor: 'LOGIN_KEY'
                    }),
                    headers: { 'Content-type': 'application/json; charset=UTF-8' },
                })
                    .then((json) => {
                        var statussrv = json.title;

                        if (statussrv === 'Succeful') {
                            console.log(`Yeah, ${serviceConfig.serviceName} is activate !`.rainbow.bold)
                            console.log("-----> Starting The Software...".green.bold)
                            //starting ...
                            start()
                        } else {
                            if (statussrv === "Bad ip with your key !") {
                                start()
                            } else {
                                get()
                            }
                        }
                    })
                    .catch(error => {
                        console.log(error)
                    })
            };
        });
    }
}

licenceChecker()

async function get() {
    const myip = await ipify({ useIPv6: false });

    rl.question(`Hey, ${serviceConfig.serviceName} is not free ! Do you have key? If you here, i think is yes ! Type you key please :\n`.red + "key ~> ".blue, (answer) => {
        console.log('[API]'.green + ' >> Checking if your key is available'.yellow);

        fetch(`http://${serviceConfig.url}:${serviceConfig.port}/api/json`, {
            method: 'POST',
            body: JSON.stringify({
                adminKey: "unknow",
                ip: myip,
                key: answer,
                tor: 'LOGIN_KEY'
            }),
            headers: { 'Content-type': 'application/json; charset=UTF-8' },
        })
            .then((response) => response.json())
            .then((json) => {
                var statussrv = json.title;

                if (statussrv === 'Succeful') {
                    console.log(`Yeah, you just activate ${serviceConfig.serviceName}, gg !`.rainbow.bold)
                    //writing in db
                    fs.writeFile('key.db', `${answer}\nby Kisakay with <3`, function (err) {
                        if (err) throw err;
                        //the software :
                        start();
                    });
                }
                if (statussrv === "Your key is not unvailable !") {
                    console.log("No, this key is not correct ! Please contact support, if you don't have key !".red.bold);
                    process.exit(1);
                } else if (statussrv === "Bad ip with your key !") {
                    console.log("Your key is not associed to this ip ! Please disable your vpn or switch to classical connections !\nFor more informations please contact the support !\nIf you don't know, 1* Key is for 1* People !".red.bold)
                    process.exit(1);
                }
            })
            .catch(error => {
                console.log(error)
            })
    })
}

function start() {
    //Your Software Here :
}
//made by Kisakay