/**
 * @name    server.js - NodeJS Restful API for RethinkDB & Real Time Web Sockets
 * @author  Original work by Cesar Anton Dorantes @reicek, for Platzi.com/blog
 * @license 
 * Copyright (c) 2015-2016 Cesar Anton Dorantes
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software 
 * and associated documentation files (the "Software"), to deal in the Software without restriction, 
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, 
 * subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial 
 * portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE 
 * AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, 
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 **/
// ******************************************
//          Import configurations
// ******************************************
   var config           = require('./config.json');
// ******************************************
//       Install NodeJS Dependencies
// ******************************************
// Serve-Static 
var serveStatic         = require('serve-static');
// Body-Parser
var bodyParser          = require('body-parser');
// RethinkDB
var r                   = require('rethinkdb');
// Express
var express             = require('express');
var app                 = express();
// Socket Server
var server              = require('http').Server(app);
// Socket.IO
var io                  = require('socket.io')(server);
// ******************************************
//                RethinkDB
// ******************************************
var startServer         = function() {
   server.listen(config.express.port);
   console.log('_____________________');
   console.log('HTTP service online');
   console.log('Web Socket service online');
   console.log('API service online');
};
var initializeRTDB      = function(conn) {
   r.table(config.rethinkdb.table).indexWait('createdAt').run(conn)
   .then(function(result) {
      console.log("DB OK, starting express...");
      startServer();
      conn.close()
      .then(function(){
         console.log("Closed RethinkDB connection")
      });
   })
   .error(function(error){
      console.log("The table doesn't exist.");
      console.log("Initializing table: "+config.rethinkdb.table);
      r.tableCreate(config.rethinkdb.table)
      .run(conn)
      .finally(function(){
         console.log("Initializing index: "+config.rethinkdb.tableIndex);
         r.table(config.rethinkdb.table).indexCreate(config.rethinkdb.tableIndex).run(conn)
         .finally(function(){
            console.log("DB Initialized, starting express...");
            conn.close()
            .then(function(){
               console.log("Closed RethinkDB connection")
            });
            startServer();
         });
      });
   });
};
r.connect(config.rethinkdb)
.then(function(conn) {
   console.log('_____________________');
   console.log("Connected to RethinkDB");
   console.log("Checking DB...");
   r.dbList().run(conn)
   .then(function(dbList){
      if (dbList.indexOf(config.rethinkdb.db) > -1)
      {
         initializeRTDB(conn);
      } else {
         console.log("The DB doesn't exist.");
         console.log("Initializing DB "+config.rethinkdb.db);
         r.dbCreate(config.rethinkdb.db).run(conn)
            .then(initializeRTDB(conn))
      }
   })
})
.error(function(error){
   console.log("Could not open a connection to initialize the database "+config.rethinkdb.db);
   console.log(error.message);
   process.exit(1);
});
// ******************************************
//                   API
// ******************************************
// ------------------------------------------
//          Send back a 500 error
// ------------------------------------------
var handleError         = function(res) {
   return function(error){
      res.send(500,{error: error.message});
   }
}
// ------------------------------------------
//             List all elements
// ------------------------------------------
var list                = function(request, res, next) {
   console.log('_____________________');
   console.log('API - list/list');
   r.connect(config.rethinkdb)
   .then(function(conn) {
      r.table(config.rethinkdb.table).orderBy({index: config.rethinkdb.tableIndex}).run(conn)
      .then( function(data) {
         if (data._responses[0]){
            var query = data._responses[0].r;
            res.send(query);
         }
         conn.close()
         .then(function(){
            console.log('Data sent.');
            console.log(new Date());
         });
      })
      .error(handleError(res))
   });
}
// ------------------------------------------
//             Insert an element
// ------------------------------------------
var add                 = function(request, res, next) {
   var element          = request.body;
   console.log('_____________________');
   console.log('API - list/add');
   console.log(element);
   element.createdAt = r.now();
   r.connect(config.rethinkdb)
   .then(function(conn) {
      r.table(config.rethinkdb.table).insert(element).run(conn)
      .then( function() {
         conn.close()
         .then(function(){
            console.log('New data added.');
            console.log(new Date());
            res.send('200 OK');
         });
      })
      .error(handleError(res))
   });
}

// ------------------------------------------
//             Delete all elements
// ------------------------------------------
var empty               = function (request, res, next) {
   console.log('_____________________');
   console.log('API - list/empty');
   r.connect(config.rethinkdb)
   .then(function(conn) {
      r.table(config.rethinkdb.table).delete({returnChanges: true}).run(conn)
      .then( function(changes) {
         console.log(changes);
         conn.close()
         .then(function(){
            console.log('All data erased.');
            console.log(new Date());
         });
      })
      .error(handleError(res))
   });
}
// ******************************************
//                Socket.IO
// ******************************************
io.on('connection', function (socket) {
   this.socket          = socket;
   var webSocket	= this.socket;
   webSocket.emit('checkConnection', { result: 'Web Socket OK' }); // Listen to test conection
   r.connect(config.rethinkdb)
   .then(function(conn) {
      r.table(config.rethinkdb.table).changes({squash:1}).run(conn, function(error,cursor){
         cursor.on("data",function(change){
            webSocket.emit('change',{change:change});
         });
         cursor.on("error",function(error){
            webSocket.emit('error',{error:error});
            cursor.close();
         });
      });
   });
});
// ******************************************
//                Express
// ******************************************
// Data parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Define main routes
app.route('/api/list').get(list);
app.route('/api/add').post(add);
app.route('/api/empty').post(empty);
// Static files server
app.use(serveStatic('./public'));