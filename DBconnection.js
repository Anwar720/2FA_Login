import mysql from 'mysql';

const mysqlConnection = mysql.createConnection({
    connectionLImit:50,
    host:process.env.DATABASE_LINK, 
    port: 3306,
    user: process.env.DATABASE_USER,   
    password:  process.env.DATABASE_PASS,     
    database: 'sql5491682' 
}); 

mysqlConnection.connect(function(err) {
    if (err) console.log (err);
    else console.log('Database is connected successfully !');
});

export {mysqlConnection};