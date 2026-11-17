# FridgeMind: Smart Refrigerator & AI Personal Nutrition System

> **A decoupled, full-stack IoT Smart Refrigerator platform integrating real-time perishable inventory tracking, predictive food-waste prevention, an interactive 32-bit pixel-art kitchen assistant, and BITE MODE—a clinical AI diet and metabolic intelligence engine.**

---

## 📌 1. Project Title & Description

**FridgeMind** is an advanced IoT-inspired Smart Kitchen and Personal Nutrition Management system. It simulates the interactive touchscreen interface of next-generation smart refrigerators (e.g., Samsung Family Hub / LG InstaView ThinQ) while coupling it with an enterprise Spring Boot REST API and clinical metabolic calculation algorithms.

Beyond ordinary inventory management, FridgeMind introduces **BITE MODE**: an automated clinical nutrition companion that analyzes body biometrics, daily caloric targets (via the clinical Mifflin-St Jeor equation), and live food provisions to construct zero-waste, macro-balanced daily meal plans, food substitutions, and automated grocery deficit restock lists.

---

## ❗ 2. Problem Statement

Household food waste is an escalating economic and environmental crisis:
1. **Perishable Food Waste**: Consumers routinely discard edible provisions because food hidden in refrigerator crispers expires unnoticed.
2. **Disconnected Nutrition Planning**: Popular diet and fitness apps operate in a silo, prescribing rigid meals without knowing what ingredients the user actually has at home.
3. **Complex Setup Barriers**: Traditional IoT smart appliance interfaces require proprietary vendor hardware, while academic software prototypes often require convoluted database installations that hinder quick evaluation and reproducibility.

**FridgeMind solves this** by delivering a decoupled, full-stack architecture that tracks real-time inventory expiry, calculates dynamic clinical dietary targets, generates meals directly from live refrigerator contents, and runs out of the box with zero database configuration.

---

## ✨ 3. Main Features

### 🖥️ Kitchen Control Dashboard
- **4 Real-Time KPI Cards**: Total items, Safe & Fresh provisions, Expiring Soon alerts ($\le 72\text{ hours}$), and Expired item flags.
- **Interactive 2D Food Category Donut Chart**: Visual distribution across Fruits, Vegetables, Dairy, Meat, Beverages, and Pantry, with drill-down detail inspection.
- **Priority Expiry Alerts**: Separated into high-priority **Expired** and amber-badged **Expiring Soon** sections, with real food product photography and instant one-click removal.

### 📦 Real-Time Smart Inventory Management
- **Visual Inventory Grid**: High-resolution thumbnails, precise quantity and unit controls, purchase dates, expiry dates, storage location badges, and live days-remaining countdowns.
- **Search, Multi-Filtering & Sorting**: Instant text search, category dropdowns, status pills (*All, Expired, Expiring Soon, Fresh, Low Stock*), and multi-criteria sorting.
- **Nutritional Details Slide-in Drawer**: Deep inspection panel displaying verified USDA nutritional breakdown per 100g (Calories, Protein, Carbs, Lipids, Fiber, Micronutrients), optimal storage temperatures, and shelf placement.
- **Low-Stock Intelligence**: Configurable minimum stock thresholds with automatic low-stock warnings.

### 📱 Smart Refrigerator Door Touchscreen
- **3x3 Compartment Grid**: Displays refrigerator cooling zones (Crisper drawers, Main decks, Chiller shelves, Door racks).
- **Handcrafted 32-Bit Pixel Chef Mascot**: Animated interactive kitchen assistant with 6 distinct emotional and reactive states (`idle`, `blink`, `happy`, `worried`, `warn`, `thinking`) that react dynamically to inventory expiry conditions and user touch interactions.
- **Ambient Appliance Telemetry**: Live digital clock, humidity levels ($88\%$ RH), and internal zone temperature gauges ($3.2^\circ\text{C}$).

