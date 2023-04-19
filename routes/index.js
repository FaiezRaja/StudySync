const express = require('express');
const authController = require('../controllers/auth')
const roomsList = [];
const privateRoomsList = [];

const router = express.Router();

router.get('/', authController.isLoggedIn, (req, res) => {
    const randomRoomNameInput = generateRandomRoomName();
    console.log(roomsList); //check if roomsList is being populated
    console.log(privateRoomsList)
    res.render('index', {rooms: roomsList, privateRooms: privateRoomsList, user: req.user, randomRoomNameInput: randomRoomNameInput});
});
  
router.get('/executive', authController.isLoggedIn, (req, res) => {
    res.render('executive', {user: req.user});
});
  
router.get('/engineer', authController.isLoggedIn, (req, res) => {
    res.render('engineer', {user: req.user});
});
  
router.get('/room/', authController.isLoggedIn, (req, res) => {
    var name = req.query.name;
    res.render('rooms', {rooms: name, user: req.user});
});
  
router.get('/addRoom/', (req, res) => {
    const name = req.query.name;
    const roomType = req.query.type; //get room type

    if (roomType === "public") {
        if (!roomsList.includes(name)) {
        roomsList.push(name);
        }
    } else if (roomType === "private") {
        if (!privateRoomsList.includes(name)) {
        privateRoomsList.push(name);
        }
    }
    res.sendStatus(200);
});
  
router.get('/about', authController.isLoggedIn, (req, res) => {
    res.render('about', {user: req.user});
});
  
router.get('/login', (req, res) => {
    const message = '';
    res.render('login', {message: message});
});
  
router.get('/register', (req, res) => {
    const message = '';
    res.render('register', {message: message});
});

router.get('/profile', authController.isLoggedIn, (req, res) => {
    if(req.user) {
        res.render('profile', {
            user: req.user
        });
    } else {
        res.redirect('/login');
    }
});

router.get('/privacy-policy', authController.isLoggedIn, (req, res) => {
    res.render('gdpr', {user: req.user});
});

function generateRandomRoomName() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 16;
    let roomName = '';
    for (let i = 0; i < length; i++) {
        roomName += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return roomName;
}

module.exports = router;