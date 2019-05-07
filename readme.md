# Game Platform

## About
This is the server side application for an online game platform of Texas hold 'em. Users can register and login using username and passowrd or use google account to log in. User information will be stored in a cloud Mongodb database. Chips are necessary for playing games and are also stored in the database. The users can create room and join room to play the game. The rooms will be stored in the server's memory instead of the database. Therefore, we limit the number of room that can be created to only three.

## Installation

```bash
npm install # install all dependencies

npm build # compile TypeScript files to JavaScript files

npm start # start application
```

Put `googleClientID`, `googleClientSecret`, `cookieKey`, and `mongoUri` inside `config/keys.js`.

## Dependencies
node js
mongoose
socket.io
passport

## Endpoints
`/register` (POST) Used for registration user with username and password
| param | type |
| :---: | :---: |
| username | String |
| password | String |

`/login` (POST) Used for login user with username and password  
| param | type |
| :---: | :---: |
| username | String |
| password | String |

`/login/google` (GET) Used for registration and login user with google authentication  
`/logout` (GET) Used for log out the current user  
`/me` (GET) Used for get user information  
`/me` (PATCH) Used for update user information  
| param | type |
| :---: | :---: |
| password | String |
| name | String |
| chip | Number |