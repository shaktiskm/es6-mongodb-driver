"use strict";

import * as Q from "q";
import mongodb from "mongodb";

export default class MongodbClient {

  /**
   * @constructor
   * @param {Object} mongoConfig - Initialization object
   */
  constructor(mongoConfig) {
    this._connectionTimeout = mongoConfig.connectionTimeout;
    this._connectionString = mongoConfig.connectionstring;
    this._mongoClient = mongodb.MongoClient;
  }

  aggregate(collection, pipeline) {
    return this._dbPromise
      .then(db => {
        const coll = db.collection(collection);

        console.time("es6-mongodb-driver:aggregate");
        return Q.npost(coll, "aggregate", pipeline)
          .then(results => {
            console.timeEnd("es6-mongodb-driver:aggregate");
            console.log(collection);
            return results;
          });
      });
  }

  /**
   * To close the connected MongoDB
   * @param {boolean} force boolean
   * @returns {QPromise} Close the DB Connection
   */
  close(force) {
    return this._dbPromise
      .then(db => Q.ninvoke(db, "close", force));
  }

  /**
   * To connect to MongoDB
   * @returns {QPromise} DBConnection Promise
   */
  connect() {
    this._dbPromise = Q.timeout(Q.nfcall(this._mongoClient.connect, this._connectionString), this._connectionTimeout);
    return this._dbPromise;
  }

  /**
   * To perform CREATE operation on connected MongoDB
   * @param {string} collection => Name of the collection in connected MongoDB
   * @param {Object} document => Document to be inserted
   * @returns {QPromise} Inserted Result Object
   */
  create(collection, document) {
    return this._dbPromise
      .then(db => {
        const coll = db.collection(collection);

        return Q.ninvoke(coll, "insert", document);
      });
  }

  /**
   * To perform DELETE operation on connected MongoDB
   * @param {string} collection => Name of collection in connected MongoDB
   * @param {Object} query => Object that contains DB querying details
   * @returns {QPromise} Deleted Result
   */
  delete(collection, query) {
    return this._dbPromise
      .then(db => {
        const coll = db.collection(collection),
          options = [
            (query.body || {}),
            {
              "single": (query.justOne || false)
            }
          ];

        return Q.npost(coll, "remove", options);
      });
  }

  /**
   * To perform READ operation on connected MongoDB
   * @param {string} collection => Name of collection in connected MongoDB
   * @param {Object} query => Object that contains DB querying details
   * @returns {QPromise} Return Read Result in Array
   */
  read(collection, query) {
    return this._dbPromise
      .then(db => {
        const coll = db.collection(collection),
          options = [];

        options.push(query.body || {});
        options.push(this.readQuery(query));

        console.time("es6-mongodb-driver:read");

        return Q.npost(coll, "find", options)
          .then(cursor => {
            console.timeEnd("es6-mongodb-driver:read");
            console.time("es6-mongodb-driver:read:toArray");
            return Q.ninvoke(cursor, "toArray")
              .then(results => {
                console.timeEnd("es6-mongodb-driver:read:toArray");
                return results;
              });
          });
      });
  }

  /**
   * Provides defaults for the read query object
   * @param {Object} query => Mongo query object
   * @returns {Object} Mongo query object with defaults if not included when supplied
   */
  readQuery(query) {
    return {
      "fields": query.fields || {},
      "limit": query.limit || 0,
      "skip": query.skip || 0,
      "sort": query.sort || {}
    };
  }

  /**
   * Currently this method is used to ping the database to find out whether the connection is still alive.
   * However its original functionality is to return statistics and info about the database connection.
   * @returns {QPromise} Return Stats
   */
  stats() {
    return this._dbPromise
      .then(db => Q.ninvoke(db, "stats"));
  }

  /**
   * To perform UPDATE operation on connected MongoDB
   * @param {string} collection => Name of collection in connected MongoDB
   * @param {Object} query => Object that contains DB querying details
   * @returns {QPromise} Return Update Result
   */
  update(collection, query) {
    return this._dbPromise
      .then(db => {
        const coll = db.collection(collection),
          options = [
            (query.body || {}),
            (query.fields || {}),
            {
              "multi": (query.multi || false),
              "upsert": (query.upsert || false)
            }
          ];

        return Q.npost(coll, "update", options);
      });
  }
}

