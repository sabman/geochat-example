# What is Nodejs?

# What is CoffeeScript?

CoffeeScript is a language that compiles down to JavaScript. This means that code in `.coffee` files are not interpreted at run time, but are compiled beforehand into `.js` files.

CoffeeScript can be written for all implementations of JavaScript, whether it's for `Node.js` or the browser.

Watch this [screen cast](http://screencasts.org/episodes/introduction-to-coffeescript).

    $ coffee -v

# server

## package.json

* Use by npm (node package manager) to describe you application and allow automatic installation of dependencies needed to run you application.

* Think of it as an application manifest for a node project. 

* It describes verions, name and dependencies.

* The most **important** things in your package.json are the *name* and *version* fields.  Those are actually required, and your package won't install without them.

### name 

* Check the [npm registry](http://registry.npmjs.org) if you are creating a public project.

* Non-url-safe characters will be rejected.

Minimal `package.json`:

      {
        "name": "example_2", //
        "version": "0.0.0",
        "dependencies": {
          "socket.io" : "*"
        }
      }

Install:

      $ npm install

      socket.io@0.8.2 ./node_modules/socket.io 
      ├── policyfile@0.0.4
      ├── redis@0.6.6
      └── socket.io-client@0.8.2

## server.coffee


# client
