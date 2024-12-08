var mysql = require('mysql2'); // Đổi từ 'mysql' thành 'mysql2'

var conn = mysql.createConnection({
  host: 'localhost', // assign your host name
  user: 'root',      // assign your database username
  password: '12345678',      // assign your database password
  database: 'aadhar' // assign database Name
});

conn.connect(function(err) {
  if (err) {
    console.error('Error connecting to the database:', err.message);
    return;
  }
  console.log('Database is connected successfully!');
});

module.exports = conn;
