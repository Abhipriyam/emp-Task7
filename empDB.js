let express = require("express");
let app = express();
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH,DELETE,HEAD"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-with, Content-Type,Accept"
  );
  next();
});
const port = 2410;
app.listen(port, () => console.log(`Node app listening on port ${port}!`));

let { Client } = require("pg");
let client = new Client({
  user: "postgres",
  password: "BEknITBSftv9KgA7",
  database: "postgres",
  port: 5432,
  host: "db.ghisvwlxmrvqbwujjzzi.supabase.co",
  ssl: { rejectUnauthorized: false },
});
client.connect(function (res, error) {
  console.log(`Connected!!!`);
});

app.get("/users", function (req, res, next) {
  console.log("Inside /emps get api");
  const { department, designation, gender } = req.query;
  // Build the SQL query
  let query = "SELECT * FROM emps WHERE 1 = 1";
  if (department) {
    const departmentArr = department.split(",");
    query += ` AND department IN ('${departmentArr.join("','")}')`;
  }
  if (designation) {
    query += ` AND designation = '${designation}'`;
  }
  if (gender) {
    query += ` AND gender = '${gender}'`;
  }
  client.query(query, function (err, result) {
    if (err) {
      res.status(400).send(err);
    }
    res.send(result.rows);
    // client.end();
  });
});

app.get("/users/:empcode", function (req, res) {
  let empCode = req.params.empcode;
  let query = `SELECT * FROM emps WHERE empcode=${empCode}`;
  client.query(query, function (err, result) {
    if (err) {
      res.status(400).send(err);
    }
    res.send(result.rows);
  });
});

app.put("/users/:empcode", function (req, res) {
  let empcode = req.params.empcode;
  console.log("id", empcode);
  let body = req.body;
  console.log("bd", body);

  let sql = `UPDATE emps SET name=$1, department=$2, designation=$3, salary=$4, gender=$5 WHERE empCode=$6`;
  client.query(
    sql,
    [
      body.name,
      body.department,
      body.designation,
      body.salary,
      body.gender,
      empcode,
    ],
    function (err, result) {
      if (err) {
        console.log(err);
        res.status(500).send(err);
      } else {
        console.log(result);
        res.send(result.rows);
      }
    }
  );
});

app.post("/users", function (req, res, next) {
  console.log("Inside /users post api");

  // Extract data from the request body
  const { empcode, name, department, designation, gender, salary } = req.body;
  // Check if required data is present
  if (!empcode || !name || !department || !designation || !gender || !salary) {
    return res.status(400).send("Bad Request - Missing required data");
  }
  // Build the SQL query to insert a new employee record
  const query = `
    INSERT INTO emps(empcode, name, department, designation, gender, salary)
    VALUES($1, $2, $3, $4, $5, $6)
    RETURNING *;`;

  // Execute the SQL query
  const values = [empcode, name, department, designation, gender, salary];

  client.query(query, values, function (err, result) {
    if (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
    // Send the newly inserted record back as JSON
    res.json(result.rows[0]);
  });
});

app.delete("/users/:empcode", function (req, res) {
  let empCode = req.params.empcode;
  let query = `DELETE FROM emps WHERE empcode = ${empCode} RETURNING *`;
  client.query(query, function (err, result) {
    if (err) {
      res.status(400).send(err);
    }
    res.send(result.rows);
  });
});
