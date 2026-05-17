const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/dashboard"), 5000);
        await driver.get("http://localhost:5173/admin/specialties");
        
        // Create a specialty first to ensure it can be deleted
        const addBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Thêm chuyên khoa')]")), 5000);
        await driver.executeScript("arguments[0].click();", addBtn);
        await driver.wait(until.elementLocated(By.id("create-name")), 5000).sendKeys("Khoa Deletion Test");
        const saveBtn = await driver.findElement(By.xpath("//button[contains(., 'Lưu dữ liệu')]"));
        await driver.executeScript("arguments[0].click();", saveBtn);
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Tạo chuyên khoa thành công')]")), 5000);
        await driver.sleep(1000);
        
        // Search for the newly created specialty
        const searchInput = await driver.wait(until.elementLocated(By.xpath("//input[@placeholder='Tìm kiếm chuyên khoa (Tên, Mô tả)...']")), 5000);
        await searchInput.sendKeys("Khoa Deletion Test");
        await driver.sleep(1500); // Wait for debounce and search
        
        // Click Delete Button of the first matched row
        const deleteBtn = await driver.wait(until.elementLocated(By.xpath("//table//tbody//tr[1]//button[@title='Xóa chuyên khoa']")), 5000);
        await driver.executeScript("arguments[0].click();", deleteBtn);
        
        // Confirm Delete
        const confirmBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Xóa vĩnh viễn')]")), 5000);
        await driver.executeScript("arguments[0].click();", confirmBtn);
        
        // Wait for success toast
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Xóa chuyên khoa thành công')]")), 5000);
        console.log("AT-161 Passed: Delete specialty success");
    } catch (err) { 
        console.error("AT-161 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
