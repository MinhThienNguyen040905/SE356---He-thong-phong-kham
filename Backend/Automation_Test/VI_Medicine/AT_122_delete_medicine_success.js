const { Builder, By, until } = require("selenium-webdriver");
const mysql = require("mysql2/promise");

async function resetMedicineQuantity(id, qty) {
    const connection = await mysql.createConnection({
        host: "localhost",
        port: 3306,
        user: "root",
        password: "123456",
        database: "healthcare_db"
    });
    try {
        await connection.execute("UPDATE medicines SET quantity = ?, status = 'active' WHERE id = ?", [qty, id]);
        console.log(`Successfully reset medicine ID ${id} quantity to ${qty}`);
    } finally {
        await connection.end();
    }
}

async function checkMedicineStatus(id) {
    const connection = await mysql.createConnection({
        host: "localhost",
        port: 3306,
        user: "root",
        password: "123456",
        database: "healthcare_db"
    });
    try {
        const [rows] = await connection.execute("SELECT status FROM medicines WHERE id = ?", [id]);
        return rows[0] ? rows[0].status : null;
    } finally {
        await connection.end();
    }
}

async function run() {
    // Reset medicine ID 1 quantity to 0 to ensure successful deletion
    try {
        await resetMedicineQuantity(1, 0);
    } catch (e) {
        console.warn("DB reset failed, attempting test anyway:", e.message);
    }

    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains("/admin"), 10000);
        
        // Go directly to the detail page of medicine ID 1
        await driver.get("http://localhost:5173/pharmacy/1");
        
        // Wait for page to load by locating the back button or title
        await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Quay lại')]")), 10000);
        
        // Find and click the Delete ('Xóa') button
        let deleteBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Xóa')]")), 10000);
        await driver.executeScript("arguments[0].click();", deleteBtn);
        
        // In the Confirmation Dialog, click 'Xóa' confirm button
        let confirmBtn = await driver.wait(until.elementLocated(By.xpath("//div[@role='dialog']//button[contains(., 'Xóa')]")), 5000);
        await driver.executeScript("arguments[0].click();", confirmBtn);
        
        // Wait for deletion API call and UI state update
        await driver.sleep(3000);
        
        // Verify in DB that status is 'REMOVED'
        const status = await checkMedicineStatus(1);
        if (status && status.toUpperCase() === 'REMOVED') {
            console.log(`AT-122 Passed: Delete medicine with 0 stock successfully. Medicine status in DB is: "${status}"`);
        } else {
            throw new Error(`Medicine status is "${status}", expected "REMOVED"`);
        }
    } catch (err) {
        console.error("AT-122 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
