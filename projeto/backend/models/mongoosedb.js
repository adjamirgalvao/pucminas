const mongoose = require("mongoose");

const user = "adjamirgalvao";
const pass = "XsdDxedCvHNWjXZh";
const serverName = "cluster0.4jedpjg.mongodb.net";
const database = 'Cluster0';

module.exports = {
    init: () => {
      mongoose
        .connect(
          `mongodb+srv://${user}:${pass}@${serverName}/${database}'?retryWrites=true&w=majority`,
          {
            useNewUrlParser: true,
            useUnifiedTopology: true
          }
        )
        .then((res) => console.log(`Connection Succesful ${res}`))
        .catch((err) => console.log(`Error in DB connection ${err}`));
    },
  };
  