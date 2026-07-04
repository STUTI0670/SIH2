# Receipt Tracker — Complete Beginner's Guide

---

## The Big Picture

This app has three layers working together:

```
Browser (React)  ──axios──▶  Express Server  ──mongoose──▶  MongoDB Atlas
   App.jsx                     server.js                      (cloud DB)
        ◀──────── JSON ────────────────────── JSON ───────────────────
```

- **Frontend** (App.jsx) — what you see and click. Runs at localhost:5173
- **Backend** (server.js) — receives requests, talks to the database. Runs at localhost:5000
- **Database** (MongoDB Atlas) — stores everything permanently in the cloud

Think of it like a restaurant: React is the dining room, Express is the kitchen, MongoDB is the pantry.

---

## SERVER.JS — Line by Line

```js
const express  = require("express");
const cors     = require("cors");
const mongoose = require("mongoose");
```

`require` is Node's way of importing tools — like picking tools from a toolbox before starting work.

- **express** — the web server framework
- **cors** — allows your React app (port 5173) to talk to this server (port 5000).
  Without it, the browser blocks all requests as a security rule.
- **mongoose** — translates JavaScript into MongoDB queries

---

```js
app.use(cors());
app.use(express.json({ limit: "10mb" }));
```

These are **middleware** — code that runs on every single request before it reaches your routes.
Like a security checkpoint at the door.

- `cors()` — unlocks cross-port communication
- `express.json({ limit: "10mb" })` — reads the request body as JSON and converts it into a
  JavaScript object. The 10mb limit is needed because base64 receipt images can be large
  (the default was 100kb — too small)

---

```js
mongoose.connect("mongodb+srv://...")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));
```

Connects to your MongoDB Atlas cloud database using the connection string.
`.then` runs if it works, `.catch` runs if it fails (e.g. IP not whitelisted).

---

```js
const ItemSchema = new mongoose.Schema({
  store:    String,
  amount:   String,
  category: String,
  image:    String,
});
const Item = mongoose.model("Item", ItemSchema);
```

- **Schema** — a blueprint that defines what fields every receipt must have and their data types
- **Model** (Item) — the tool you use to interact with the database:
  - `new Item(data)` — creates a new document
  - `Item.find()` — fetches all documents
  - `Item.findByIdAndDelete(id)` — removes one document

---

## The 4 Routes (CRUD)

**CRUD** = Create, Read, Update, Delete — the four operations every data app needs.

---

### CREATE — POST /items

```js
app.post("/items", async (req, res) => {
  const item = new Item(req.body);
  await item.save();
  res.json(item);
});
```

- Triggered when React calls `axios.post(API, form)`
- `req.body` = the form data React sent (store, amount, category, image)
- `new Item(req.body)` creates a new document
- `.save()` writes it to MongoDB — MongoDB auto-assigns a unique `_id`
- `res.json(item)` sends the saved item back to React

---

### READ — GET /items

```js
app.get("/items", async (req, res) => {
  const items = await Item.find();
  res.json(items);
});
```

- Triggered when React calls `axios.get(API)` on page load
- `Item.find()` with no arguments = "give me everything"
- Sends back the full array of receipts as JSON

---

### DELETE — DELETE /items/:id

```js
app.delete("/items/:id", async (req, res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});
```

- `:id` is a **route parameter** — a placeholder in the URL
- When React calls `axios.delete("/items/abc123")`, Express captures `abc123` as `req.params.id`
- MongoDB finds the document with that `_id` and permanently removes it

---

### UPDATE — PUT /items/:id

```js
app.put("/items/:id", async (req, res) => {
  await Item.findByIdAndUpdate(req.params.id, req.body);
  res.json({ message: "Updated" });
});
```

- Same as delete but instead of removing, MongoDB finds the document by `_id`
  and overwrites its fields with the new data from `req.body`

---

```js
app.listen(5000, () => console.log("Server running"));
```

Starts the server and makes it listen for incoming requests on port 5000.

---

## async/await Explained Simply

Every route has `async` and every database call uses `await`. Here is why.

Talking to a database takes time. Without async/await, the whole server would freeze
and wait — no other requests could be handled meanwhile.

- `async` marks a function as "this will do some waiting"
- `await` says "pause right here until this finishes, but let other code run meanwhile"

**Analogy:** A chef puts a dish in the oven and goes to prep another meal
instead of standing frozen watching it cook.

---

## APP.JSX — The Frontend

### useState — Memory

```js
const [items, setItems] = useState([]);
```

Creates a piece of data (`items`) and its updater function (`setItems`).
When you call `setItems(newData)`, React automatically re-renders the page with the new value.
Never change state directly — always use the setter.

| State      | Stores                                         |
|------------|------------------------------------------------|
| form       | What is typed in all 4 inputs                  |
| items      | All receipts from MongoDB                      |
| editId     | Which receipt is being edited (null = Add mode)|
| search     | Store search text                              |
| filterCat  | Category filter text                           |
| viewImg    | Image URL for lightbox (null = closed)         |
| isDark     | Dark mode on/off                               |

---

### useEffect — Runs Once on Load

```js
useEffect(() => { fetchItems(); }, []);
```

