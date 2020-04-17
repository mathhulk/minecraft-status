const net = require("net");
const MinecraftBuffer = require("./MinecraftBuffer");

class MinecraftServerListPing {
	
	static ping(protocol = 4, host, port = 25565, callback, timeout = 3000) {
		
		let dataBuffer = Buffer.alloc(0);
		
		const client = net.createConnection(port, host);
		
		client.setTimeout(timeout);
		
		client.on("timeout", (hadError) => {
			callback(new Error("The client timed out while connecting to " + host + ":" + port + "."), null);
			
			client.destroy( );
		});
		
		client.on("error", (error) => {
			callback(error, null);
		});
		
		client.on("connect", ( ) => {
			let handshakeBuffer = new MinecraftBuffer( );

			handshakeBuffer.writeVarInt(0); // Packed ID
			handshakeBuffer.writeVarInt(protocol); // Protocol Version
			handshakeBuffer.writeString(host); // Server Address
			handshakeBuffer.writeUShort(port); // Server Port
			handshakeBuffer.writeVarInt(1); // Next state

			client.write( handshakeBuffer.pack( ) );

			let statusRequestBuffer = new MinecraftBuffer( );

			statusRequestBuffer.writeVarInt(0);
			
			client.write( statusRequestBuffer.pack( ) );
		});
		
		client.on("data", (data) => {
			dataBuffer = Buffer.concat([dataBuffer, data]);

			let buffer = new MinecraftBuffer(dataBuffer);
			let length;

			try {
				length = buffer.readVarInt( );
			} catch(error) {
				return;
			}

			if(dataBuffer.length < length - buffer.offset ) {
				return;
			}

			buffer.readVarInt( );

			try {
				let response = JSON.parse( buffer.readString( ) );

				callback(null, response);
			} catch(error) {
				callback(error, null);
			}
			
			client.end( );
		});
		
	}
	
	/*
	static pingLegacy(protocol = 73, host, port = 25565, callback, timeout = 3000) {
		
		const client = net.createConnection(port, host);
		
		client.setTimeout(timeout);
		
		client.on("timeout", (hadError) => {
			callback(new Error("The client timed out while connecting to " + host + ":" + port + "."), null);
			
			client.destroy( );
		});
		
		client.on("error", (error) => {
			callback(error, null);
		});
		
		client.on("connect", ( ) => {
			let request = "";
			
			// FE: packet identifier for a server list ping
			// 01: server list ping's payload (always 1)
			request += String.fromCharCode(0xfe01 >> 8 & 0xFF)
			request += String.fromCharCode(0xfe01 & 0xFF);
				
			// FA: packet identifier for a plugin message
			request += String.fromCharCode(0xfa);
				
			// 00 0B: length of following string, in characters, as a short (always 11)
			request += String.fromCharCode(11 >> 8 & 0xFF);
			request += String.fromCharCode(11 & 0xFF);
			
			// 00 4D 00 43 00 7C 00 50 00 69 00 6E 00 67 00 48 00 6F 00 73 00 74: the string MC|PingHost encoded as a UTF-16BE string
			request += "MC|PingHost";
			
			// length of the rest of the data, as a short. Compute as 7 + len(hostname), where len(hostname) is the number of bytes in the UTF-16BE encoded hostname
			request += String.fromCharCode( (7 + 2 * host.length) >> 8 & 0xFF );
			request += String.fromCharCode( (7 + 2 * host.length) & 0xFF );
			
			// protocol version
			request += String.fromCharCode(74);
				
			// 00 0B: length of following string, in characters, as a short (always 11)
			request += String.fromCharCode(host.length >> 8 & 0xFF);
			request += String.fromCharCode(host.length & 0xFF);
			
			// hostname the client is connecting to, encoded as a UTF-16BE string
			request += host;
			
			// port the client is connecting to, as an int
			request += String.fromCharCode(port >> 24 & 0xFF)
			request += String.fromCharCode(port >> 16 & 0xFF)
			request += String.fromCharCode(port >> 8 & 0xFF)
			request += String.fromCharCode(port & 0xFF)

			client.write( request );
		});
		
		client.on("data", (data) => {
			console.log(data);
		});
		
	}
	*/
	
}

module.exports = MinecraftServerListPing;