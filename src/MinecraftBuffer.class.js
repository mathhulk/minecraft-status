class MinecraftBuffer {
	constructor(buffer) {
		// Construct using a zero-length Buffer.
		// this.writeString( ) & this.writeUByte( ) set Buffer length.
		this._buffer = buffer || Buffer.alloc(0);
		this._offset = 0;
	}
	
	writeVarInt(value) {
		while(true) {
			if( (value & 0xFFFFFF80) === 0 ) {
				this.writeUByte(value);
				
				return;
			}
			
			this.writeUByte(value & 0x7F | 0x80);
			
			value >>>= 7;
		}
		
		return this;
	} 
	
	writeString(value) {
		this.writeVarInt(value.length);
		
		if(this._offset + value.length >= this._buffer.length) {
			this._buffer = Buffer.concat([this._buffer, Buffer.alloc(value.length)]);
		}
		
		this._buffer.write(value, this._offset);
		
		this._offset += value.length;
		
		return this;
	}
	
	writeUShort(value) {
        this.writeUByte(value >> 8);
        this.writeUByte(value & 0xFF);
		
		return this;
	}

    writeUByte(value) {
        if (this._offset >= this._buffer.length) {
            this._buffer = Buffer.concat([this._buffer, Buffer.alloc(1)]);
        }

        this._buffer.writeUInt8(value, this._offset++);
		
		return this;
    }

    readVarInt( ) {
        let value = 0;
        let count = 0;

        while(true) {
            let integer = this._buffer.readUInt8(this._offset++);

            value |= (integer & 0x7F) << count++ * 7;

			// (integer & 0x80) != 128
            if( ! ( (integer & 0x80) === 128) ) {
                break;
            }
        }

        return value;
    }

    readString( ) {
        let length = this.readVarInt( );
        let value = this._buffer.toString("utf8", this._offset, this._offset + length);

        this._offset += length;
        
        return value;
    }
	
	pack( ) {
		let length = new MinecraftBuffer( );

		length.writeVarInt(this._buffer.length);

		return Buffer.concat([length.buffer, this._buffer]);
	}

    get buffer( ) {
        return this._buffer.slice(0, this._offset);
    }

    get offset( ) {
        return this._offset;
    }
}

module.exports = MinecraftBuffer;