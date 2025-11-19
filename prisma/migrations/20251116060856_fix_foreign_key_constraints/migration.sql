/*
  Warnings:

  - You are about to drop the `analytics_summary` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "analytics_summary_date_hour_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "analytics_summary";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_cart_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "colorName" TEXT,
    "size" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cart_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_cart_items" ("colorName", "createdAt", "id", "productId", "quantity", "size", "userId") SELECT "colorName", "createdAt", "id", "productId", "quantity", "size", "userId" FROM "cart_items";
DROP TABLE "cart_items";
ALTER TABLE "new_cart_items" RENAME TO "cart_items";
CREATE UNIQUE INDEX "cart_items_userId_productId_colorName_size_key" ON "cart_items"("userId", "productId", "colorName", "size");
CREATE TABLE "new_customer_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "visitorId" TEXT,
    "eventType" TEXT NOT NULL,
    "eventData" TEXT,
    "productId" TEXT,
    "value" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "customer_events_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "customer_sessions" ("sessionId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "customer_events_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_customer_events" ("createdAt", "eventData", "eventType", "id", "productId", "sessionId", "value", "visitorId") SELECT "createdAt", "eventData", "eventType", "id", "productId", "sessionId", "value", "visitorId" FROM "customer_events";
DROP TABLE "customer_events";
ALTER TABLE "new_customer_events" RENAME TO "customer_events";
CREATE TABLE "new_customer_sessions" (
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
    CONSTRAINT "customer_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_customer_sessions" ("browser", "city", "country", "createdAt", "device", "id", "ipAddress", "isActive", "lastActivity", "sessionId", "updatedAt", "userAgent", "userId", "visitorId") SELECT "browser", "city", "country", "createdAt", "device", "id", "ipAddress", "isActive", "lastActivity", "sessionId", "updatedAt", "userAgent", "userId", "visitorId" FROM "customer_sessions";
DROP TABLE "customer_sessions";
ALTER TABLE "new_customer_sessions" RENAME TO "customer_sessions";
CREATE UNIQUE INDEX "customer_sessions_sessionId_key" ON "customer_sessions"("sessionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
