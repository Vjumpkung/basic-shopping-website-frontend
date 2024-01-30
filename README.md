# Basic Shopping Website Frontend

<img src="https://res.cloudinary.com/dtyymlemv/image/upload/b_white/v1705941451/basic-shopping-website/m9ga7odxqi2olz4somzu.png" width=150 height=150>

An E-commerce / shopping website which was inspired by famous CMS like Shopify, Woocommerce.

[Production Website](https://basic-shopping-website-frontend.vercel.app/)

## Getting Started

To run fronend in local, following these steps.

1.) Clone this repo.

```
git clone https://github.com/Vjumpkung/basic-shopping-website-frontend.git
```

2.) set up .env and install dependencies
- first rename .env.example to .env 
  
```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```
Fill out these 4 variables.

`NEXT_PUBLIC_API_URL` (backend URL)

`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=` cloudinary cloud name

`NEXT_PUBLIC_CLOUDINARY_API_KEY=` cloudinary api key

`CLOUDINARY_API_SECRET=` cloudinary secret

*using cloudinary for add upload image feature.

then... install dependencies

```
npm install
```

run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

build:
```bash
npm run build
```

start (production mode)
```bash
npm run start
```

## To Do List

User
- [x] Show all products
- [x] Product page
- [x] Login/Logout
- [x] Add to cart 
- [x] Orders
- [x] Manage Address
- [x] Change username/password
- [x] Payment (Promptpay QR with specific amount)
- [ ] Upload slip (like forms)

Admin
- [x] Products
- [x] Choices
- [x] Website Settings (name and logo)
- [x] User
- [ ] Orders
- [ ] Slip
- [ ] Shipping
