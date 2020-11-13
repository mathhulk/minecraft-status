# minecraft-status
Node.js module for gathering information about Minecraft Java Edition servers and Minecraft Bedrock Edition servers.

**minecraft-status** was based off of [mc-ping-updated](https://github.com/Cryptkeeper/mc-ping-updated), [mc-stat](https://github.com/winny-/mcstat), and [mcpe-ping](https://github.com/falkirks/mcpe-ping).

**minecraft-status** supports the [Server List Ping](https://wiki.vg/Server_List_Ping) protocol for Minecraft Java Edition servers on Minecraft versions 1.7 and above (current), [1.6](https://wiki.vg/Server_List_Ping#1.6), and [1.4 through 1.5](https://wiki.vg/Server_List_Ping#1.4_to_1.5), and [Beta 1.8 through 1.3](https://wiki.vg/Server_List_Ping#Beta_1.8_to_1.3) and the [Query](https://wiki.vg/Server_List_Ping) protocol for Minecraft Java Edition servers on Minecraft versions 1.9pre4 and above.

Support for Minecraft Bedrock Edition servers should be implemented soon™️.

## Documentation
Include **minecraft-status** in your project like so.
```js
// MinecraftServerListPing (either)
const { MinecraftServerListPing } = require("minecraft-status");
const MinecraftServerListPing = require("minecraft-status").MinecraftServerListPing;

// MinecraftQuery (either)
const { MinecraftQuery } = require("minecraft-status");
const MinecraftQuery = require("minecraft-status").MinecraftQuery;

// Both
const { MinecraftServerListPing, MinecraftQuery } = require("minecraft-status");
```
For more information on the [Server List Ping](https://wiki.vg/Server_List_Ping) or [Query](https://wiki.vg/Server_List_Ping) protocols, consult [wiki.vg](https://wiki.vg/).

Unlike previous versions of **minecraft-status**, functions use promises rather than callback functions.
```js
MinecraftServerListPing.ping(4, "mc.hypixel.net", 25565, 3000)
.then(response => {
    // Success
})
.catch(error => {
    // Error
});
```

## [Server List Ping](https://wiki.vg/Server_List_Ping)
### 1.7 and above (current)
```js
MinecraftServerListPing.ping(protocol, host, port, timeout)
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

### 1.6
```js
MinecraftServerListPing.ping16(protocol, host, port, timeout)
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

### 1.4 through 1.5
```js
MinecraftServerListPing.ping15(host, port, timeout)
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

### Beta 1.8 through 1.3
```js
MinecraftServerListPing.ping13(host, port, timeout)
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

## [Query](https://wiki.vg/Query)
The following must be configured in the `server.properties` file.
```
enable-query=true
query.port=<1-65535>
```
The default query port matches the port established in `server-port`.

### Basic stat
```js
MinecraftQuery.query(host, port, timeout)
```
`host` The host, or the domain name, IPv4, or IPv6 address, of the server.

`port` Default **25565**. The port of the server.

`callback(error, response)`

`timeout` Default **3000**. Milliseconds.

```json
{
    "players": { 
        "online": 5, 
        "max": 100 
    },
    "description": "\u0001A Minecraft Server",
    "map": "world",
    "game_type": "SMP"
}
```

### Full stat
```js
MinecraftQuery.fullQuery(host, port, timeout)
```
`host` The host, or the domain name, IPv4, or IPv6 address, of the server.

`port` Default **25565**. The port of the server.

`callback(error, response)`

`timeout` Default **3000**. Milliseconds.

```json
{
    "version": {
        "name": "1.15.2"
    },
    "players": { 
        "online": 1, 
        "max": 20,
        "sample": [
            "mathhulk"
        ]
    },
    "description": "A Minecraft Server",
    "map": "world",
    "game_type": "SMP",
    "game_id": "MINECRAFT",
    "server_modification": {
        "name": "Paper on 1.15.2-R0.1-SNAPSHOT",
        "plugins": [
            "SimpleTpa 3.0"
        ]
    }
}
```
