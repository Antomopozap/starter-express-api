const express = require("express");
const app = express();
const PORT = 8080;
const db = require("megadb");
const keys = new db.crearDB("keys");
const users = new db.crearDB("users");
const fs = require("fs");
//?generate Key
function generateApiKey(user) {
  const { randomBytes, createHash } = require("crypto");
  const apiKey = randomBytes(16).toString("hex");
  const incriptedKey = createHash("md5").update(apiKey).digest("hex");

  if (keys.has(incriptedKey)) {
    generateApiKey();
  }
  if (users.has(user)) {
    console.log("Username already taken");
  } else {
    keys.set(incriptedKey, user);
    users.set(user, incriptedKey);
    console.log(`Key generated succesfully, ${apiKey}`);
  }
}
//? Handling requests
app.get("/api", (req, res) => {
  const { createHash } = require("crypto");
  const apiKey = req.query.apiKey;

  if (!apiKey) res.sendStatus(400);
  const incryptedKey = createHash("md5").update(apiKey).digest("hex");
  if (!keys.has(incryptedKey)) res.sendStatus(400);

  res.send(readJSON("./elements.json"));
});

app.listen(PORT, () => {
  console.log("Server runnig at http://localhost:" + PORT);
});

function readJSON(path_file_name) {
  if (!fs.existsSync(path_file_name))
    throw new errorDB(
      `El archivo ${path_file_name} no existe.`,
      "DATABASE INVALIDA",
      "readJSON",
      path_file_name
    );
  var obj_data;
  try {
    let get_data = fs.readFileSync(path_file_name, "utf8");
    obj_data = JSON.parse(get_data);
  } catch (error) {
    throw new errorDB(
      `Ocurrio un problema al tratar de leer los datos del archivo ${path_file_name}, error: ${error}`,
      "DATABASE INVALIDA",
      "readJSON",
      path_file_name
    );
  }
  return obj_data;
}
