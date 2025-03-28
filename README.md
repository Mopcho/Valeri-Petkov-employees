# Employees Project Manager

Manage employees and projects through a REST API

## Navigation

-   [Installation and Usage](#installation-and-usage)
-   [Swagger Documentation, Spec and Postman Collection](#swagger-documentation-spec-and-postman-collection)

## Installation and Usage

1. Run in docker

```cmd
	$ npm run start:docker
```

---

2. Run locally

Before running locally make sure you have set those environment variable:

-   DB_HOST - Host of the database
-   DB_PORT - Port for the database
-   DB_USER - Admin for the database
-   DB_PASSWORD - The password for authenticating with the database
-   DB_NAME - The name of the database
-   JWT_SECRET - Your desired jwt secret

If you are going to run PostgreSQL through the docker-compose.yml file make sure the env variable values match with the ones specified in the compose file.

Install dependencies and build

```cmd
	$ npm i
	$ npm build
```

Run PostgreSQL with docker-compose ( skip if you are using a local installation of PostgreSQL )

```cmd
	$ npm run start:db
```

Run server:

```
	$ npm start
```

---

## Swagger Documentation, Spec and Postman Collection

Once you run the server you can open in your browser:

-   /docs - For the swagger documentation
-   /spec - For the swagger spec

You can find the postman collection in the repository itself, you just have to import it in your postman.

**NOTE:** The Login request is going to automatically set the response token in a variable so you don't have to do it manually yourself.

---

**NOTE**: You can find the api request about the longest collaboration in the postman or swagger. It accepts either an CSV file
or if an CSV file was not passed it will use the database.
