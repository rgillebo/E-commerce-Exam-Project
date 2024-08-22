# Noroff E-commerce Exam Project 
A E-commerce application based of a API where users can shop online. Also contains a separate admin interface for managing the application. 

## TABLE OF CONTENTS
- [Technologies used](#technologies-used) 
- [Setup](#setup)
   - [Prerequisites](#prerequisites) 
   - [Installation](#installation)
   - [Database Setup](#database-setup)
   - [Environment Variables](#environment-variables)
- [Usage](#usage)
   - [Running the server](#running-the-server)
   - [Inital database population](#initial-database-population)
   - [Admin interface](#admin-interface)
- [Testing](#testing)
- [API documentation](#api-documentation)
- [References](#references)
- [Contributors](#contributors)



## TECHNOLOGIES USED
- **Node.js:** JavaScript runtime used for server-side development. This app uses version "v20.12.2".
- **Sequelize:** A promise-based Node.js ORM used to manage database interactions.
- **MySQL:** A relational database management system, used as the database to store and manage the application data. 
- **JWT:** A secure way of representing claims between two parties, used for authentication and authorization. 
- **EJS:** A template language for HTML markup, used for server side rendered views. 
- **bcrypt:** A library to hash passwords, used for user password hashing and secure storage. 
- **Swagger:** Used for creating dynamic API documentation that can be interacted with in the browser. 
- **Express:** Web framework for building the server and handling routes.
- **dotenv:** For managing environment variables.
- **Axios:** For making HTTP requests.
- **Other dependencies** listed in the [package.json] file.

## SETUP
### Prerequisites 

Before setting up the project, make sure the following is installed: 
- [Node.js](https://nodejs.org/en/download/package-manager)
- [MySQL Installer (Version 8.0.37)](https://dev.mysql.com/downloads/windows/installer/8.0.html)
- When installing choose the custom option, and select the 'MySQL Server 8.0 & MySQL Workbench 8.0'
- A inital connection will have to be made for the database and table creation to work on app start, here is a step by step guide: 
1. Open MySQL workbench
2. Connect to MySQL with the default connection, or create your own
3. Follow steps in [Database Setup](#database-setup) and [Database Access](#database-access)
---
### Installation

1. Clone the repository:

```
git clone https://github.com/rgillebo/E-commerce-Exam-Project
cd E-commerce-Exam-Project

``` 

2. Install dependencies 

```
npm install
```
---
### Database Setup
To create the database for the web application run the following SQL script in MySQL workbench: 

``` 
CREATE DATABASE IF NOT EXISTS noroff_e_commerce; 
```
---
### Database Access 

To setup the database access, the following SQL script can be used: 

```
CREATE USER 'EP1Admin'@'localhost' IDENTIFIED BY 'P@ssword2023';
GRANT ALL PRIVILEGES ON noroff_e_commerce.* TO 'EP1Admin'@'localhost';
FLUSH PRIVILEGES;
```

--- 

### Environment Variables
Create a '.env' file in the root directory of the project and add the following variables: 

```
JWT_SECRET=c0a816e4321404618d4249054a2378c70b460bc00843f418539fa64ef9e5b4af8e4ec674921686abd216366002b4d81112c77734084ccf8001e8faef2dc6f1ed
DATABASE_NAME=noroff_e_commerce
DATABASE_USER=EP1Admin
DATABASE_PASSWORD=P@ssword2023
DATABASE_HOST=localhost
``` 
--- 

## USAGE

### Running the server
1. Start the server: 

``` 
npm start
```
The server will start on '[http://localhost:3000](http://localhost:3000)' 

---

### Initial database population
1. Initialze the database from the API: 

   - Navigate to '[http://localhost:3000/utility/init](http://localhost:3000/utility/init)' to populate the database with initial data from the API, roles and an admin user.

   - This can also be achieved through sending a POST request through postman with the same endpoint. 

--- 

### Admin interface

- Login: Navigate to [http://localhost:3000/admin/login](http://localhost:3000/admin/login) and log in using the admin credentials.


---



## TESTING

1. For the test to run as intended, a user with the credentials listed in the [auth.test.js](/tests/auth.test.js) must be created. This can be done through the [routes/users.js](/routes/users.js) endpoint of /register which is setup with the correct credentials. 

2. To run tests, use the following command: 

```
npm test
```

---

## API DOCUMENTATION

The API documentation (Swagger), including methods, description, and JSON objects, is accessible from the endpoint `/doc` from the [http://localhost:3000/doc](http://localhost:3000/doc).

### Guest Endpoints

- **Products**
  - GET `/products`: Retrieve all products.
  - GET `/products/:id`: Retrieve a product by ID.
- **Categories**
  - GET `/categories`: Retrieve all categories.
  - GET `/categories/:id`: Retrieve a category by ID.
- **Brands**
  - GET `/brands`: Retrieve all brands.
  - GET `/brands/:id`: Retrieve a brand by ID.
- **Search**
  - POST `/search`: Search for products by name, category, or brand.

### User Endpoints

- **Cart**
  - POST `/cart`: Add a product to the cart.
  - GET `/cart`: View cart items.
  - PUT `/cart`: Update cart item quantity.
  - DELETE `/cart`: Remove item from the cart.
  - POST `/cart/checkout/now`: Checkout the cart.
- **Orders**
  - GET `/orders`: Get all orders for the logged-in user.
  - GET `/orders/:id`: Get order by ID for the logged-in user.

### Admin Endpoints

- **Admin Login**
  - POST `/admin/login`: Login as admin.
- **Admin Logout**
  - GET `/admin/logout`: Logout as admin.
- **Admin Dashboard**
  - GET `/admin`: Access the admin dashboard.
- **Manage Products**
  - GET `/admin/products`: Retrieve all products.
  - GET `/admin/products/:id`: Retrieve product by ID.
  - POST `/admin/products`: Add a new product.
  - PUT `/admin/products/:id`: Update product by ID.
  - DELETE `/admin/products/:id`: Soft delete product.
  - PUT `/admin/products/:id/status`: Soft undelete product.
- **Manage Brands**
  - GET `/admin/brands`: Retrieve all brands.
  - GET `/admin/brands/:id`: Retrieve brand by ID.
  - POST `/admin/brands`: Add a new brand.
  - PUT `/admin/brands/:id`: Update brand by ID.
  - DELETE `/admin/brands/:id`: Delete brand.
- **Manage Categories**
  - GET `/admin/categories`: Retrieve all categories.
  - GET `/admin/categories/:id`: Retrieve category by ID.
  - POST `/admin/categories`: Add a new category.
  - PUT `/admin/categories/:id`: Update category by ID.
  - DELETE `/admin/categories/:id`: Delete category.
- **Manage Users**
  - GET `/admin/users`: Retrieve all users.
  - GET `/admin/users/:id`: Retrieve user by ID.
  - PUT `/admin/users/:id`: Update user by ID.
- **Manage Orders**
  - GET `/admin/orders`: Retrieve all orders.
  - GET `/admin/orders/:id`: Retrieve order by ID.
  - PUT `/admin/orders/:id/status`: Update order status by ID.
- **Search**
  - POST `/admin/products/search`: Search products by name, category, or brand.
  - POST `/admin/orders/search`: Search orders by user and status.

---

## REFERENCES

- [https://www.w3schools.com/](https://www.w3schools.com/)
- [https://chatgpt.com/](https://chatgpt.com/)
- [https://www.codecademy.com/](https://www.codecademy.com/)
- [https://www.linkedin.com/learning](https://www.linkedin.com/learning)
- [https://www.boot.dev/](https://www.boot.dev/)
- [https://www.youtube.com/](https://www.youtube.com/)
- [https://freeCodeCamp.org](https://freeCodeCamp.org)
- [https://github.com/](https://github.com/)
- [https://www.coursera.org/](https://www.coursera.org/)
- [https://www.digitalocean.com/community](https://www.digitalocean.com/community)
- My own previous projects.
- Previous Noroff courses.

 ---

## CONTRIBUTORS

- [Ruben Gillebo Kjær]

---

