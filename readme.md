# Game Platform

## Installation

```bash
npm install # install all dependencies

npm build # compile TypeScript files to JavaScript files

npm start # start application
```

Put keys inside config/keys.js.

## Endpoints
`/register` (POST) Used for registration user with username and password
`/login` (POST) Used for login user with username and password
`/login/google` (GET) Used for registration and login user with google authentication
`/logout` (GET) Used for log out the current user
`/me` (GET) Used for get user information
`/me` (PATCH) Used for update user information