### 🥗 BITE MODE: AI Personal Nutrition & Diet Intelligence System
- **Module 1 — Personal Nutrition Profile**: Onboarding assessment capturing weight, target weight, height, age, biological sex, activity level (5 clinical tiers), fitness goals (*Lose weight, Maintain, Gain weight, Build muscle*), dietary preferences (*Vegetarian, Vegan, Non-Veg, Eggetarian, Pescatarian*), and allergen exclusions.
- **Module 2 — Clinical Metabolic Intelligence**: Deterministic clinical calculations using the **Mifflin-St Jeor Equation** for BMR, TDEE, safe caloric targets (with clinical floors: $\ge 1200\text{ kcal}$ female, $\ge 1500\text{ kcal}$ male), macronutrient distribution, and RDA micronutrients.
- **Module 3 — Live Fridge Meal Plan Generator**: Assembles Breakfast, Lunch, Snack, and Dinner directly from available refrigerator provisions, prioritizing items nearing expiration to eliminate food waste.
- **Module 4 — Flexible Diet Mode ("Build My Today's Diet")**: Adapts meals to daily cravings (*Indian, Continental, High Protein, Light, Comfort, Express*) and selective exclusions (e.g., *No Vegetables Today*), explaining nutritional trade-offs and compensating missing nutrients.
- **Module 5 — Intelligent Food Substitution Engine**: Side-by-side macro and allergen-safe replacement options with real-time delta calculations ($\Delta\text{Calories}, \Delta\text{Protein}, \Delta\text{Carbs}, \Delta\text{Fat}$).
- **Module 6 — Smart Grocery Recommendations**: Detects nutritional gaps between fridge provisions and weekly targets, organizing recommendations into 5 shelves (*Essential, Protein, Fiber, Vitamins, Healthy Fats*) with 1-click **"+ Add to Fridge"** auto-restock calling `POST /api/foods`.
- **Module 7 — 7-Day Precision Weekly Planner**: Rotating weekly meal schedules with consistency scoring and individual day regeneration.
- **Module 8 — Daily Food Tracker / Journal**: Separate tracking of planned vs. actually consumed meals with live SVG Calorie Ring and macronutrient bar updates.
- **Module 9 — AI Nutrition Assistant**: Grounded conversational assistant answering contextual meal and inventory questions.
- **Module 10 — Weight Progress Analytics**: Interactive SVG trend chart plotting weight history against the target curve with educational physiological guidance on hydration fluctuations.

---

## 🛠️ 4. Technologies Used

### Frontend Client
- **HTML5 & CSS3**: Custom modern CSS variables, glassmorphism, flexbox, responsive CSS grids, and SVG data graphics.
- **Vanilla ES6+ JavaScript**: Clean, framework-agnostic client architecture with asynchronous Fetch API, state stores, and zero bloated build dependencies.
- **Pixel Art Engine**: Handcrafted 32-bit pixel-art sprite matrices rendered with pixelated scaling and CSS keyframe animations.
- **USDA FoodData Integration**: Embedded nutritional profile dictionary providing laboratory-tested nutrient values per 100g.

### Backend REST API
- **Java 21**: Modern LTS Java leveraging pattern matching, enhanced switch expressions, and record semantics.
- **Spring Boot 3.3.5**: Enterprise microservice framework with auto-configuration and embedded high-performance web servers.
- **Spring Data JPA & Hibernate 6.5**: Object-relational mapping with automated schema generation and derived query methods.
- **Jakarta Bean Validation**: Declarative input validation ensuring integrity for inventory updates.
- **H2 In-Memory / File Database**: Default embedded persistence for instant, zero-setup evaluation.
- **MySQL 8.x Support**: Production profile support with automated table updates.
- **Apache Maven**: Dependency resolution, compilation, and automated test execution.

---

## 🏛️ 5. System Architecture

```
+------------------------------------------------------------------------+
|                          CLIENT APPLICATION                            |
|  - Modern Web Browser (Chrome, Firefox, Edge, Safari)                  |
|  - Kitchen Dashboard | Inventory Table | Touchscreen | BITE MODE AI   |
|  - Pure ES6 Fetch Client | Reactive Local State | USDA Nutrition DB    |
+------------------------------------------------------------------------+
                                    |
                    RESTful HTTP/JSON (CORS Enabled)
                                    |
+------------------------------------------------------------------------+
|                       SPRING BOOT BACKEND API                          |
|  - FoodController: REST Endpoints (/api/foods/**)                      |
|  - FoodService: Business Logic, Expiry Calculation, Relative Seeding    |
|  - FoodRepository: Spring Data JPA ORM & Query Derivation              |
|  - GlobalExceptionHandler: Standardized RFC 7807 Error Responses       |
+------------------------------------------------------------------------+
                                    |
                           JDBC Connection
                                    |
+------------------------------------------------------------------------+
|                          PERSISTENCE TIER                              |
|  - Primary / Evaluator Default: Embedded H2 Database (Zero Config)     |
|  - Production Profile: MySQL 8.x Database (Auto Table Migration)       |
+------------------------------------------------------------------------+
```

---

## 📁 6. Folder Structure

