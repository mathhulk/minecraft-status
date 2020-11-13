const net = require("net");
const iconv = require("iconv-lite");
const varint = require("varint");

/*
 *	Server List Ping
 *	https://wiki.vg/Server_List_Ping
 *
 */
class MinecraftServerListPing {

	/*
	 *	Current
	 *	https://wiki.vg/Server_List_Ping#Current
	 *
	 */
	static ping(protocol = 4, host, port = 25565, timeout = 3000) {
		return new Promise( (resolve, reject) => {
			const client = net.createConnection(port, host);

			client.setTimeout(timeout);

			client.on("timeout", (/* error */) => {
				client.destroy( );

				reject( new Error("The client timed out while connecting to " + host + ":" + port) );
			});

			client.on("error", (error) => {
				reject(error);
			});

			client.on("connect", ( ) => {
				// Packet ID
				const packetBuffer = Buffer.from([0x00]);

				// Protocol Version
				const protocolBuffer = Buffer.from( varint.encode(protocol) );

				// Server Address
				const hostLengthBuffer = Buffer.from( varint.encode(host.length) );
				const hostBuffer = Buffer.from(host);

				// Server Port
				const portBuffer = Buffer.alloc(2);
				portBuffer.writeUInt16BE(port);

				// Next state
				const stateBuffer = Buffer.from([0x01]);

				// Handshake
				const dataBuffer = Buffer.concat([packetBuffer, protocolBuffer, hostLengthBuffer, hostBuffer, portBuffer, stateBuffer]);
				const dataLengthBuffer = Buffer.from( varint.encode(dataBuffer.length) );

				const handshakeBuffer = Buffer.concat([dataLengthBuffer, dataBuffer]);
				client.write(handshakeBuffer);

				// Request
				const requestBuffer = Buffer.from([0x01, 0x00]);
				client.write(requestBuffer);
			});

			// Response
			let responseDataBuffer = Buffer.alloc(0);

			client.on("data", (responseBuffer) => {
				responseDataBuffer = Buffer.concat([responseDataBuffer, responseBuffer]);

				let responseDataBufferLength;

				// Error: Invalid
				try {
					responseDataBufferLength = varint.decode(responseDataBuffer);
				} catch(error) {
					return;
				}

				// Error: Too short
				if(responseDataBuffer.length < responseDataBufferLength - varint.decode.bytes) return;

				let offset = varint.decode.bytes;

				// Packet ID
				varint.decode(responseDataBuffer, offset);
				offset += varint.decode.bytes;

				// JSON Length
				varint.decode(responseDataBuffer, offset);
				offset += varint.decode.bytes;

				try {
					const response = JSON.parse( responseDataBuffer.toString("utf-8", offset) );

					resolve(response);
				} catch(error) {
					reject(error);
				}

				client.end( );
			});
		});
	}

