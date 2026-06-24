const User = require("../models/User");
const { OAuth2Client } = require('google-auth-library'); // 🚀 नवीन पॅकेज

// तुझा Google Client ID
const client = new OAuth2Client("591920054629-m595eoigo07hl5gapp8bb4n95b8l34h0.apps.googleusercontent.com");


exports.registerUser = async (req,res)=>{
  try {
    const user = await User.create(req.body);
    res.json(user);
  } catch(err){
    res.status(500).json({error: err.message});
  }
};

exports.loginUser = async (req,res)=>{
  const { email, password } = req.body;

  const user = await User.findOne({ where:{ email } });

  if(!user){
    return res.json({msg:"User not found"});
  }

  if(user.password !== password){
    return res.json({msg:"Wrong password"});
  }

  // 🚀 हा नवीन छोटासा बदल: Pending Admin ला आत जाण्यापासून रोखण्यासाठी
  if(user.role === "pending_admin" || user.role === "pending"){
    return res.json({msg:"Your Admin request is pending approval!"});
  }

  res.json({
    msg:"Login success",
    role: user.role,
    name: user.name   
  });
};


// ॲडमिनचा पासवर्ड आणि ईमेल अपडेट करण्यासाठी
exports.updateAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // डेटाबेसमधून ॲडमिनला शोधणे
    const admin = await User.findOne({ where: { role: 'admin' } });

    if (!admin) {
      return res.status(404).json({ msg: "Admin not found" });
    }

    // नवीन ईमेल टाकला असेल तर अपडेट कर
    if (email && email.trim() !== "") {
      admin.email = email;
    }
    
    // नवीन पासवर्ड अपडेट कर
    if (password && password.trim() !== "") {
      admin.password = password;
    }

    await admin.save(); // डेटाबेसमध्ये सेव्ह करा
    res.json({ msg: "Admin credentials updated!" });

  } catch (error) {
    console.error("Error updating admin:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

//for deleting user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params; // URL मधून ID घेणे

    const user = await User.findOne({ where: { id: id } });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

     await user.destroy(); 
    
    res.json({ msg: "User deleted successfully 🗑️" });

  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

// 🚀 नवीन फंक्शन: Pending Sub-Admin ला Approve करण्यासाठी
exports.approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findOne({ where: { id: id } });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.role = role; // युझरचा रोल 'admin' सेट करणे
    await user.save();

    res.json({ msg: "Sub-Admin Approved Successfully! ✅" });

  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};


// 🚀 नवीन फंक्शन: Google Login / Register साठी
exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body; // फ्रंटएंडकडून आलेला गुगलचा सिक्रेट टोकन

    // १. गुगलकडून टोकन तपासून घेणे (खरा युझर आहे का?)
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "591920054629-m595eoigo07hl5gapp8bb4n95b8l34h0.apps.googleusercontent.com",
    });
    
    const { email, name } = ticket.getPayload(); // गुगलने दिलेला व्हेरीफाईड डेटा

    // २. डेटाबेसमध्ये युझर शोधणे
    let user = await User.findOne({ where: { email } });

    // ३. जर युझर नसेल, तर नवीन अकाउंट बनवणे (Register without password)
    if (!user) {
      user = await User.create({
        name: name,
        email: email,
        password: "GoogleLogin_NoPassword", // डमी पासवर्ड (गुगल युझरला पासवर्डची गरज नाही)
        role: "user"
      });
    }

    // ४. जर कोणी 'pending' असेल तर त्याला आत जाण्यापासून थांबवणे
    if (user.role === "pending_admin" || user.role === "pending") {
      return res.json({ msg: "Your Admin request is pending approval!" });
    }

    // ५. फायनल लॉगिन सक्सेस रिस्पॉन्स (तुझ्या जुन्या कोडसारखाच)
    res.json({
      msg: "Login success",
      role: user.role,
      name: user.name,
      email: user.email
    });

  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ msg: "Google login failed! Server error." });
  }
};