```text
FridgeMind/
├── .env.example                       # Environment configuration template
├── .gitignore                          # Git ignore rules (node_modules, target, logs, secrets)
├── README.md                           # Master project documentation
│
├── frontend/                           # Client Application (Web UI & BITE MODE)
│   ├── index.html                      # Main Single Page Application (Dashboard, Touchscreen, etc.)
│   ├── bite-mode.css                   # BITE MODE styling, charts, and responsive layouts
│   ├── bite-mode.js                    # Clinical Mifflin-St Jeor math, AI diet planner & tracker
│   ├── package.json                    # Frontend package descriptor with dev server scripts
│   └── assets/                         # Handcrafted 32-bit pixel chef sprites & food images
│       ├── pixel_chef_idle.png         # Normal calm/happy expression
│       ├── pixel_chef_blink.png        # Blinking frame for idle breathing animation
│       ├── pixel_chef_happy.png        # Joyful curved eyes with blush & gold sparkles
│       ├── pixel_chef_worried.png      # Tilted brows & sweat drop for expiring items
│       ├── pixel_chef_warn.png         # Alert wide eyes & exclamation bubble for expired items
│       └── pixel_chef_thinking.png     # Inquisitive gaze & idea spark for food inspection
│
└── backend/                            # Server Application (Spring Boot 3.3.5 / Java 21)
    ├── pom.xml                         # Maven build configuration & dependencies
    └── src/
        ├── main/
        │   ├── java/com/fridgemind/backend/
        │   │   ├── FridgeMindApplication.java       # Spring Boot main class
        │   │   ├── config/
        │   │   │   ├── CorsConfig.java              # Cross-Origin Resource Sharing policy
        │   │   │   └── DataInitializer.java         # Automatic relative mock data seeder
        │   │   ├── controller/
        │   │   │   └── FoodController.java          # REST API endpoints controller
        │   │   ├── dto/
        │   │   │   ├── ErrorResponse.java           # Standardized error payload
        │   │   │   ├── FoodItemRequest.java         # Create/Update request DTO with validation
        │   │   │   ├── FoodItemResponse.java        # Entity response DTO with calculated status
        │   │   │   └── FoodStatisticsResponse.java  # KPI statistics summary DTO
        │   │   ├── entity/
        │   │   │   └── FoodItem.java                # JPA Entity mapped to database table
        │   │   ├── exception/
        │   │   │   ├── GlobalExceptionHandler.java  # @RestControllerAdvice error handler
        │   │   │   └── ResourceNotFoundException.java# 404 Exception definition
        │   │   ├── repository/
        │   │   │   └── FoodRepository.java          # Spring Data JPA database repository
        │   │   └── service/
        │   │       └── FoodService.java             # Core service business logic
        │   └── resources/
        │       ├── application.properties           # Default configuration (H2 active)
        │       ├── application-h2.properties        # Embedded H2 database profile
        │       ├── application-mysql.properties     # Production MySQL database profile
        │       └── static/                          # Synchronized static web client build
        └── test/                                    # Automated unit & integration tests
```

---

## 🚀 7. Installation & Running Instructions

### Prerequisites
- **Java Development Kit (JDK)**: Version 21 or higher installed (`java -version`).
- **Apache Maven**: Version 3.8+ installed (`mvn -version`).
- **Web Browser**: Modern browser (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari).
- *(Optional)* **Node.js**: Version 18+ (if running frontend via `npm start`) or **Python 3.x** (for `python -m http.server`).

---

### Step 1: Run the Backend (Spring Boot)

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd FridgeMind/backend
   ```
2. Build and run the project using Maven:
   ```bash
   mvn spring-boot:run
   ```
3. The backend starts on port **`8080`**.
   - **REST API Base URL**: `http://localhost:8080/api/foods`
   - **H2 Database Console**: `http://localhost:8080/h2-console`
     - JDBC URL: `jdbc:h2:file:./data/fridgemind_h2`
     - Username: `sa`
     - Password: *(leave empty)*
   - **Health Check**: Open `http://localhost:8080/api/foods/statistics` in your browser. You should see an immediate JSON response with calculated inventory metrics!

---

### Step 2: Run the Frontend (Web Client)

You have multiple convenient ways to launch the frontend:

#### Option A: Lightweight Web Server (Recommended)
1. Open a second terminal and navigate to the `frontend` directory:
   ```bash
   cd FridgeMind/frontend
   ```
2. Start using Python:
   ```bash
   python -m http.server 3000
   ```
   *Or using Node.js / npx:*
   ```bash
   npx serve -s . -l 3000
   ```
3. Open your browser at:
   👉 **`http://localhost:3000`**

#### Option B: Zero-Server Spring Boot Direct Serving
Because the backend includes the frontend in its static resources, you can also access the application directly from the running Spring Boot server:
👉 **`http://localhost:8080`**

---

## 🗄️ 8. Database Setup

### Default: H2 Embedded Database (Zero Setup)
No database installation or setup is needed! The project defaults to the `h2` profile. The backend automatically seeds 10 realistic food items with dates calculated relative to the current day, ensuring test metrics always show Expired, Expiring Soon, and Safe provisions.

