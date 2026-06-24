const { DataTypes } = require("sequelize");
const sequelize = require("../config/sql");

const Lead = sequelize.define("Lead", {
  name: DataTypes.STRING,
  email: DataTypes.STRING,
  phone: DataTypes.STRING,
  message: DataTypes.TEXT,
  
  // 🚀 हे दोन नवीन कॉलम्स आपण ॲड केले आहेत:
  packageName: {
    type: DataTypes.STRING,
    allowNull: true // Contact फॉर्ममध्ये हे रिकामं असेल म्हणून true ठेवलंय
  },
  type: {
    type: DataTypes.STRING,
    defaultValue: "contact" // जर काहीच नाही पाठवलं तर तो 'contact' म्हणून सेव्ह होईल
  },
  
  // 🚀 नवीन: Password Request Status के लिए
  status: {
    type: DataTypes.STRING,
    defaultValue: "pending",
    allowNull: true
  }
});

module.exports = Lead;
