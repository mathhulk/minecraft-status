const net = require("net");
const iconv = require("iconv-lite");
const varint = require("varint");

class MinecraftServerListPing {
	
	static ping(protocol = 4, host, port = 25565, callback, timeout = 3000) {
		
		let responseDataBuffer = Buffer.alloc(0);
		
		const client = net.createConnection(port, host);
		
		client.setTimeout(timeout);
		
		client.on("timeout", (hadError) => {
			callback(new Error("The client timed out while connecting to " + host + ":" + port), null);
			
			client.destroy( );
		});
		
		client.on("error", (error) => {
			callback(error, null);
		});
		
		client.on("connect", ( ) => {
			// Packet ID
			let packetBuffer = Buffer.from([0x00]);
			
			// Protocol Version
			let protocolBuffer = Buffer.from( varint.encode(protocol) );
			
			// Server Address
			let hostLengthBuffer = Buffer.from( varint.encode(host.length) );
			let hostBuffer = Buffer.from(host);
			
			// Server Port
			let portBuffer = Buffer.alloc(2);
			portBuffer.writeUInt16BE(port);
			
			// Next state
			let stateBuffer = Buffer.from([0x01]);
			
			let dataBuffer = Buffer.concat([packetBuffer, protocolBuffer, hostLengthBuffer, hostBuffer, portBuffer, stateBuffer]);
			let dataLengthBuffer = Buffer.from( varint.encode(dataBuffer.length) );
			
			let handshakeBuffer = Buffer.concat([dataLengthBuffer, dataBuffer]);
			
			client.write( handshakeBuffer );
			
			let requestBuffer = Buffer.from([0x01, 0x00]);
			
			client.write( requestBuffer );
		});
		
		client.on("data", (responseBuffer) => {
			responseDataBuffer = Buffer.concat([responseDataBuffer, responseBuffer]);
			
			let responseDataBufferLength;

			try {
				responseDataBufferLength = varint.decode(responseDataBuffer);
			} catch(error) {
				return;
			}

			if(responseDataBufferLength.length < responseDataBufferLength - varint.decode.bytes) {
				return;
			}
			
			let offset = varint.decode.bytes;
			varint.decode(responseDataBuffer, offset); // Packet ID
			offset += varint.decode.bytes;
			varint.decode(responseDataBuffer, offset); // JSON Length
			offset += varint.decode.bytes;

			try {
				let response = JSON.parse( responseDataBuffer.toString("utf-8", offset) );

				callback(null, response);
			} catch(error) {
				callback(error, null);
			}
			
			client.end( );
		});
		
	}
	
	// 1.6
	static ping16(protocol = 73, host, port = 25565, callback, timeout = 3000) {
		
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
			// FE — packet identifier for a server list ping
			// 01 — server list ping's payload (always 1)
			// FA — packet identifier for a plugin message
			// 00 0B — length of following string, in characters, as a short (always 11)
			// 00 4D 00 43 00 7C 00 50 00 69 00 6E 00 67 00 48 00 6F 00 73 00 74 — the string MC|PingHost encoded as a UTF-16BE string
			let requestBuffer = Buffer.from([0xFE, 0x01, 0xFA, 0x00, 0x0B, 0x00, 0x4D, 0x00, 0x43, 0x00, 0x7C, 0x00, 0x50, 0x00, 0x69, 0x00, 0x6E, 0x00, 0x67, 0x00, 0x48, 0x00, 0x6F, 0x00, 0x73, 0x00, 0x74]);
			
			// length of the rest of the data, as a short. Compute as 7 + len(hostname), where len(hostname) is the number of bytes in the UTF-16BE encoded hostname
			let dataLengthBuffer = Buffer.alloc(2);
			dataLengthBuffer.writeUInt16BE(7 + 2 * host.length);
			
			// protocol version
			let protocolBuffer = Buffer.alloc(1);
			protocolBuffer.writeUInt8(protocol);
			
			// length of following string, in characters, as a short
			let stringLengthBuffer = Buffer.alloc(2);
			stringLengthBuffer.writeUInt16BE(host.length);
			
			// hostname the client is connecting to, encoded as a UTF-16BE string
			let hostBuffer = iconv.encode(host, "utf16-be");
			
			// port the client is connecting to, as an int
			let portBuffer = Buffer.alloc(4);
			portBuffer.writeUInt32BE(port);
			
			requestBuffer = Buffer.concat([requestBuffer, dataLengthBuffer, protocolBuffer, stringLengthBuffer, hostBuffer, portBuffer]);
				
			client.write(requestBuffer);
		});
		
		client.on("data", (responseBuffer) => {
			let dataBuffer = iconv.decode(responseBuffer.slice(9, responseBuffer.length), "utf-16be");
			
			let data = dataBuffer.toString( ).split("\0");
			
			let result = {
				"version": {
					"name": data[1],
					"protocol": data[0]
				},
				"players": {
					"max": data[4],
					"online": data[3]
				},
				"description": data[2]
			};
			
			callback(null, result);
		});
		
	}
	
	// 1.4 to 1.5
	static ping15(host, port = 25565, callback, timeout = 3000) {
		
		const client = net.createConnection(port, host);
		
		client.setTimeout(timeout);
		
		client.on("timeout", (hadError) => {
			callback(new Error("The client timed out while connecting to " + host + ":" + port), null);
			
			client.destroy( );
		});
		
		client.on("error", (error) => {
			callback(error, null);
		});
		
		client.on("connect", ( ) => {
			let requestBuffer = Buffer.from([0xFE, 0x01]);
				
			client.write(requestBuffer);
		});
		
		client.on("data", (responseBuffer) => {
			let dataBuffer = iconv.decode(responseBuffer.slice(9, responseBuffer.length), "utf-16be");
			
			let data = dataBuffer.toString( ).split("\0");
			
			let result = {
				"version": {
					"name": data[1],
					"protocol": data[0]
				},
				"players": {
					"max": data[4],
					"online": data[3]
				},
				"description": data[2]
			};
			
			callback(null, result);
		});
		
	}
	
	// Beta 1.8 to 1.3
	static ping13(host, port = 25565, callback, timeout = 3000) {
		
		const client = net.createConnection(port, host);
		
		client.setTimeout(timeout);
		
		client.on("timeout", (hadError) => {
			callback(new Error("The client timed out while connecting to " + host + ":" + port), null);
			
			client.destroy( );
		});
		
		client.on("error", (error) => {
			callback(error, null);
		});
		
		client.on("connect", ( ) => {
			let requestBuffer = Buffer.from([0xFE]);
				
			client.write(requestBuffer);
		});
		
		client.on("data", (responseBuffer) => {
			let dataBuffer = iconv.decode(responseBuffer.slice(9, responseBuffer.length), "utf-16be");
			
			let data = dataBuffer.toString( ).split("\0");
			
			let result = {
				"players": {
					"max": data[4],
					"online": data[3]
				},
				"description": data[2]
			};
			
			callback(null, result);
		});
		
	}
	
}

module.exports = MinecraftServerListPing;