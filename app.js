"use strict";

/**
 * Name: Yuanchao Ye
 * Date: 05-01-2024
 * Section: AA/Kevin Wu
 *
 * This is the server for the Lovely Kid App. It contains 6 API:
 * get('/icons') to retrieve icons, get('/getname') to retrieve
 * username, get('/getuserinfo') to retrieve information for all
 * users. post('/saveuser') to save username that the user
 * created. post('/saverules') to save the user-defined rules.
 * post('/savestars') to update the stars for the kid.
 */

// import the required package
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');

const app = express();

app.use(multer().none());
app.use(express.urlencoded({extended: true}));
app.use(express.json());

const ICON_PATH = './public/icons/';
const USER_FILEPATH = 'users.json';
const FOUR_HUNDRED = 400;
const FIVE_HUNDRED = 500;

/**
 * Retrieves the list of available icons from the server and sends them as a JSON response.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - JSON response containing the list of icons
 * or error message.
 */
app.get('/icons', async (req, res) => {
  try {
    const files = await fs.readdir(ICON_PATH);
    if (files) {
      const icons = files.map(file => path.join(ICON_PATH, file));
      res.json({icons});
    } else {
      res.type('text').status(FOUR_HUNDRED)
        .send('Error reading directory');
    }
  } catch (err) {
    res.type('text').status(FIVE_HUNDRED)
      .send('Server Error. Try again');
  }
});

/**
 * Retrieves the list of username from the server and sends them
 * as a JSON response.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - JSON response containing the list of users
 * or error message.
 */
app.get('/getname', async (req, res) => {
  try {
    let usersData = await readUserDataFromFile(USER_FILEPATH);
    if (usersData) {
      let keys = Object.keys(usersData);
      res.json({users: keys});
    } else {
      res.type('text').status(FIVE_HUNDRED)
        .send('Server Error. Try again');
    }
  } catch (err) {
    res.type('text').status(FOUR_HUNDRED)
      .send('Create user first');
  }
});

/**
 * Retrieves all the users' info from the server and sends them
 * as a JSON response.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - JSON response containing the list of users
 * info or error message.
 */
app.get('/getuserinfo', async (req, res) => {
  try {
    let userData = await readUserDataFromFile(USER_FILEPATH);
    if (userData && Object.keys(userData).length > 0) {
      res.json({users: userData});
    } else {
      res.type('text').status(FOUR_HUNDRED)
        .send('No user exists. Create User First!');
    }
  } catch (err) {
    res.type('text').status(FIVE_HUNDRED)
      .send('Server Error. Try again');
  }
});

/**
 * Save a new user with the provided username and icon that created by the user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - Text response indicating success or
 * failure of user creation.
 */
app.post('/saveuser', async (req, res) => {
  res.type('text');
  const {username, icon} = req.body;
  if (!username) {
    res.status(FOUR_HUNDRED).send('Input username');
  } else {
    try {
      let existingData = {};
      try {
        const data = await fs.readFile(USER_FILEPATH);
        if (data.length > 0) {
          existingData = JSON.parse(data);
        }
      } catch (err) {
        res.status(FIVE_HUNDRED).send('Server Error. Try again');
      }
      if (username in existingData) {
        res.status(FOUR_HUNDRED).send('User already exists');
      } else {
        existingData[username] = {icon, star: 0};
        await writeUserDataToFile(USER_FILEPATH, existingData);
        res.send('User Created');
      }
    } catch (err) {
      res.status(FIVE_HUNDRED).send('Server Error. Try again');
    }
  }
});

/**
 * Handles the creation of a new user with the provided username and icon.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - Text response indicating success or
 * failure of user creation.
 */
app.post('/saverules', async (req, res) => {
  res.type('text');
  const {username, rules} = req.body;
  const newRules = JSON.parse(rules);
  if (!newRules || Object.keys(newRules).length === 0) {
    res.status(FOUR_HUNDRED).send('Add rules first');
  } else {
    try {
      const userData = await fs.readFile(USER_FILEPATH);
      const existingData = JSON.parse(userData);
      if (username in existingData) {
        if (existingData[username].rules) {
          existingData[username].rules = {...existingData[username].rules, ...newRules};
        } else {
          existingData[username].rules = newRules;
        }
        await writeUserDataToFile(USER_FILEPATH, existingData);
        res.send('Rules updated for ' + username);
      } else {
        res.status(FOUR_HUNDRED).send('User does not exist');
      }
    } catch (err) {
      res.status(FIVE_HUNDRED).send('Server Error. Try again');
    }
  }

});

/**
 * Update stars for the specifical username.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - Text response indicating success or
 * failure of user creation.
 */
app.post('/savestars', async (req, res) => {
  res.type('text');
  let {star, user} = req.body;
  try {
    const userData = await fs.readFile(USER_FILEPATH);
    const existingData = JSON.parse(userData);

    if (user in existingData) {
      if (existingData[user].star) {
        existingData[user].star = star;
      } else {
        existingData[user].star = JSON.parse(star);
      }
      await writeUserDataToFile(USER_FILEPATH, existingData);
      res.send('Star has updated for ' + user);
    } else {
      res.status(FOUR_HUNDRED).send('User does not exist');
    }
  } catch (err) {
    res.status(FIVE_HUNDRED).send('Server Error. Try again');
  }
});

/**
 * Reads user data from a specified file path and returns the
 * parsed JSON data.
 * @param {string} filePath - The path to the user data file.
 * @returns {Object} - Parsed JSON data containing user
 * information.
 */
async function readUserDataFromFile(filePath) {
  const data = await fs.readFile(filePath);
  return JSON.parse(data);
}

/**
 * Writes user data to a specified file path in JSON format.
 * @param {string} filePath - The path to the user data file.
 * @param {Object} userData - The user data to be written to the file.
 * @returns {void}
 */
async function writeUserDataToFile(filePath, userData) {
  const jsonData = JSON.stringify(userData, null, 2);
  await fs.writeFile(filePath, jsonData);
}

app.use(express.static('public'));

// add port to listen
const PORT_NUM = 8000;
const PORT = process.env.PORT || PORT_NUM;
app.listen(PORT);
