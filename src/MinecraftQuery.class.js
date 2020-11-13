const dgram = require("dgram");

/*
 *	Query
 *	https://wiki.vg/Query
 *
 */
class MinecraftQuery {

	/*
	 *	Basic stat
	 *	https://wiki.vg/Query#Basic_stat
	 *
	 */
	static query(host, port = 25565, callback, timeout = 3000) {
		return new Promise( (resolve, reject) => {
			const session = 0x00000001;

			const client = dgram.createSocket("udp4");

			client.connect(port, host);

			let timeoutFunction = setTimeout( ( ) => {
				client.close( );

				reject( new Error("The client timed out while connecting to " + host + ":" + port) );
			}, timeout, client);

			client.on("error", (error) => {
				client.close( );

				reject(error);
			});

			client.on("connect", ( ) => {
				// Handshake
				const handshakeBuffer = Buffer.alloc(7);
				// Magic
				handshakeBuffer.writeUInt16BE(0xFEFD, 0);
				// Type
				handshakeBuffer.writeUInt8(9, 2);
				// Session ID
				handshakeBuffer.writeInt32BE(session, 3);

				client.send(handshakeBuffer);
			});

			let authenticated = false;

			client.on("message", (responseBuffer) => {
				if(authenticated) {
					client.close( );

					clearTimeout(timeoutFunction);

					// Response
					const responseData = responseBuffer.toString( ).split("\0");

					return resolve({
						"players": {
							"online": parseInt(responseData[7]),
							"max": parseInt(responseData[8])
						},
						"description": responseData[4],
						"map": responseData[6],
						"game_type": responseData[5]
					});
				}

				authenticated = true;

				const token = parseInt( responseBuffer.toString("utf-8", 5) );

				// Request
				const requestBuffer = Buffer.alloc(11);
				// Magic
				requestBuffer.writeUInt16BE(0xFEFD, 0);
				// Type
				requestBuffer.writeUInt8(0, 2);
				// Session ID
				requestBuffer.writeInt32BE(session, 3);
				// Token
				requestBuffer.writeInt32BE(token, 7);

				client.send(requestBuffer);
			});
		});
	}

	/*
	 *	Full stat
	 *	https://wiki.vg/Query#Full_stat
	 *
	 */
	static fullQuery(host, port = 25565, callback, timeout = 3000) {
		return new Promise( (resolve, reject) => {
			const session = 0x00000001;

			const client = dgram.createSocket("udp4");

			client.connect(port, host);

			let timeoutFunction = setTimeout( ( ) => {
				client.close( );

				reject( new Error("The client timed out while connecting to " + host + ":" + port) );
			}, timeout, client);

			client.on("error", (error) => {
				client.close( );

				reject(error);
			});

			client.on("connect", ( ) => {
				// Handshake
				const handshakeBuffer = Buffer.alloc(7);
				// Magic
				handshakeBuffer.writeUInt16BE(0xFEFD, 0);
				// Type
				handshakeBuffer.writeUInt8(9, 2);
				// Session ID
				handshakeBuffer.writeInt32BE(session, 3);

				client.send(handshakeBuffer);
			});

			let authenticated = false;

			client.on("message", (responseBuffer) => {
				if(authenticated) {
					client.close( );

					clearTimeout(timeoutFunction);

					// Response
					const responseData = responseBuffer.toString("utf-8", 16).split("\x00\x01player_\x00\x00");

					const data = responseData[0].split("\0");
					data.splice(data.length - 1, 1);

					const players = responseData[1].split("\0");
					players.splice(players.length - 2);

					// List of plugins, not used by the vanilla server, where it is an empty string
					let serverModification = null;

					if(data[9].length > 0) {
						const plugins = data[9].split(": ");

						serverModification = {
							name: plugins[0],
							plugins: plugins[1] ? plugins[1].split("; ") : null
						};
					}

					return resolve({
						"version": {
							"name": data[7]
						},
						"players": {
							"online": parseInt(data[13]),
							"max": parseInt(data[15]),
							"sample": players
						},
						"description": data[1],
						"map": data[11],
						"game_type": data[3],
						"game_id": data[5],
						"server_modification": serverModification
					});
				}

				authenticated = true;

				const token = parseInt( responseBuffer.toString("utf-8", 5) );

				// Request
				const requestBuffer = Buffer.alloc(15);
				// Magic
				requestBuffer.writeUInt16BE(0xFEFD, 0);
				// Type
				requestBuffer.writeUInt8(0, 2);
				// Session ID
				requestBuffer.writeInt32BE(session, 3);
				// Token
				requestBuffer.writeInt32BE(token, 7);
				// Padding
				requestBuffer.writeUInt32BE(0, 11);

				client.send(requestBuffer);
			});
		});
	}

}

module.exports = MinecraftQuery;
