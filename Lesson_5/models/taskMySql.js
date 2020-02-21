const mysql = require('mysql');

const pool = mysql.createPool({
    host: 'localhost',
    database: 'test',
    user: 'Admin',
    password: 'Admin',
    port: 3306,

    connectionLimit: 5,
    waitForConnections: true, 
});

class Task {
    static getAll(){
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if(err){
                    reject(err);
                }

                pool.query('select id, title, status from `tasks`', (err, rawRows) =>{
                    if(err){
                        reject(err);
                    }

                    const rows = JSON.parse(JSON.stringify(rawRows));

                    connection.release();
                    resolve(rows);
                });
            });
        });
    }

    static updTask(id){
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if(err){
                    reject(err);
                }

                pool.query(
                    'update tasks set status = not status where id = ?', 
                    id,
                    (err, result) =>{
                    if(err){
                        reject(err);
                    }
                    connection.release();
                   resolve(result.changedRows);
                });
            });
        });
    }
}

module.exports = Task;