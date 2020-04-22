# minecraft-status
Node.js module for gathering information about Minecraft Java Edition servers and Minecraft Bedrock Edition servers.

**minecraft-status** was based off of [mc-ping-updated](https://github.com/Cryptkeeper/mc-ping-updated), [mc-stat](https://github.com/winny-/mcstat), and [mcpe-ping](https://github.com/falkirks/mcpe-ping).

At the moment, **minecraft-status** supports the [Server List Ping](https://wiki.vg/Server_List_Ping) protocol for Minecraft Java Edition servers on Minecraft versions 1.7 and above (current), [1.6](https://wiki.vg/Server_List_Ping#1.6), and [1.4 through 1.5](https://wiki.vg/Server_List_Ping#1.4_to_1.5), and [Beta 1.8 through 1.3](https://wiki.vg/Server_List_Ping#Beta_1.8_to_1.3).

Support for the [Query](https://wiki.vg/Server_List_Ping) protocol for Minecraft Java Edition servers on Minecraft versions 1.9pre4 and above and for Minecraft Bedrock Edition servers should be implemented soon™️.

## Documentation
Because **minecraft-status** only supports the [Server List Ping](https://wiki.vg/Server_List_Ping) protocol at the moment, include **minecraft-status** in your project like so.
```js
const MinecraftServerListPing = require("minecraft-status");
```
For more information on the [Server List Ping](https://wiki.vg/Server_List_Ping) protocol, including a more detailed explanation of the responses listed below, consult [wiki.vg](https://wiki.vg/Server_List_Ping).

## 1.7 and above (current)
```js
MinecraftServerListPing.ping(protocol, host, port, callback, timeout);
``` 
`protocol` Default **4**. See [protocol version numbers](https://wiki.vg/Protocol_version_numbers). The version the client uses to connect to the server.

`host` The host, or the domain name, IPv4, or IPv6 address, of the server.

`port` Default **25565**. The port of the server.

`callback(error, response)`

`timeout` Default **3000**. Milliseconds.

```json
{
    "version": {
        "name": "1.8.7",
        "protocol": 47
    },
    "players": {
        "max": 100,
        "online": 5,
        "sample": [
            {
                "name": "thinkofdeath",
                "id": "4566e69f-c907-48ee-8d71-d7ba5aa00d20"
            }
        ]
    },	
    "description": {
        "text": "Hello world"
    },
    "favicon": "data:image/png;base64,<data>"
}
```

## 1.6
```js
MinecraftServerListPing.ping16(protocol, host, port, callback, timeout);
``` 
`protocol` Default **73**. See [protocol version numbers](https://wiki.vg/Protocol_version_numbers). The version the client uses to connect to the server.

`host` The host, or the domain name, IPv4, or IPv6 address, of the server.

`port` Default **25565**. The port of the server.

`callback(error, response)`

`timeout` Default **3000**. Milliseconds.

```json
{
    "version": {
        "name": "1.6.4",
        "protocol": 78
    },
    "players": {
        "max": 100,
        "online": 5
    },	
    "description": "A Minecraft Server"
}
```

## 1.4 through 1.5
```js
MinecraftServerListPing.ping15(host, port, callback, timeout);
``` 
`host` The host, or the domain name, IPv4, or IPv6 address, of the server.

`port` Default **25565**. The port of the server.

`callback(error, response)`

`timeout` Default **3000**. Milliseconds.

```json
{
    "version": {
        "name": "1.4.7",
        "protocol": 51
    },
    "players": {
        "max": 100,
        "online": 5
    },	
    "description": "A Minecraft Server"
}
```

## Beta 1.8 through 1.3
```js
MinecraftServerListPing.ping13(host, port, callback, timeout);
``` 
`host` The host, or the domain name, IPv4, or IPv6 address, of the server.

`port` Default **25565**. The port of the server.

`callback(error, response)`

`timeout` Default **3000**. Milliseconds.

```json
{
    "players": {
        "max": 100,
        "online": 5
    },	
    "description": "A Minecraft Server"
}
```
