const app = require("./app");
const db = require("./models/mongoosedb");
const port = process.env.PORT || 3000;

db.init();

app.listen(port, function () {
  console.log(`Backend executando na port ${port}`);
});