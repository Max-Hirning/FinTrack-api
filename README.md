# FinTrack API
Welcome to the FinTrack API, a backend service for a fintrack app built using NestJS, MongoDB, and other technologies.

## Getting Started
To get started with the FinTrack API, follow these steps:

- [NestJS](https://nestjs.com/): A progressive Node.js framework for building efficient, reliable, and scalable server-side applications.
- [MongoDB](https://www.mongodb.com/): A NoSQL database for storing recipe data.
- [Cloudinary](https://cloudinary.com/): For storing and serving recipe images.
- [JWT](https://jwt.io/): JSON Web Token for authentication.
- [bcrypt](https://www.npmjs.com/package/bcrypt): A library for hashing passwords securely.
- [Mongoose](https://mongoosejs.com/): A MongoDB object modeling tool.
- [Jest](https://jestjs.io/): A JavaScript testing framework.
- [Supertest](https://github.com/visionmedia/supertest): A library for testing HTTP servers.
- [ESLint](https://eslint.org/): A tool for identifying and reporting on patterns found in ECMAScript/JavaScript code.
- [FXRatesAPI](https://fxratesapi.com/docs): Currencies rates API.

Clone the repository:

1. Copy code:
`git clone https://github.com/Max-Hirning/FinTrack-api.git`

2. Install dependencies:
`npm install`

3. Set up your environment variables by creating a .env file in the root directory. Sample .env variables:
* `EMAIL=""` 
* `EMAIL_PASS=""` 
* `EMAIL_CODE_EXPIRES_IN="1d"` 
* `JWT_TOKEN_EXPIRES_IN="30d"` 
* `ADMIN_ID=""` 
* `ADMIN_EMAIL=""` 
* `ADMIN_PASSWORD=""` 
* `CLOUDINARY_CLOUDNAME=""` 
* `CLOUDINARY_APIKEY=""` 
* `CLOUDINARY_APISECRET=""` 
* `PORT=9000` 
* `ORIGIN_URL=""` 
* `SECRET_KEY=""` 
* `ORIGIN_API_URL=""` 
* `DB_URL=""`
* `ACCESS_TOKEN_CURRENCY="" for FXRatesAPI`

5. Start the development server:
`npm run start:dev`

The API server will start at `http://localhost:${PORT}`.

---
#### **[API DOC](https://cliff-salto-b7b.notion.site/FinTrack-API-f787efe029454048a36df37ffe1a8eb3)**
---

## Support and Contributions
For support, questions, or feedback, please contact maxhirning25@gmail.com.

If you would like to contribute to the FinTrack API, fork the repository and create a new branch for your feature. Submit a pull request with detailed information about the changes.

## License
This project is licensed under the MIT License.


## Additional Commands
***I haven't written the tests yet.***
* Run unit tests:
`npm test`
* Run test coverage:
`npm run test:cov`
* Run linting:
`npm run lint`

Thank you for using the Fintrack API! We hope it helps you manage your finance with ease. Happy coding!



## About the Author
FinTrack API is developed and maintained by Max Hirning. For more projects and updates, visit the [GitHub repository](https://github.com/Max-Hirning).


## Future updates
* Invest tracker(stocks)
* Crypto tracker(cryptocurrencies)
