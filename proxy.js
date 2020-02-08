var httpProxy = require('http-proxy');
//
// Create your proxy server and set the target in the options.
//
httpProxy.createProxyServer({target:'http://localhost:3008',changeOrigin:true}).listen(3000); // See (†)