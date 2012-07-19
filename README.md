node-templater
--------------

An abstraction layer for template engines. This module attempts to bring
together as many template engines as possible into a single uniform api
which provides the additional features of caching, loading templates from
files and watching template files for changes.

similar work
------------

It seems that @visionmedia's [consolidate.js](https://github.com/visionmedia/consolidate.js) does something similar.

current template engines
-------------
* ejs
* jade

api
----

### Templater(options)

the constructor function

### render([template,] options, callback)

render the optional `template` string or `filename` specified on the options object

* *template* __optional__ - template string to process
* *options* __required__ - option object
* *callback* __required__ - callback function

###### options
* *filename* __optional__ - the name of the file to read and process as the template
* *engine* __optional__ - if `filename` is specified, the engine will be automatically determined based on the filename's extension. Otherwise specify which engine to use eg: ejs, jade, etc.
* *context* __required__ - the data object to pass to the template engine. This provides the context within your template.

All other attributes of the `options` object are passed to template engines `compile` method.
   
### end()

stop watching any files that are being watched for changes.

example
-------

```javascript
var Templater = require('templater')
    , t = new Templater()
    , context
    ;

context = { name : "Steve Dave" };

t.render({ filename : "test.jade", context : context }, function (err, result) {
	console.log(result);

	t.end();
});
```

license
----------

### The MIT License (MIT)


Copyright (c) 2012 Daniel L. VerWeire

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
