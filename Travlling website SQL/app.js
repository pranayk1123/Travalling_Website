const express = require("express");
const cors = require("cors");
const sequelize = require("./config/sql");
// const packageRoutes = require('./routes/package');
const feedbackRoutes = require('./routes/feedbackRoutes');

require("./models/Package");
require("./models/User");
require("./models/Lead");
require('dotenv').config();



const User = require("./models/User");

const app = express();
// const cors = require('cors');


const corsOptions = {
  origin: 'https://travalling-website.vercel.app', 
  optionsSuccessStatus: 200
};

// To keep Render server awake (Cron-job health check)
app.get("/", (req, res) => {
  res.status(200).send("Travel Backend is Awake! 🚀");
});

app.use(cors(corsOptions));

app.use(cors());
app.use(express.json());

app.use("/api/packages", require("./routes/package"));
app.use("/api/users", require("./routes/users"));
app.use("/api/leads", require("./routes/leads"));
// app.use('/api', packageRoutes);
app.use('/api/feedback', feedbackRoutes);



sequelize.authenticate()
  .then(() => console.log("SQL Connected"))
  .catch(err => console.log(err));


sequelize.sync({ alter: true }).then(async () => {
  

  const admin = await User.findOne({
    where: { email: "admin@test.com" }
  });

  if (!admin) {
    await User.create({
      name: "Admin",
      email: "admin@test.com",
      password: "123",
      role: "admin"
    });
    console.log("✅ Admin created");
  } else {
    console.log("ℹ️ Admin already exists");
  }

console.log(new Date());


});

module.exports = app;
