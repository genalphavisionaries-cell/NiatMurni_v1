# Admin panel login — simple guide

**Use this if you can’t log in to the admin panel or don’t know how to set it up.**

---

## Your login details

- **Website address:** Your admin URL (e.g. `https://your-admin.onrender.com/admin` or your custom domain)
- **Email:** `admin@niatmurniacademy.com`
- **Password:** `NiatMurniAdmin!`

You can also use the legacy account: `admin@niatmurni.my` with the same password.

---

## I can’t log in (my site is live on Render)

Do these two things. You only need to do them once (or again if login breaks after a new deploy).

### Step 1: Add one setting in Render

1. Go to [Render](https://dashboard.render.com) and sign in.
2. Open your **admin** service (the one that runs the Laravel admin, not the Go API).
3. Click **Environment** in the left menu.
4. Click **Add Environment Variable**.
5. Set:
   - **Key:** `SESSION_DRIVER`
   - **Value:** `database`
6. Click **Save Changes**. Render will redeploy the service (wait a few minutes).

### Step 2: Run the “fix login” command in Render

1. In Render, stay on your **admin** service.
2. Click **Shell** in the left menu (or the tab that opens a terminal/command line).
3. When the shell is ready, **copy the line below** and paste it into the shell, then press **Enter**:

   ```
   php artisan admin:ensure-admin
   ```

4. Wait until you see lines like “Admin ready: admin@niatmurniacademy.com” and “Login with password: NiatMurniAdmin!”
5. Close the shell.

### Step 3: Try logging in again

1. Open your admin URL in the browser (e.g. `https://your-admin.onrender.com/admin`).
2. Enter:
   - **Email:** `admin@niatmurniacademy.com`
   - **Password:** `NiatMurniAdmin!`
3. Click **Log in**.

If it still doesn’t work, try in a **private/incognito** window and make sure you don’t have a typo in the password (it’s case-sensitive).

---

## I’m testing on my own computer

You need to run a few commands in a terminal (Command Prompt on Windows, or Terminal on Mac).

1. **Open a terminal**
   - **Windows:** Press `Win + R`, type `cmd`, press Enter.
   - **Mac:** Open **Terminal** from Applications → Utilities.

2. **Go to the admin project folder**  
   Type this (change the path if your project is somewhere else):

   - **Windows:**  
     `cd C:\Users\YOUR_USERNAME\Documents\GitHub\NiatMurni_v1\apps\admin-laravel`
   - **Mac:**  
     `cd ~/Documents/GitHub/NiatMurni_v1/apps/admin-laravel`

   Press Enter.

3. **Create/reset admin and password**  
   Copy and paste this, then press Enter:

   ```
   php artisan admin:ensure-admin
   ```

   You should see “Admin ready” messages.

4. **Start the site**  
   Copy and paste this, then press Enter:

   ```
   php artisan serve
   ```

5. **Open the admin in your browser**  
   Go to: **http://localhost:8000/admin**  
   Log in with:
   - **Email:** `admin@niatmurniacademy.com`
   - **Password:** `NiatMurniAdmin!`

---

## Give this to a developer

If someone else manages the server or Render for you, send them this:

**“Please run this once on the Laravel admin service (e.g. in Render Shell):**

```bash
php artisan admin:ensure-admin
```

**And add this environment variable on the admin service:**

- **Key:** `SESSION_DRIVER`  
- **Value:** `database`  

**Then I can log in at `/admin` with:**  
- **Email:** admin@niatmurniacademy.com  
- **Password:** NiatMurniAdmin!  

---

## Still stuck?

- Double-check the **password**: `NiatMurniAdmin!` (capital N, M, A; exclamation mark at the end).
- Try the other email: `admin@niatmurni.my` with the same password.
- If you have a developer or host support, share this file and the “Give this to a developer” section with them.
