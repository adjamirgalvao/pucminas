const mongoose = require("mongoose");

const user = "adjamirgalvao";
const pass = "XsdDxedCvHNWjXZh";
const serverName = "cluster0.4jedpjg.mongodb.net";
const database = 'LojaOnline';

module.exports = {
    init: () => {
      mongoose.set("strictQuery", "throw");
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
  
