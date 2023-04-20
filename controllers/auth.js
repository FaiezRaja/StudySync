const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {promisify} = require('util');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if( !email || !password) {
            const message = 'Please provide an email and password';
            return res.status(400).render('login', {
                message: message
            });
        }

        db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
            console.log(results);
            if (!results || results.length === 0 || !(await bcrypt.compare(password, results[0].password)) ) {
                const message = 'Email or password is incorrect';
                return res.status(401).render('login', {
                    message: message
                });
            } else {
                const id = results[0].id;
                
                const token = jwt.sign({ id }, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN
                });

                console.log("The token is: " + token);

                const cookieOptions = {
                    expires: new Date(
                        //cookie expires in 90 days, calculated using milliseconds
                        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                    ),
                    httpOnly: true
                }

                res.cookie('jwt', token, cookieOptions);
                res.status(200).redirect("/");

            }
        });
    } catch (error) {
        console.log(error);
    }
}

exports.register = (req, res) => {
    console.log(req.body);

    const {name, email, password, passwordConfirm} = req.body;

    db.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) => {
        if(error) {
            console.log(error);
        }
        if(results.length > 0) {
            const message = 'That email is already in use';
            return res.render('register', {
                message: message
            })
        }   else if(password !== passwordConfirm) {
            const message = 'Passwords do not match';
            return res.render('register', {
                message: message
            })
        }


        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);

        db.query('INSERT into users SET ?', {name: name, email: email, password: hashedPassword}, (error, results) => {
            if (error) {
                console.log(error);
            } else {
                console.log(results);
                const message = 'User registered';
                return res.render('register', {
                message: message
                });
            }
        })
        
    });

}

exports.isLoggedIn = async (req, res, next) => {
    console.log(req.cookies);
    if(req.cookies.jwt) {
        try {
            //Verify token
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
            console.log(decoded);
            
            //Check if user still exists
            db.query('SELECT * FROM users WHERE id = ?', [decoded.id], (error, result) => {
                console.log(result);
                
                if(!result) {
                    return next();
                }
                
                req.user = {
                    id: result[0].id,
                    name: result[0].name,
                    email: result[0].email,
                }
                return next();
            });
        
        } catch(error) {
            console.log(error);
            return next();
        }
    } else {
        next();
    }

}

exports.logout = async (req, res) => {
    res.cookie('jwt', 'logout', {
        maxAge: 0,
        httpOnly: true
    });

    res.status(200).redirect('/');
}