const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/dashboard"), 10000);
        

        await driver.get("http://localhost:5173/admin/shift-templates");
        await driver.sleep(2000);
        
        const btn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Thêm mẫu ca')]")), 5000);
        await driver.executeScript("arguments[0].click();", btn);
        await driver.sleep(1000);
        
        // Chọn Bác sĩ (chọn phần tử đầu tiên trong danh sách)
        const selects = await driver.findElements(By.xpath("//div[@role='dialog']//button[@role='combobox']"));
        if(selects.length >= 3) {
            // Click Bác sĩ
            await selects[0].click();
            await driver.sleep(500);
            let options = await driver.findElements(By.xpath("//div[@role='option']"));
            if(options.length > 0) await options[0].click();
            await driver.sleep(500);

            // Click Ca trực
            await selects[1].click();
            await driver.sleep(500);
            options = await driver.findElements(By.xpath("//div[@role='option']"));
            if(options.length > 0) await options[0].click();
            await driver.sleep(500);

            // Click Ngày trong tuần
            await selects[2].click();
            await driver.sleep(500);
            options = await driver.findElements(By.xpath("//div[@role='option']"));
            if(options.length > 0) await options[0].click();
            await driver.sleep(500);
        }

        const saveBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Lưu mẫu ca')]")), 10000);
        await saveBtn.click();
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'thành công')]")), 5000);
    
        
        console.log("AT-213 Passed: add_shift_template");
    } catch (err) { 
        console.error("AT-213 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
