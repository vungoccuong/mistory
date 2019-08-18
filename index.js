require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const http = require('http');
const passport = require('passport');
const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;
const onlyServer = process.env.OS === 'true';
const next = require('next');
const app = next({ dev, dir: './client' });
const handle = app.getRequestHandler();
require('./server/models');
require('./server/passport/localStrategy')();
const sessionParser = require('./server/shareds/sessionParser');
if (onlyServer) {
	_init();
} else {
	app.prepare().then(() => {
		_init();
	});
}
function _init() {
	const expressServer = _initExpress();
	expressServer.nextApp = app;
	const httpServer = http.createServer(expressServer);
	const wss = require('./server/libs/socket').init(httpServer);
	require('./server/socket')(wss);
	httpServer.listen(port, () => {
		console.log(`server ready on : ${port}`);
	});
}
function _initExpress() {
	const server = express();
	_initBaseMiddleware(server);
	_initRouter(server);
	return server;
}
function _initBaseMiddleware(server) {
	server.use(express.static(path.join(__dirname, 'public')));
	server.use(logger('dev'));
	server.use(express.json());
	server.use(express.urlencoded({ extended: false }));
	server.use(cookieParser());
	server.use(sessionParser);
	server.use(passport.initialize());
	server.use(passport.session());
}
function _initRouter(server) {
	server.use('/v1', require('./server/routes'));
	require('./server/routes/next')(server, app);
	server.get('*', (req, res) => {
		return handle(req, res);
	});
}