	/*
	 *	1.6
	 *	https://wiki.vg/Server_List_Ping#1.6
	 *
	 */
	static ping16(protocol = 73, host, port = 25565, timeout = 3000) {
		return new Promise( (resolve, reject) => {
			const client = net.createConnection(port, host);

			client.setTimeout(timeout);

			client.on("timeout", (/* error */) => {
				client.destroy( );

				reject( new Error("The client timed out while connecting to " + host + ":" + port + ".") );
			});

			client.on("error", (error) => {
				reject(error);
			});

			client.on("connect", ( ) => {
				// FE — packet identifier for a server list ping
				// 01 — server list ping's payload (always 1)
				// FA — packet identifier for a plugin message
				// 00 0B — length of following string, in characters, as a short (always 11)
				// 00 4D 00 43 00 7C 00 50 00 69 00 6E 00 67 00 48 00 6F 00 73 00 74 — the string MC|PingHost encoded as a UTF-16BE string
				let requestBuffer = Buffer.from([0xFE, 0x01, 0xFA, 0x00, 0x0B, 0x00, 0x4D, 0x00, 0x43, 0x00, 0x7C, 0x00, 0x50, 0x00, 0x69, 0x00, 0x6E, 0x00, 0x67, 0x00, 0x48, 0x00, 0x6F, 0x00, 0x73, 0x00, 0x74]);

				// length of the rest of the data, as a short. Compute as 7 + len(hostname), where len(hostname) is the number of bytes in the UTF-16BE encoded hostname
				const dataLengthBuffer = Buffer.alloc(2);
				dataLengthBuffer.writeUInt16BE(7 + 2 * host.length);

				// protocol version
				const protocolBuffer = Buffer.alloc(1);
				protocolBuffer.writeUInt8(protocol);

				// length of following string, in characters, as a short
				const stringLengthBuffer = Buffer.alloc(2);
				stringLengthBuffer.writeUInt16BE(host.length);

				// hostname the client is connecting to, encoded as a UTF-16BE string
				const hostBuffer = iconv.encode(host, "utf16-be");

				// port the client is connecting to, as an int
				const portBuffer = Buffer.alloc(4);
				portBuffer.writeUInt32BE(port);

				// Request
				requestBuffer = Buffer.concat([requestBuffer, dataLengthBuffer, protocolBuffer, stringLengthBuffer, hostBuffer, portBuffer]);
				client.write(requestBuffer);
			});

			// Response
			client.on("data", (responseBuffer) => {
				const dataBuffer = iconv.decode(responseBuffer.slice(9, responseBuffer.length), "utf-16be");
				const data = dataBuffer.toString( ).split("\0");

				resolve({
					"version": {
						"name": data[1],
						"protocol": parseInt(data[0])
					},
					"players": {
						"max": parseInt(data[4]),
						"online": parseInt(data[3])
					},
					"description": data[2]
				});
			});
		});
	}

	/*
	 *	1.4 to 1.5
	 *	https://wiki.vg/Server_List_Ping#1.4_to_1.5
	 *
	 */
	static ping15(host, port = 25565, timeout = 3000) {
		return new Promise( (resolve, reject) => {
			const client = net.createConnection(port, host);

			client.setTimeout(timeout);

			client.on("timeout", (/* error */) => {
				client.destroy( );

				reject( new Error("The client timed out while connecting to " + host + ":" + port) );
			});

			client.on("error", (error) => {
				reject(error);
			});

			client.on("connect", ( ) => {
				// Request
				const requestBuffer = Buffer.from([0xFE, 0x01]);
				client.write(requestBuffer);
			});

			// Response
			client.on("data", (responseBuffer) => {
				const dataBuffer = iconv.decode(responseBuffer.slice(9, responseBuffer.length), "utf-16be");
				const data = dataBuffer.toString( ).split("\0");

				resolve({
					"version": {
						"name": data[1],
						"protocol": parseInt(data[0])
					},
					"players": {
						"max": parseInt(data[4]),
						"online": parseInt(data[3])
					},
					"description": data[2]
				});
			});
		});
	}

	/*
	 *	Beta 1.8 to 1.3
	 *	https://wiki.vg/Server_List_Ping#Beta_1.8_to_1.3
	 *
	 */
	static ping13(host, port = 25565, timeout = 3000) {
		return new Promise( (resolve, reject) => {
			const client = net.createConnection(port, host);

			client.setTimeout(timeout);

			client.on("timeout", (/* error */) => {
				client.destroy( );

				reject( new Error("The client timed out while connecting to " + host + ":" + port) );
			});

			client.on("error", (error) => {
				reject(error);
			});

			client.on("connect", ( ) => {
				// Request
				const requestBuffer = Buffer.from([0xFE]);
				client.write(requestBuffer);
			});

			// Response
			client.on("data", (responseBuffer) => {
				const dataBuffer = iconv.decode(responseBuffer.slice(3, responseBuffer.length), "utf-16be");
				const data = dataBuffer.toString( ).split("\u00A7");

				resolve({
					"players": {
						"max": parseInt(data[2]),
						"online": parseInt(data[1])
					},
					"description": data[0]
				});
			});
		});
	}

}

module.exports = MinecraftServerListPing;
