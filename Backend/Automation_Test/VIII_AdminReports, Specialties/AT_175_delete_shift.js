const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/dashboard"), 5000);
        await driver.get("http://localhost:5173/admin/shifts");
        
        // Wait for table to load
        await driver.wait(until.elementLocated(By.xpath("//table//tbody//tr[1]")), 10000);
        
        // Search for the updated test shift
        const searchInput = await driver.wait(until.elementLocated(By.xpath("//input[@placeholder='Tìm kiếm theo tên...']")), 5000);
        await searchInput.sendKeys("Ca Test 01 Updated");
        await driver.sleep(1500); // Wait for debounce and search
        
        // Click Delete Button of the matched row
        const deleteBtn = await driver.wait(until.elementLocated(By.xpath("//table//tbody//tr[1]//button[@title='Xóa ca trực']")), 5000);
        await driver.executeScript("arguments[0].click();", deleteBtn);
        
        // Confirm Delete (ShiftsPage doesn't seem to have a confirmation dialog based on code, but there is isDeleteDialogOpen)
        // Wait, looking at ShiftsPage.tsx, it has a dialog with title "Xóa ca trực"
        const confirmBtn = await driver.wait(until.elementLocated(By.xpath("//div[@role='dialog']//button[contains(., 'Xóa vĩnh viễn')] | //div[@role='dialog']//button[contains(@class, 'bg-red-600')]")), 5000);
        await driver.executeScript("arguments[0].click();", confirmBtn);
        
        // Wait for success toast
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Xóa ca trực thành công')]")), 5000);
        console.log("AT-175 Passed: Delete shift success");
    } catch (err) { 
        console.error("AT-175 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
