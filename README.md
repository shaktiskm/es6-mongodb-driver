# es6-mongodb-driver


## Setup

1. Check the npm packages:

    ```
    npm install
    ```

2. Start the application

    ```
    import MongodbClient from "es6-mongodb-driver";
    
    let mongoConfig = {
      "connectionstring": "http://127.0.0.1:27017/test",
      "connectionTimeout": 5000,
      "connectionOptions": {
        "server": {
          "poolSize": 5,
          "socketOptions": {
            "autoReconnect": true,
            "keepAlive": 0
          },
          "reconnectTries": 30,
          "reconnectInterval": 1000
        }
      }
    },
    mongoClient = new MongodbClient(mongoConfig);
    ```
    Now using mongoClient object, you can call it's wrapper methods.

## Managing the project with Grunt

* Runs eslint, babel:dist

    ```
    grunt
    ```

* Compiles the .es6 files to .js
 
    ```
    grunt babel:dist
    ```

* Lints the .es6 files

    ```
    grunt eslint
    ```
