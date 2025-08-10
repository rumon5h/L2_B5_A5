# 🚖 Ride-Booking Backend API

This is a **full-featured backend API** developed for a **ride-sharing platform**, enabling:

- 🡭 **Riders** to book and manage rides  
- 🚗 **Drivers** to manage trips and availability  
- 💪 **Admins** to oversee the entire system  

The project emphasizes **security**, **scalability**, and a **modular architecture** with clear **role-based access control**.

---

## 🔧 Technologies Used

- **Node.js + Express.js** – Backend server and RESTful routing  
- **TypeScript** – Strong typing for safer and scalable code  
- **MongoDB + Mongoose** – NoSQL database and object modeling  
- **JWT** – JSON Web Tokens for secure authentication  
- **bcryptjs** – Hashing passwords securely  
- **Zod** – Request validation and schema enforcement  
- **Passport.js** – Authentication with local and Google OAuth 2.0  
- **cookie-parser + express-session** – Session management  
- **Multer + Cloudinary** – File uploads for driver documents  
- **haversine-distance** – Calculating distance for fare logic  
- **nodemailer** – Sending password reset emails  
- **CORS + dotenv** – Environment and cross-origin config  
- **ts-node-dev** – Development reloading  
- **ESLint** – Code quality enforcement

---

## 🚀 Key Features

### 🔐 Authentication & Role Management

- Secure JWT-based login system  
- Passwords are hashed with bcrypt  
- Roles: **ADMIN**, **RIDER**, **DRIVER**  
- Google OAuth 2.0 support  
- Set password after Google login  
- Forgot/reset/change password with tokens  
- Access/refresh token system with cookies  
- Logout clears session cookies securely

### 🧍 Rider Capabilities

- Request ride (limit: 1 at a time)  
- Fare = Haversine Distance × 100 BDT/km  
- Cancel ride (conditions apply)  
- View ride history  
- Discover nearby drivers (within 1 km)  
- Rate drivers and submit feedback  
- Blocked riders cannot request rides

### 🚗 Driver Capabilities

- Register with vehicle/license info  
- Go online/offline with live location  
- Accept/reject nearby ride requests  
- Ride flow: `ACCEPTED → PICKED_UP → IN_TRANSIT → COMPLETED`  
- Earnings + ride history  
- Complete ride updates income and status  
- Drivers can’t accept their own requests

### 📄 Admin Controls

- Approve/Suspend drivers  
- Block/Unblock users  
- View all users, drivers, rides  
- Earnings report for platform

---

## 🌐 System Architecture

- Modular folders (`auth/`, `rides/`, `drivers/`, etc.)  
- Zod validation and central error handler  
- GeoJSON + Haversine for proximity matching  
- Status tracking with timestamps  
- Secure cookie/token handling  
- Google login token handling

---

## 🔑 Default Credentials

> You can create your own users, but here are some test accounts:

### Admin  
- **Email**: `super@super.com`  
- **Password**: `12345678`

### Driver  
- **Email**: `driver@driver.com`  
- **Password**: `Dr421@!#dsf`

### Rider  
- **Email**: `rider@rider.com`  
- **Password**: `Ri$2fd123@`

## Api endpoints and sample data for testing

### 1. Create new user by credential: method POST
```
https://l2-b5-a5.vercel.app/api/v1/users/register
```

```json
{
    "name": "Md. Rumon Khan",
    "email": "rumon@gmail.com",
    "password": "Rumon#@sdf32"
}
```

### 1.1 Create new user by google test on browser
```
https://l2-b5-a5.vercel.app/api/v1/auth/google/
```

### 2. Login by credential: method POST
```
https://l2-b5-a5.vercel.app/api/v1/auth/login
```
```json
{
    "email": "rumon@gmail.com",
    "password": "Rumon#@sdf32"
}
```
### 3. Get a user data: method GET
```
https://l2-b5-a5.vercel.app/api/v1/users/me/
```
```
Headers > Authorization = "accessToken" (You can get accessToken by login)
```


### 4. Get all user: method GET (Only for Admin)

```
https://l2-b5-a5.vercel.app/api/v1/users/all-users
```
```
Headers > Authorization = "accessToken" (You can get accessToken by login using Admin Credential)
```

### 5. Update a user: method PATCH

```
https://l2-b5-a5.vercel.app/api/v1/users/6896e0646e1175054a336b0d
```

```
Headers > Authorization = "accessToken" (You can get accessToken by login)
```

### 6. Change user status: method PATCH

```
https://l2-b5-a5.vercel.app/api/v1/users/change-status/6896e0646e1175054a336b0d
```
```
{
    "isBlocked" "BLOCKED"
}
```
```
Headers > Authorization = "accessToken" (You can get accessToken by login using Admin Credential)
```

### 7. Get a user data: GET method (For admin)

```
https://l2-b5-a5.vercel.app/api/v1/users/6896e0646e1175054a336b0d
```

### 8. Get new access token: method POST

```
https://l2-b5-a5.vercel.app/api/v1/auth/refresh-token
```

```
Headers > Cookie = "refreshToken" (You can get refreshToken by login to test it)
```

### 9. Log Out: method POST

##### It will clear cookies to logout
```
https://l2-b5-a5.vercel.app/api/v1/auth/logout
```

### 10. Change Password: method POST

```
https://l2-b5-a5.vercel.app/api/v1/auth/change-password
```

```
Headers > Authorization = "accessToken" (You can get accessToken by login)
```

```
{
    "oldPassword": "Dsdfr434#$",
    "newPassword": "Dafd@#4535"
}
```

### 11. Set password: method POST

```
https://l2-b5-a5.vercel.app/api/v1/auth/set-password
```

```
Headers > Authorization = "accessToken" (You can get accessToken by login)
```

```
{
    "password: "Dasdfs#@344"
}
```

### Forgot Password: method POST

```
https://l2-b5-a5.vercel.app/api/v1/auth/forgot-password
```

```
{
    "email: "email@email.com"
}
```

## 🧪 How to Run Locally

### 1. Clone the Repository
```bash
git clone https://github.com/rumon5h/L2_B5_A5.git
cd L2_B4_A5
2. Set environment variables
Create a .env file with:

PORT=
DB_URL=
NODE_ENV=
BCRYPT_SALT_ROUND=
JWT_ACCESS_SECRET=
JWT_ACCESS_EXPIRES=
JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES=
SUPER_ADMIN_EMAIL=
SUPER_ADMIN_PASSWORD=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
EXPRESS_SESSION_SECRET=
FRONTEND_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
3. Install Dependencies

npm install
4. Start Development Server

npm run dev
📍 API Documentation
You can import the Postman collection from:

Postman_Collection/B5-A5_Postman_Collection.json
This includes all routes, sample requests, and expected responses.