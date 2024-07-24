const express = require("express");
const { default: helmet } = require("helmet");
const { createHash } = require("crypto");
const { createConnection } = require("mysql2");
const cookieParse = require("cookie-parser");
const multer = require("multer");
const app = express();
const port = 8083;

// encryption in one way

const encrypt = (text) => createHash("sha256").update(text).digest("hex");

// set DB connection

const connection = createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: `codealpha`,
});

// establish the connection
connection.connect();

// set cookie setter fun

const cookieSetter = (MRes, name, val) => {
  MRes.cookie(name, val, {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    sameSite: "strict",
  });
};

// set public dir
app.use(express.static(__dirname + "/public"));

// set view engine
app.set("view engine", "ejs");

// security

app.use(helmet());

// parse cookies

app.use(cookieParse());

// parse data

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// root

app.get("/", (MReq, MRes) => {
  if (MReq.cookies.JID) {
    return MRes.redirect("/home");
  }
  MRes.redirect("/signUp");
});

// sign up

app.get("/signUp", (MReq, MRes) => {
  if (MReq.cookies.JID) {
    return MRes.redirect("/home");
  }
  MRes.render("signUp");
});

app.post("/signUp", multer().none(), (MReq, MRes) => {
  console.log(MReq.body);
  let q2 = "select * from users_event where userEmail = ?";
  connection.query(q2, [MReq.body.email], (e, r) => {
    if (e) return console.log("error " + e.message);
    if (r.length > 0) return MRes.json({ message: "user-exist" });
    let q = "INSERT INTO users_event VALUES (NULL, ? , ? , ? , ? )";
    connection.query(
      q,
      [MReq.body.user, MReq.body.email, encrypt(MReq.body.pass), "user"],
      (e, r) => {
        if (e) return console.log("error " + e.message);
        cookieSetter(MRes, "JID", r.insertId);
        return MRes.json({ message: "done" });
      }
    );
  });
});

// log in

app.get("/logIn", (MReq, MRes) => {
  if (MReq.cookies.JID) {
    return MRes.redirect("/home");
  }
  MRes.render("logIn");
});

app.post("/logIn", multer().none(), (MReq, MRes) => {
  let q = "select * from users_event where userEmail = ? and userPassword = ?";
  connection.query(q, [MReq.body.email, encrypt(MReq.body.pass)], (e, r) => {
    if (e) return console.log("error " + e.message);
    if (r.length > 0) {
      cookieSetter(MRes, "JID", r[0].ID);
      MRes.json({ message: "done" });
    } else {
      MRes.json({ message: "user-not-exist" });
    }
  });
  console.log(MReq.body);
});

// home page

app.get("/home", (MReq, MRes) => {
  if (!MReq.cookies.JID) {
    return MRes.redirect("/logIn");
  }
  let q = `
  SELECT u.userName  , e.* , eb.ID as joined
  FROM events e 
  inner join users_event u on u.ID = e.userID 
  left JOIN events_booking eb on eb.eventID = e.ID and eb.userID = u.ID
  `;
  let q2 = `SELECT userName , userType FROM users_event where ID = ${MReq.cookies.JID}`;
  let q3 = `
  SELECT e.ID , COUNT(eb.ID) attendance FROM events_booking eb
  inner join events e 
  on eb.eventID = e.ID
  GROUP by e.ID
  `;
  connection.query(q2, (e, r) => {
    if (e) return console.log("error " + e.message);
    connection.query(q, (error, result) => {
      if (error) return console.log("error " + error.message);
      console.log(result);
      result.forEach((element) => {
        let ror = new Date(element.created_at);
        element.created_at = `${ror.getDay()}/${ror.getMonth()}/${ror.getFullYear()}`;
      });
      connection.query(q3, (err, result2) => {
        if (err) return console.log("error " + err.message);
        console.log(result2);
        MRes.render("home", {
          name: r[0].userName,
          rule: r[0].userType,
          events: result,
          attendance: result2,
        });
      });
    });
  });
});

app.post("/join", multer().none(), (MReq, MRes) => {
  console.log(MReq.body, MReq.cookies);
  let qq = "select * from events_booking where userID = ? and eventID = ?";
  connection.query(qq, [MReq.cookies.JID, MReq.body.oidFF], (e, r) => {
    if (e) return console.log("error" + e.message);
    if (r.length > 0) return;
    let q = "insert into events_booking values(null , ? , ?)";
    connection.query(
      q,
      [MReq.body.oidFF, MReq.cookies.JID],
      (error, result) => {
        if (error) return console.log("error" + error.message);
        MRes.json({ message: "done" });
      }
    );
  });
});

// profile page

app.get("/profile", (MReq, MRes) => {
  if (!MReq.cookies.JID) {
    return MRes.redirect("/logIn");
  }
  let qq = `
  SELECT u.userName  , e.* , eb.ID as joined
  FROM events_booking eb
  inner join users_event u on u.ID = eb.userID 
  inner JOIN events e on eb.eventID = e.ID
  where eb.userID = ${MReq.cookies.JID}
  `;
  connection.query(qq, (error, result) => {
    if (error) return console.log("error " + error.message);
    result.forEach((element) => {
      let ror = new Date(element.created_at);
      element.created_at = `${ror.getDay()}/${ror.getMonth()}/${ror.getFullYear()}`;
    });
    console.log(result);
    let q = `SELECT userName , userType FROM users_event where ID = ${MReq.cookies.JID}`;
    connection.query(q, (e, r) => {
      if (e) return console.log("error " + e.message);
      console.log(r);
      MRes.render("profile", {
        name: r[0].userName,
        rule: r[0].userType,
        events: result,
      });
    });
  });
});

// add events

app.get("/addEvents", (MReq, MRes) => {
  MRes.render("addEvents");
});

app.post("/addEvents", multer().none(), (MReq, MRes) => {
  console.log(MReq.body, MReq.body.maxSize, MReq.cookies.JID);
  // return;
  let q = "INSERT INTO events VALUES (NULL, ? , ? , ? , ?  , ?  , ? , null )";
  connection.query(
    q,
    [
      MReq.cookies.JID,
      MReq.body.title,
      MReq.body.content,
      MReq.body.location,
      MReq.body.date,
      MReq.body.maxSize ? MReq.body.maxSize : null,
    ],
    (e, r) => {
      if (e) return console.log("error " + e.message);
      return MRes.json({ message: "done" });
    }
  );
});

// remove event

app.post("/delete", multer().none(), (MReq, MRes) => {
  console.log(MReq.body, MReq.body.maxSize, MReq.cookies.JID);
  // return;
  let q = "delete from events_booking where userID = ?";
  connection.query(q, [MReq.cookies.JID], (e, r) => {
    if (e) return console.log("error " + e.message);
    return MRes.json({ message: "done" });
  });
});

// handle wrong url

app.use((MReq, MRes) => {
  MRes.status(404).render("errors", {
    title: "url not found",
    header: "404 not found",
    content: "oops:) url not found ",
  });
});

app.listen(port, () =>
  console.log(`event registration app listening on port ${port}!`)
);
