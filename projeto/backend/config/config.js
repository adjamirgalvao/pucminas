//https://stackoverflow.com/questions/8595509/how-do-you-share-constants-in-nodejs-modules
module.exports = Object.freeze({
    passport: {
      secret: 'node.js_sample_secret_key_1asd134',
      expiresIn: 10000,
    },
  });