The `[]` means "run this exactly once, right after the component first appears on screen."
This is where the initial data fetch happens.

**Analogy:** An alarm set for when you arrive at work — fires once, does its job.

---

### Data Flow — Adding a Receipt

1. User types → `onChange` fires → `setForm(...)` updates state → input reflects new value
2. User picks image → `FileReader` converts it to base64 string → stored in `form.image`
3. User clicks **Add** → `submit()` runs → `axios.post(API, form)` sends data to Express
4. Express saves to MongoDB → MongoDB assigns `_id` → sends saved item back
5. `fetchItems()` re-runs → `setItems(res.data)` → React re-renders → new row appears in table

---

### Data Flow — Editing a Receipt

1. User clicks pencil icon → `edit(item)` runs → fills form with existing data →
   stores `item._id` in `editId`
2. Form inputs now show current values. Button changes from "+ Add" to "✓ Update".
   Blue "Editing" badge appears.
3. User changes values → `onChange` updates `form` state as usual
4. User clicks **Update** → `submit()` sees `editId` is not null →
   `axios.put(`${API}/${editId}`, form)` → Express calls `findByIdAndUpdate`
5. MongoDB overwrites the fields → `fetchItems()` reloads → updated row shows in table

---

### Data Flow — Deleting a Receipt

1. User clicks trash icon → `remove(item._id)` runs
2. `axios.delete(`${API}/${id}`)` → Express calls `findByIdAndDelete`
3. MongoDB removes the document → `fetchItems()` reloads
4. React re-renders — the row plays an exit animation (fades + collapses) before disappearing

---

### Data Flow — Searching and Filtering

No server request needed — all happens in the browser:

```js
const rows = items.filter(
  (i) =>
    (i.store || "").toLowerCase().includes(search.toLowerCase()) &&
    (i.category || "").toLowerCase().includes(filterCat.toLowerCase())
);
```

`items` always holds the full list. `rows` is a filtered copy recalculated on every render.
As the user types, React re-renders, `rows` updates, and the table shows only matching receipts.
Real-time with zero network requests.

---

### Dark Mode — Pure CSS

```jsx
<div className={`shell ${isDark ? "dark" : ""}`}>
```

When `isDark` is true, the div gets the class `dark`. The CSS defines two sets of
colour variables — one under `:root` (light) and one under `.dark`.
Adding that class swaps all variables at once. Every element uses `var(--bg)`
or `var(--text)` so they all update automatically.

**Analogy:** All lights in the house wired to one master switch. Flip it — everything changes.

---

### The StyleInjector Pattern

```js
function StyleInjector() {
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = css;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);
  return null;
}
```

This invisible component's only job is to insert the CSS string into the page's `<head>`
so the browser reads it as a stylesheet. `return null` means it renders nothing visible.
The cleanup function removes the style tag if the component ever unmounts.

---

### CSS Grid — The Table Columns

```css
grid-template-columns: 40px 2fr 80px 2fr 88px;
```

Five columns: image (40px fixed), store (flexible), amount (80px fixed),
category (flexible), actions (88px fixed).
The header row and every data row use the exact same definition —
that is why data lines up perfectly under the headings.

---

## Key Terms Cheat Sheet

| Concept         | One-Line Explanation                            | Analogy                                     |
|-----------------|-------------------------------------------------|---------------------------------------------|
| useState        | Stores data that can change                     | A sticky note you can rewrite               |
| useEffect       | Runs code once after the component appears      | An alarm set for when you arrive at work    |
| async/await     | Wait for slow operations without freezing       | Chef puts dish in oven, preps other food    |
| axios.get       | Fetch data from server                          | Calling the kitchen to ask what is available|
| axios.post      | Send new data to server to be stored            | Placing a new order                         |
| axios.put       | Update existing data on the server              | Calling to change your order                |
| axios.delete    | Remove data from the server                     | Cancelling your order                       |
| ...spread       | Copy all properties of an object                | Photocopying a form and changing one field  |
| .filter()       | Keep only items that pass a test                | A bouncer who checks everyone at the door   |
| .map()          | Transform every item in an array                | Assembly line worker modifying each product |
| base64          | Image file converted to a plain text string     | Describing a painting in words              |
| CSS variables   | Named colour values reused everywhere           | A paint swatch referenced across a blueprint|
| Controlled input| Input always shows exactly what is in state     | A screen showing only what the computer says|
| Middleware      | Code that runs on every request before routes   | Security checkpoint at the building entrance|
| Schema          | Blueprint for what a database document must have| A form template every receipt must fill in  |
| Route parameter | Placeholder in a URL like /items/:id            | A blank in a sentence you fill in later     |
| Promise.all     | Run multiple async operations in parallel       | Several chefs cooking different dishes at once|

---

## How to Run the App

**Terminal 1 — Start the backend:**
```bash
cd "c:\Users\stuti\Desktop\jfd\Dev\HP\New folder\crud-backend"
node server.js
```
Should print: `Server running` and `MongoDB Connected`

**Terminal 2 — Start the frontend:**
```bash
cd "c:\Users\stuti\Desktop\jfd\Dev\HP\New folder\my-react-app"
npm run dev
```

Then open `http://localhost:5173` in your browser.
Both terminals must stay running at the same time.
