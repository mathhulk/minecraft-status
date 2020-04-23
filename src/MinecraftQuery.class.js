const dgram = require("dgram");

class MinecraftQuery {
	
	// Basic stat
	static query(host, port = 25565, callback, timeout = 3000) {
		
		let authenticated = false;
		
		let session = 0x00000001; 
		
		const client = dgram.createSocket("udp4");
		
		client.connect(port, host);
		
		let timeoutFunction = setTimeout( ( ) => {
			callback(new Error("The client timed out while connecting to " + host + ":" + port), null);
			
			client.close( );
		}, timeout, client);
		
		client.on("error", (error) => {
			callback(error, null);
			
			client.close( );
		});
		
		client.on("connect", ( ) => {
			let handshakeBuffer = Buffer.alloc(7);
			handshakeBuffer.writeUInt16BE(0xFEFD, 0); // Magic
			handshakeBuffer.writeUInt8(9, 2);         // Type
			handshakeBuffer.writeInt32BE(session, 3); // Session ID
			
			client.send(handshakeBuffer);
		});
		
		client.on("message", (responseBuffer, information) => {
			if(authenticated) {
				let responseData = responseBuffer.toString( ).split("\0");
				
				let result = {
					"players": {
						"online": responseData[7],
						"max": responseData[8]
					},
					"description": responseData[4],
					"map": responseData[6],
					"game_type": responseData[5]
				};
				
				clearTimeout(timeoutFunction);
				
				client.close( );
				
				return callback(null, result);
			}
			
			let token = parseInt( responseBuffer.toString("utf-8", 5) );
			
			let requestBuffer = Buffer.alloc(11);
			requestBuffer.writeUInt16BE(0xFEFD, 0); // Magic
			requestBuffer.writeUInt8(0, 2);         // Type
			requestBuffer.writeInt32BE(session, 3); // Session ID
			requestBuffer.writeInt32BE(token, 7);   // Token
			
			authenticated = true;
			
			client.send(requestBuffer);
		});
		
	}
	
	// Full stat
	static fullQuery(host, port = 25565, callback, timeout = 3000) {
		
		let authenticated = false;
		
		let session = 0x00000001; 
		
		const client = dgram.createSocket("udp4");
		
		client.connect(port, host);
		
		let timeoutFunction = setTimeout( ( ) => {
			callback(new Error("The client timed out while connecting to " + host + ":" + port), null);
			
			client.close( );
		}, timeout, client);
		
		client.on("error", (error) => {
			callback(error, null);
			
			client.close( );
		});
		
		client.on("connect", ( ) => {
			let handshakeBuffer = Buffer.alloc(7);
			handshakeBuffer.writeUInt16BE(0xFEFD, 0); // Magic
			handshakeBuffer.writeUInt8(9, 2);         // Type
			handshakeBuffer.writeInt32BE(session, 3); // Session ID
			
			client.send(handshakeBuffer);
		});
		
		client.on("message", (responseBuffer, information) => {
			if(authenticated) {
				let responseData = responseBuffer.toString("utf-8", 16).split("\x00\x01player_\x00\x00");
				
				let data = responseData[0].split("\0");
				data.splice(data.length - 1, 1);
			
				let players = responseData[1].split("\0");
				players.splice(players.length - 2);
				
				let serverModification = data[9].split(": ");
				
				let plugins = [ ];
				
				serverModification[1].split("; ").forEach( (value) => {
					let plugin = value.split(" ");
			
					plugins.push({ "name": plugin[0], "version": plugin[1] });
				});
				
				let result = {
					"version": {
						"name": data[7]
					},
					"players": {
						"online": data[13],
						"max": data[15],
						"sample": players
					},
					"description": data[1],
					"map": data[11],
					"game_type": data[3],
					"game_id": data[5],
					"server_modification": {
						"name": serverModification[0],
						"plugins": plugins
					}
				};
				
				clearTimeout(timeoutFunction);
				
				client.close( );
				
				return callback(null, result);
			}
			
			let token = parseInt( responseBuffer.toString("utf-8", 5) );
			
			let requestBuffer = Buffer.alloc(15);
			requestBuffer.writeUInt16BE(0xFEFD, 0); // Magic
			requestBuffer.writeUInt8(0, 2);         // Type
			requestBuffer.writeInt32BE(session, 3); // Session ID
			requestBuffer.writeInt32BE(token, 7);   // Token
			requestBuffer.writeUInt32BE(0, 11);     // Padding
			
			authenticated = true;
			
			client.send(requestBuffer);
		});
		
	}
	
}

module.exports = MinecraftQuery;