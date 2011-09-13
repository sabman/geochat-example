lyr_config_characters =  
  "user": "shoaib_burq"
  "acl":
    "get": "37f9e107e4a112eddcdc1c31fd12832a"
    "delete": "1b62758e5e2948e6ef0cd0930516e5c7"
    "post": "f0698e2664c04e2fe03702f07392e878"
    "put": "7378dcc7eb8f628ffc702d5d27c8c7db"
  "api_url":  "https://api.spacialdb.com/1/users/shoaib_burq/layers/characters"
  "srid": 4326
  "table_name": "characters"
  "database": "spacialdb1_shoaib_burq"
  "name": "characters"

fs = require 'fs'     # to read static files
http = require 'http' # http server
request = require 'request'
_ = require 'underscore'

server = http.createServer (req, res) ->
  fs.readFile "#{__dirname}/map.html", (err, data) ->
    res.writeHead 200, 'Content-Type': 'text/html'
    res.end data, 'utf8'

server.listen(process.env.PORT || 3000)

io = require('socket.io').listen server
io.sockets.on 'connection', (socket) ->
  clientId = socket.id

  socket.on 'disconnect', (message) ->
    Character.find {clientId: socket.id}, (record) ->
      if record.features
        Character.delete record.features[0].id, (res) ->
          return true
      else
        return false

  socket.on 'publish', (message) ->
    # ...

  socket.on 'broadcast', (message) ->
    Character.find {clientId: socket.id}, (record) =>
      chat_data = {user: record, conversation: message}
      socket.broadcast.send JSON.stringify(chat_data) # forwards message to all the clients except the one that emitted the "broadcast" event

  socket.on 'addUser', (message) ->
    input =
      geometry: { type: "Point", coordinates: [message.lng, message.lat]}
      properties: { name : message.name, location: message.location, email: message.email, clientId: clientId}
    Character.create input, (new_record) ->
      new_rec = JSON.parse(new_record)
      Character.find {id: new_rec.id}, (record) ->
        socket.broadcast.emit 'newUser', JSON.stringify(record)


Character =
  create: (attrs, callback) ->
    console.log "=> create #{JSON.stringify(attrs)}"
    # post the data to SpacialDB
    post_url = "#{lyr_config_characters.api_url}?key=#{lyr_config_characters.acl.post}"
    req =
      method: "POST", uri: post_url, body: JSON.stringify(attrs)
      headers: { "Content-Type": "application/json" }
    request req, (error, response, body) ->
      if error
        console.log error
      else
        console.log "<= create #{body}"
        return callback(body)

  delete: (id, callback) ->
    console.log "=> delete #{id}"
    url = "#{lyr_config_characters.api_url}/#{id}?key=#{lyr_config_characters.acl.delete}"
    req =
      method: "DELETE", url: url
      body: JSON.stringify({"id": id})
      headers: {"Content-Type": "application/json"}
    request req, (error, response, body) ->
      if error
        console.log error
      else
        console.log "<= delete"
        return callback(JSON.parse(body))

  find: (attrs, callback) ->
    console.log "=> find #{JSON.stringify(attrs)}"
    q = { "operator": "or",  "properties": attrs }
    if _.contains(_.keys(attrs), "id")
      url = "#{lyr_config_characters.api_url}/#{attrs.id}?key=#{lyr_config_characters.acl.get}"
    else
      url = "#{lyr_config_characters.api_url}?key=#{lyr_config_characters.acl.get}&input=#{encodeURIComponent(JSON.stringify(q))}"
    req = { method: "GET", uri: url, headers: {"Content-Type": "application/json"} }

    request req, (error, response, body) ->
      if error
        console.log error
      else
        console.log "<= find #{body}"
        if body
          return callback(JSON.parse(body))
        else
          return {}
