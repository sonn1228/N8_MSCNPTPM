var express = require("express");
var router = express.Router();
var conn = require("../database");
var getAge = require("get-age");
var nodemailer = require("nodemailer");
var rand = Math.floor(Math.random() * 10000 + 54); // OTP ngẫu nhiên cho mỗi lần đăng ký

// Cấu hình gửi email bằng Nodemailer
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sonvipkl04@gmail.com",
    pass: "gpjq lhhk ffvu iwko", // Cần phải thay đổi mật khẩu để bảo mật hơn
  },
});

var account_address;
var data;

// Hiển thị trang đăng ký cử tri nếu đã đăng nhập
router.get("/form", function (req, res, next) {
  if (req.session.loggedinUser) {
    res.render("voter-registration.ejs");
  } else {
    res.redirect("/login");
  }
});

// Đăng ký cử tri
router.post("/registerdata", function (req, res) {
  var dob = [];
  data = req.body.aadharno; // Lưu số Aadhar
  account_address = req.body.account_address; // Lưu địa chỉ ví MetaMask

  let sql = "SELECT * FROM aadhar_info WHERE Aadharno = ?";
  conn.query(sql, data, (error, results, fields) => {
    if (error) {
      return console.error(error.message);
    }
    if (results.length === 0) {
      return res.send("Số Aadhar không tồn tại!");
    }

    dob = results[0].Dob;
    var email = results[0].Email;
    age = getAge(dob);
    is_registerd = results[0].Is_registered;

    // Kiểm tra xem cử tri đã đăng ký chưa
    if (is_registerd != "YES") {
      if (age >= 18) {
        var mailOptions = {
          from: "sharayuingale19@gmail.com",
          to: email,
          subject: "Please confirm your Email account",
          text: "Hello, Your otp is " + rand,
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });

        // Render trang xác minh email
        res.render("emailverify.ejs");
      } else {
        res.send("Bạn không thể bầu cử vì độ tuổi dưới 18.");
      }
    } else {
      // Nếu đã đăng ký rồi
      res.render("voter-registration.ejs", {
        alertMsg: "Bạn đã đăng ký rồi, không thể đăng ký lại.",
      });
    }
  });
});

// Xác minh OTP
router.post("/otpverify", (req, res) => {
  var otp = req.body.otp;
  if (otp == rand) {
    // So sánh với OTP trong session
    var record = { Account_address: account_address, Is_registered: "Yes" };
    var sql = "INSERT INTO registered_users SET ?";
    conn.query(sql, record, function (err2, res2) {
      if (err2) {
        throw err2;
      } else {
        var sql1 = "UPDATE aadhar_info SET Is_registered=? WHERE Aadharno=?";
        var record1 = ["YES", data];
        console.log(data);
        conn.query(sql1, record1, function (err1, res1) {
          if (err1) {
            res.render("voter-registration.ejs");
          } else {
            console.log("1 record updated");
            var msg = "Bạn đã đăng ký thành công.";
            res.render("voter-registration.ejs", { alertMsg: msg });
          }
        });
      }
    });
  } else {
    res.render("voter-registration.ejs", {
      alertMsg: "Phiên làm việc đã hết hạn! Bạn đã nhập sai OTP.",
    });
  }
});

module.exports = router;
