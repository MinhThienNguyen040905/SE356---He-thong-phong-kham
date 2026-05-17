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
        
        // Use search to find the test shift created in AT-170
        const searchInput = await driver.wait(until.elementLocated(By.xpath("//input[@placeholder='Tìm kiếm theo tên...']")), 5000);
        await searchInput.sendKeys("Ca Test 01");
        await driver.sleep(1000); // Wait for debounce and search
        
        // Click Edit Button
        const editBtn = await driver.wait(until.elementLocated(By.xpath("//table//tbody//tr[1]//button[@title='Chỉnh sửa']")), 5000);
        await driver.executeScript("arguments[0].click();", editBtn);
        
        // Edit name
        const editNameInput = await driver.wait(until.elementLocated(By.id("edit-name")), 5000);
        await editNameInput.clear();
        await editNameInput.sendKeys("Ca Test 01 Updated");
        
        // Submit
        const saveBtn = await driver.findElement(By.xpath("//button[contains(., 'Lưu thay đổi')]"));
        await driver.executeScript("arguments[0].click();", saveBtn);
        
        // Wait for success toast
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Cập nhật ca trực thành công')]")), 5000);
        console.log("AT-169 Passed: Edit shift name success");
    } catch (err) { 
        console.error("AT-169 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
