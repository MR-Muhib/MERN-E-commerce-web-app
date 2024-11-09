const app = require("./app");
const { serverPort } = require("./secret");

app.listen(serverPort, () => {
  console.log(`http://localhost:${serverPort}`);
});
