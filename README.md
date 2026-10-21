# Saanjh — Nightwear & Intimates Store

Aesthetic e-commerce website for nightwear & undergarments (Nepal).
**Backend:** Node.js + Express · **Frontend:** React (Vite) · Everything is editable from the admin panel.

## Quick start

```bash
npm run install:all      # first time only
cp server/.env.example server/.env   # then change ADMIN_PASSWORD
npm run dev              # starts API (5000) + website (5173)
```

- Website → http://localhost:5173
- Admin → http://localhost:5173/admin (password from `server/.env`, default `admin123`)

`npm run seed` resets the store to the demo data (deletes all orders!).

## What you can change from /admin

| Page | What |
|---|---|
| Orders | See orders, call customer, change status (pending → confirmed → shipped → delivered) |
| Products | Add / edit / hide products, photos, sizes, colours, price, old price, stock |
| Categories | Name, tagline, photo, order |
| Store Settings | Store name, announcement bar, homepage slides (photo or video), story, delivery charges, contact, social links |

Products without photos show a soft satin-coloured placeholder, so the site looks finished while you shoot photos.

## Folder structure

```
server/                     Node.js API
  src/index.js              app entry (also serves the built React site in production)
  src/routes/index.js       every API URL in one place
  src/controllers/          logic for products, categories, orders, settings, upload, login
  src/db/store.js           tiny JSON database (data/db.json) — swap for MongoDB later
  src/db/seedData.js        demo products & default settings
  uploads/                  uploaded photos/videos

client/src/
  api/client.js             all requests to the backend
  context/                  Settings (store data), Cart, Auth (admin login)
  hooks/                    useFetch, useInView
  styles/global.css         colours & fonts (design tokens) — change the look here
  components/
    ui/                     Button, Icon, Price, ProductImage, Field, Loader, Reveal…
    layout/                 Header, Footer, AnnouncementBar, Drawer, MobileMenu
    home/                   Hero, Promises, CategoryShowcase, ProductSection, BrandStory, SocialCTA
    product/                ProductCard, ProductGrid, ProductGallery, OptionPicker, Accordion
    cart/                   CartDrawer, CartItem, FreeShippingMeter
    admin/                  AdminLayout, Panel, ImageUploader, TagInput, ColorListInput
  pages/                    Home, Shop, ProductDetail, Checkout, OrderSuccess, admin/*
```

Every component has its own `.module.css` file next to it.

## Going live

```bash
npm run build    # builds React into client/dist
npm start        # one Node server serves both API and website on PORT
```

Host on any Node VPS (e.g. a Nepali VPS or Render/Railway with a persistent disk for `server/data` and `server/uploads`).