### Optional: MySQL Database Configuration
If your evaluation requires an external MySQL instance:
1. Ensure MySQL Server is running on port `3306`.
2. Create the database:
   ```sql
   CREATE DATABASE fridgemind_db;
   ```
3. Set the environment variable in your terminal before running the backend:
   ```bash
   # Windows PowerShell
   $env:SPRING_PROFILES_ACTIVE="mysql"
   $env:DB_USERNAME="root"
   $env:DB_PASSWORD="your_password"

   # Linux / macOS
   export SPRING_PROFILES_ACTIVE=mysql
   export DB_USERNAME=root
   export DB_PASSWORD=your_password
   ```
4. Start the backend:
   ```bash
   mvn spring-boot:run
   ```
   Hibernate will automatically generate all tables (`food_items`) and maintain schema updates.

---

## 📡 9. REST API Endpoints Specification

| Method | Endpoint | Description | Request Body | Response Status |
| :--- | :--- | :--- | :--- | :--- |
| **`GET`** | `/api/foods` | Fetch all food inventory items | None | `200 OK` |
| **`POST`** | `/api/foods` | Add a new food item | JSON (FoodItemRequest) | `201 Created` |
| **`GET`** | `/api/foods/{id}` | Fetch a specific item by ID | None | `200 OK` / `404 Not Found` |
| **`PUT`** | `/api/foods/{id}` | Update quantity, dates, or notes | JSON (FoodItemRequest) | `200 OK` / `404 Not Found` |
| **`DELETE`** | `/api/foods/{id}` | Remove an item from the refrigerator | None | `204 No Content` |
| **`GET`** | `/api/foods/statistics` | Fetch dashboard KPI statistics | None | `200 OK` |
| **`GET`** | `/api/foods/expiring-soon` | Fetch items expiring within 3 days | None | `200 OK` |
| **`GET`** | `/api/foods/expired` | Fetch items whose expiry date has passed | None | `200 OK` |
| **`GET`** | `/api/foods/category/{cat}` | Filter items by category name | None | `200 OK` |
| **`GET`** | `/api/foods/search?name=...` | Search items by name substring | None | `200 OK` |

### Sample Request (`POST /api/foods`)
```json
{
  "name": "Greek Yogurt",
  "category": "Dairy",
  "quantity": 500.0,
  "unit": "grams",
  "purchaseDate": "2026-11-14",
  "expiryDate": "2026-11-28",
  "notes": "{\"location\":\"Middle Shelf\",\"minStock\":200.0}"
}
```

### Sample Response (`GET /api/foods/statistics`)
```json
{
  "totalItems": 10,
  "safeItems": 5,
  "expiringSoonItems": 3,
  "expiredItems": 2,
  "categoryBreakdown": {
    "Fruits": 2,
    "Dairy": 3,
    "Vegetables": 2,
    "Meat": 1,
    "Beverages": 1,
    "Snacks": 1
  }
}
```

---

## 📸 10. Screenshots & Visual Interface

> *Note: Place your project screenshots in this section for your GitHub repository presentation.*

### 1. Kitchen Inventory Dashboard & Interactive Pie Chart
```text
[ SCREENSHOT PLACEHOLDER: Modern Kitchen Dashboard showing 4 KPI cards and the central interactive category pie chart ]
```

### 2. Smart Refrigerator Door Touchscreen & 32-Bit Pixel Chef Mascot
```text
[ SCREENSHOT PLACEHOLDER: 3x3 Kitchen World Grid featuring the animated pixel chef mascot on the wooden pedestal ]
```

### 3. BITE MODE: AI Diet Plan & Live Refrigerator Meals
```text
[ SCREENSHOT PLACEHOLDER: BITE MODE interface displaying the SVG Calorie Ring, macro progress, and live fridge meal cards ]
```

### 4. Food Substitution & Flexible Diet Adaptation
```text
[ SCREENSHOT PLACEHOLDER: Side-by-side food replacement engine modal showing macro delta comparisons ]
```

### 5. Smart Grocery Deficit Recommendations & 1-Click Restock
```text
[ SCREENSHOT PLACEHOLDER: Smart grocery deficit shelves with instant '+ Add to Fridge' API restock actions ]
```

---

## 🎓 11. Academic Evaluation & Submission Notice

- **Project Submission Root**: Upload the entire **`FridgeMind/`** directory to GitHub.
- **Repository Cleanliness**: The repository is configured with a strict `.gitignore` to prevent committing compiled `.class` files, Maven `target/` binaries, local H2 lock files, or temporary artifacts.
- **Independence & Decoupling**: The backend REST API operates as an autonomous microservice, allowing either the web client or third-party IoT clients to interact with it seamlessly over standard HTTP.

---

## 📄 License
This project is submitted for academic evaluation under the **MIT License**.
All simulated product images and USDA nutritional references are used under open educational fair-use provisions.
