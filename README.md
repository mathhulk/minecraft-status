# mc-ping-updated

![license](http://img.shields.io/npm/l/mc-ping-updated.png?style=flat) 
![stable](http://img.shields.io/npm/v/mc-ping-updated.png?style=flat)
[![package](http://img.shields.io/npm/mc-ping-updated.png?style=flat)](https://www.npmjs.org/package/mc-ping-updated)

This library is an updated fork of [wizardfrag/mc-ping](https://github.com/wizardfrag/mc-ping) that supports Minecraft 1.8's protocol. mc-ping (and subsequently, mc-ping-updated) is a super-simple library that provides access to the [Server List Ping](http://wiki.vg/Server_List_Ping) feature of Minecraft PC servers.

You can use it as follows:
```javascript
const mcping = require('mc-ping-updated');

mcping('example.com', 25565, function(err, res) {
	if (err) {
    		// Some kind of error
    		console.error(err);
	} else {
    		// Success!
    		console.log(res);
	}
}, 3000);
```

If the request completes, `res` will be a JSON object like so: [http://wiki.vg/Server_List_Ping#Response](http://wiki.vg/Server_List_Ping#Response)

## License

(MIT License)

Copyright (C) 2013 David White &lt;david@wizardfrag.co.uk&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
