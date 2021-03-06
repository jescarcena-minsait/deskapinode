'use strict';
// Module Dependencies
// -------------------
var express     = require('express');
var http        = require('http');
var JWT         = require('./lib/jwtDecoder');
var path        = require('path');
var request     = require('request');
var routes      = require('./routes');
var pkgjson = require( './package.json' );

var routes_jescarcena = require('./routes');
var activityCreateFile   = require('./routes/createFile');
var activityUtilsJescarcena    = require('./routes/activityUtils');

var app = express();

// Register configs for the environments where the app functions
// , these can be stored in a separate file using a module like config


var APIKeys = {
    appId           : '859f03b6-84f2-431e-8671-5e95e6455c3d',
    clientId        : 'e5qszshlc4symevg3x41gk62',
    clientSecret    : 'DVUM4KPqdD8T8iesfa62o8zJ',
    appSignature    : 'chihabkm1qydkjmyojmmqnmby24d2jxoqcwwnvb21kluzypck1ljvyp3olyzmjgftcaqmqfpvl15w5pyvrgswuhtxsiyq4tmm0wgnlp02rtqyxhvf20ka3axw00kzneoidtgfymnky13p4pp14iuqygn03m5rks0kwaefd0nltmbgcib0jpo41r5llzfrmgomtvbxt2b5tcbb3mki5y3wgzlkh0svrtv4zurhonguezpcxusoe4ytnq3uibtzua',
    authUrl         : 'https://auth.exacttargetapis.com/v1/requestToken?legacy=1'
};


// Simple custom middleware
function tokenFromJWT( req, res, next ) {
    // Setup the signature for decoding the JWT
    var jwt = new JWT({appSignature: APIKeys.appSignature});
    
    // Object representing the data in the JWT
    var jwtData = jwt.decode( req );

    // Bolt the data we need to make this call onto the session.
    // Since the UI for this app is only used as a management console,
    // we can get away with this. Otherwise, you should use a
    // persistent storage system and manage tokens properly with
    // node-fuel
    req.session.token = jwtData.token;
    next();
}

// Use the cookie-based session  middleware
app.use(express.cookieParser());

// TODO: MaxAge for cookie based on token exp?
app.use(express.cookieSession({secret: "DeskAPI-CookieSecret0980q8w0r8we09r8"}));

// Configure Express
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.favicon());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// Express in Development Mode
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// HubExchange Routes
app.get('/', routes_jescarcena.index );
app.post('/login', tokenFromJWT, routes_jescarcena.login );
app.post('/logout', routes_jescarcena.logout );

// Custom Activity Routes for interacting with Desk.com API

app.post('/ixn/activities/update-case/save/', activityCreateFile.save );
app.post('/ixn/activities/update-case/validate/', activityCreateFile.validate );
app.post('/ixn/activities/update-case/publish/', activityCreateFile.publish );
app.post('/ixn/activities/update-case/execute/', activityCreateFile.execute );

app.get('/clearList', function( req, res ) {
	// The client makes this request to get the data
	activityUtilsJescarcena.logExecuteData = [];
	res.send( 200 );
});


// Used to populate events which have reached the activity in the interaction we created
app.get('/getActivityData', function( req, res ) {
	// The client makes this request to get the data
	if( !activityUtilsJescarcena.logExecuteData.length ) {
		res.send( 200, {data: null} );
	} else {
		res.send( 200, {data: activityUtilsJescarcena.logExecuteData} );
	}
});

app.get( '/version', function( req, res ) {
	res.setHeader( 'content-type', 'application/json' );
	res.send(200, JSON.stringify( {
		version: pkgjson.version
	} ) );
} );

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
