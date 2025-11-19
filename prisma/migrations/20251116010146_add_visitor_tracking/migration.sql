-- CreateTable
CREATE TABLE "customer_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "visitorId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "country" TEXT,
    "city" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastActivity" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "customer_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "customer_sessions_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "visitor_profiles" ("userId") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "page_views" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "title" TEXT,
    "duration" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "page_views_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "customer_sessions" ("sessionId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "customer_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "visitorId" TEXT,
    "eventType" TEXT NOT NULL,
    "eventData" TEXT,
    "productId" TEXT,
    "value" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "customer_events_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "customer_sessions" ("sessionId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "customer_events_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "visitor_profiles" ("userId") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "customer_events_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "analytics_summary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "hour" INTEGER,
    "activeUsers" INTEGER NOT NULL DEFAULT 0,
    "pageViews" INTEGER NOT NULL DEFAULT 0,
    "uniqueVisitors" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "revenue" REAL NOT NULL DEFAULT 0,
    "topProduct" TEXT,
    "topPage" TEXT,
    "avgSessionTime" INTEGER NOT NULL DEFAULT 0,
    "bounceRate" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "visitor_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "userAgent" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "country" TEXT,
    "countryCode" TEXT,
    "city" TEXT,
    "region" TEXT,
    "ipAddress" TEXT,
    "timezone" TEXT,
    "isp" TEXT,
    "referrer" TEXT,
    "initialPage" TEXT,
    "language" TEXT,
    "screenResolution" TEXT,
    "firstVisit" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastVisit" DATETIME NOT NULL,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "totalPageViews" INTEGER NOT NULL DEFAULT 0,
    "totalTimeSpent" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "imageSrc" TEXT NOT NULL,
    "imageAlt" TEXT,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "brand" TEXT,
    "sku" TEXT,
    "weight" REAL,
    "dimensions" TEXT,
    "tags" TEXT,
    "inStock" BOOLEAN NOT NULL DEFAULT true,
    "stockCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "saleCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_products" ("category", "createdAt", "description", "id", "imageAlt", "imageSrc", "inStock", "name", "price", "updatedAt") SELECT "category", "createdAt", "description", "id", "imageAlt", "imageSrc", "inStock", "name", "price", "updatedAt" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "avatar" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("createdAt", "email", "id", "name", "phone", "updatedAt") SELECT "createdAt", "email", "id", "name", "phone", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "customer_sessions_sessionId_key" ON "customer_sessions"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_summary_date_hour_key" ON "analytics_summary"("date", "hour");

-- CreateIndex
CREATE UNIQUE INDEX "visitor_profiles_userId_key" ON "visitor_profiles"("userId");
