const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains("/admin"), 10000);
        
        // Navigate to /admin/employees
        await driver.get("http://localhost:5173/admin/employees");
        
        // Wait for page header and click "Thêm nhân viên"
        let addEmpBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Thêm nhân viên')]")), 10000);
        await addEmpBtn.click();
        
        // Click dropdown item "Tạo bác sĩ"
        let createDocBtn = await driver.wait(until.elementLocated(By.xpath("//span[contains(text(), 'Tạo bác sĩ')]")), 5000);
        await createDocBtn.click();
        
        // Wait for the redirection to admin/doctors/add
        await driver.wait(until.urlContains("/admin/doctors/add"), 10000);
        
        // Fill form fields
        let fullNameInput = await driver.wait(until.elementLocated(By.id("fullName")), 5000);
        await fullNameInput.sendKeys("Bác Sĩ Kiểm Thử " + Date.now());
        
        let emailInput = await driver.findElement(By.id("email"));
        await emailInput.sendKeys("testdoctor" + Date.now() + "@healthcare.com");
        
        let passwordInput = await driver.findElement(By.id("password"));
        await passwordInput.sendKeys("Mi123456");
        
        // Select specialty (Radix Select Trigger)
        let specialtyTrigger = await driver.findElement(By.id("specialtyId"));
        await specialtyTrigger.click();
        let specialtyOption = await driver.wait(until.elementLocated(By.xpath("//div[@role='option' and contains(., 'Nội khoa')]")), 5000);
        await specialtyOption.click();
        
        let positionInput = await driver.findElement(By.id("position"));
        await positionInput.sendKeys("Trưởng khoa Nội");
        
        let degreeInput = await driver.findElement(By.id("degree"));
        await degreeInput.sendKeys("Tiến sĩ Y khoa");
        
        // Click submit button "Thêm Bác Sĩ"
        let submitBtn = await driver.findElement(By.xpath("//button[@type='submit' and contains(., 'Thêm Bác Sĩ')]"));
        await submitBtn.click();
        
        // Success check
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'thành công') or contains(text(), 'Thành công')]")), 10000);
        console.log("AT-139 Passed: Admin thêm tài khoản bác sĩ thành công.");
    } catch (err) {
        console.error("AT-139 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
