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
        
        await driver.wait(until.elementLocated(By.xpath("//table//tbody//tr[1]")), 10000);
        
        const searchInput = await driver.wait(until.elementLocated(By.xpath("//input[@placeholder='Tìm kiếm theo tên...']")), 5000);
        await searchInput.sendKeys("Ca Test 01");
        await driver.sleep(1000);
        
        const editBtn = await driver.wait(until.elementLocated(By.xpath("//table//tbody//tr[1]//button[@title='Chỉnh sửa']")), 5000);
        await driver.executeScript("arguments[0].click();", editBtn);
        
        const setReactInputValue = async (driver, id, value) => {
            const input = await driver.findElement(By.id(id));
            await driver.executeScript(`
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                nativeInputValueSetter.call(arguments[0], arguments[1]);
                arguments[0].dispatchEvent(new Event('input', { bubbles: true }));
                arguments[0].dispatchEvent(new Event('change', { bubbles: true }));
            `, input, value);
        };
        
        await setReactInputValue(driver, "edit-start-time", "09:00");
        
        const saveBtn = await driver.findElement(By.xpath("//button[contains(., 'Lưu thay đổi')]"));
        await driver.executeScript("arguments[0].click();", saveBtn);
        
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Cập nhật ca trực thành công')]")), 5000);
        console.log("AT-170 Passed: Edit shift start time success");
    } catch (err) { 
        console.error("AT-170 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
