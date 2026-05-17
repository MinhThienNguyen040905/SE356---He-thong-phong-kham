const { Builder, By, until, Key } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains("/admin"), 10000);
        
        await driver.get("http://localhost:5173/admin/inventory");
        
        // Find search input
        let searchInput = await driver.wait(until.elementLocated(By.xpath("//input[contains(@placeholder, 'Tìm kiếm') or contains(@placeholder, 'Search')]")), 10000);
        
        // Get a name from the table first to search for it
        let firstMedicineName = await driver.findElement(By.xpath("//table//tbody/tr[1]/td[1]")).getText();
        
        await searchInput.sendKeys(firstMedicineName, Key.RETURN);
        
        // Wait for table to update
        await driver.sleep(2000);
        
        // Verify only relevant results are shown
        let results = await driver.findElements(By.xpath("//table//tbody/tr"));
        let found = false;
        for (let row of results) {
            let name = await row.findElement(By.xpath("./td[1]")).getText();
            if (name.toLowerCase().includes(firstMedicineName.toLowerCase())) {
                found = true;
                break;
            }
        }
        
        if (found) {
            console.log("AT-129 Passed: Tìm kiếm thuốc theo tên thành công.");
        } else {
            throw new Error("Không tìm thấy kết quả phù hợp sau khi search.");
        }
    } catch (err) {
        console.error("AT-129 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
