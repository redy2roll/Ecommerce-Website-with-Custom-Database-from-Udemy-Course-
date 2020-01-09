const express = require('express');
const { check, validationResult } = require('express-validator');

const usersRepo = require('../../repositories/users.js');
const signupTemplate = require('../../views/admin/auth/signup.js');
const signinTemplate = require('../../views/admin/auth/signin.js');
const { requireEmail, requirePassword, requirePasswordConfirmation } = require('./validators.js');
const router = express.Router();

router.get('/signup', (req, res) => {
    res.send(signupTemplate({req}));
});

router.post('/signup',
    [
        requireEmail,
        requirePassword,
        requirePasswordConfirmation
    ],
    async(req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.send(signupTemplate({req, errors}));
        }
        const {email, password, passwordConfirmation} = req.body;
        const user = await usersRepo.create({email, password});
        req.session.userId = user.id
        res.send('Account Created!');
    }
);

router.get('/signout', (req, res) => {
    req.session = null;
    res.send('You are now logged out, please login to make changes to your account');
});

router.get('/signin', (req, res) => {
    res.send(signinTemplate({}));
});

router.post('/signin',
    [
        check('email')
            .trim()
            .normalizeEmail()
            .isEmail()
            .withMessage('Please provide a valid email')
            .custom(async(email) => {
                const user = await usersRepo.getOneBy({email});
                if(!user){
                    throw new Error('Email not found');
                }
            }),
        check('password')
            .trim()
            .custom(async(password, {req}) => {
                const user = await usersRepo.getOneBy({email: req.body.email});
                if(!user){
                    throw new Error('Invalid password');
                }
                const validPassword = await usersRepo.comparePasswords(
                    user.password,
                    password
                );
                if(!validPassword){
                    throw new Error('Invalid password');
                }
            })
    ], 
    async(req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.send(signinTemplate({errors}));
        }
        const {email} = req.body;
        const user = await usersRepo.getOneBy({email});
        
       
        
        req.session.userId = user.id;
        res.send('You Are Signed In!')
    }   
);

module.exports = router;


