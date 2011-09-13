(function() {
  var Character, fs, http, io, lyr_config_characters, request, server, _;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  lyr_config_characters = {
    "user": "shoaib_burq",
    "acl": {
      "get": "37f9e107e4a112eddcdc1c31fd12832a",
      "delete": "1b62758e5e2948e6ef0cd0930516e5c7",
      "post": "f0698e2664c04e2fe03702f07392e878",
      "put": "7378dcc7eb8f628ffc702d5d27c8c7db"
    },
    "api_url": "https://api.spacialdb.com/1/users/shoaib_burq/layers/characters",
    "srid": 4326,
    "table_name": "characters",
    "database": "spacialdb1_shoaib_burq",
    "name": "characters"
  };
  fs = require('fs');
  http = require('http');
  request = require('request');
  _ = require('underscore');
  server = http.createServer(function(req, res) {
    return fs.readFile("" + __dirname + "/map.html", function(err, data) {
      res.writeHead(200, {
        'Content-Type': 'text/html'
      });
      return res.end(data, 'utf8');
    });
  });
  server.listen(3000);
  io = require('socket.io').listen(server);
  io.sockets.on('connection', function(socket) {
    var clientId;
    clientId = socket.id;
    socket.on('disconnect', function(message) {
      return Character.find({
        clientId: socket.id
      }, function(record) {
        if (record.features) {
          return Character["delete"](record.features[0].id, function(res) {
            return true;
          });
        } else {
          return false;
        }
      });
    });
    socket.on('publish', function(message) {});
    socket.on('broadcast', function(message) {
      return Character.find({
        clientId: socket.id
      }, __bind(function(record) {
        var chat_data;
        chat_data = {
          user: record,
          conversation: message
        };
        return socket.broadcast.send(JSON.stringify(chat_data));
      }, this));
    });
    return socket.on('addUser', function(message) {
      var input;
      input = {
        geometry: {
          type: "Point",
          coordinates: [message.lng, message.lat]
        },
        properties: {
          name: message.name,
          location: message.location,
          email: message.email,
          clientId: clientId
        }
      };
      return Character.create(input, function(new_record) {
        var new_rec;
        new_rec = JSON.parse(new_record);
        return Character.find({
          id: new_rec.id
        }, function(record) {
          return socket.broadcast.emit('newUser', JSON.stringify(record));
        });
      });
    });
  });
  Character = {
    create: function(attrs, callback) {
      var post_url, req;
      post_url = "" + lyr_config_characters.api_url + "?key=" + lyr_config_characters.acl.post;
      req = {
        method: "POST",
        uri: post_url,
        body: JSON.stringify(attrs),
        headers: {
          "Content-Type": "application/json"
        }
      };
      return request(req, function(error, response, body) {
        if (error) {
          return console.log(error);
        } else {
          return body;
        }
      });
    },
    "delete": function(id, callback) {
      var req, url;
      url = "" + lyr_config_characters.api_url + "/" + id + "?key=" + lyr_config_characters.acl["delete"];
      req = {
        method: "DELETE",
        url: url,
        body: JSON.stringify({
          "id": id
        }),
        headers: {
          "Content-Type": "application/json"
        }
      };
      return request(req, function(error, response, body) {
        if (error) {
          console.log(error);
          return false;
        } else {
          return true;
        }
      });
    },
    find: function(attrs, callback) {
      var q, req, url;
      q = {
        "operator": "or",
        "properties": attrs
      };
      if (_.contains(_.keys(attrs), "id")) {
        url = "" + lyr_config_characters.api_url + "/" + attrs.id + "?key=" + lyr_config_characters.acl.get;
      } else {
        url = "" + lyr_config_characters.api_url + "?key=" + lyr_config_characters.acl.get + "&input=" + (encodeURIComponent(JSON.stringify(q)));
      }
      console.log("\nGET :: " + url + "\n");
      req = {
        method: "GET",
        uri: url,
        headers: {
          "Content-Type": "application/json"
        }
      };
      return request(req, function(error, response, body) {
        if (error) {
          return console.log(error);
        } else {
          console.log('Character.find');
          if (body) {
            return callback(JSON.parse(body));
          } else {
            return {};
          }
        }
      });
    }
  };
}).call(this);
