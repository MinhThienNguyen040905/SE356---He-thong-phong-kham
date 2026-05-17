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
        
        const addBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Thêm ca trực')]")), 5000);
        await driver.executeScript("arguments[0].click();", addBtn);
        
        const setReactInputValue = async (driver, id, value) => {
            const input = await driver.findElement(By.id(id));
            await driver.executeScript(`
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                nativeInputValueSetter.call(arguments[0], arguments[1]);
                arguments[0].dispatchEvent(new Event('input', { bubbles: true }));
                arguments[0].dispatchEvent(new Event('change', { bubbles: true }));
            `, input, value);
        };
        
        await driver.wait(until.elementLocated(By.id("create-name")), 5000).sendKeys("Ca Test 01");
        await setReactInputValue(driver, "create-start-time", "08:00");
        await setReactInputValue(driver, "create-end-time", "12:00");
        await driver.findElement(By.id("create-description")).sendKeys("Mô tả test automation");
        
        const saveBtn = await driver.findElement(By.xpath("//button[contains(., 'Lưu ca trực')]"));
        await driver.executeScript("arguments[0].click();", saveBtn);
        
        try {
            await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Tạo ca trực thành công')]")), 5000);
            console.log("AT-165 Passed: Add shift success");
        } catch (e) {
            const bodyText = await driver.findElement(By.tagName("body")).getText();
            console.error("AT-165 Failed. Page content snippet:", bodyText.substring(0, 500));
            throw e;
        }
    } catch (err) { 
        console.error("AT-165 Error:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
