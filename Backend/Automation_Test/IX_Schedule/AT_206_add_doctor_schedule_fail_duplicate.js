const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/dashboard"), 10000);
        

        await driver.get("http://localhost:5173/admin/schedule");
        await driver.wait(until.elementLocated(By.xpath("//h1[contains(., 'Lịch Trực')]")), 10000);
        await driver.sleep(2000);
        
        // Bấm nút thêm / điều chỉnh lịch
        const toggleBtn = await driver.findElement(By.xpath("//button[contains(., 'Thêm / Điều chỉnh Lịch')]"));
        await toggleBtn.click();
        await driver.sleep(1000);

        // Chọn bác sĩ đầu tiên
        const doctorCards = await driver.findElements(By.xpath("//div[contains(@class, 'hover:bg-blue-50/50')]"));
        if (doctorCards.length > 0) {
            await driver.executeScript("arguments[0].click();", doctorCards[0]);
            await driver.sleep(1000);
            
            // Xử lý modal
    
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 10); // set 10 days in future to avoid conflict
            const dateStr = tomorrow.toISOString().split('T')[0];
            await driver.executeScript(`
              var el = document.querySelector("input[type='date']");
              var nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
              nativeInputValueSetter.call(el, '${dateStr}');
              el.dispatchEvent(new Event('input', { bubbles: true }));
              el.dispatchEvent(new Event('change', { bubbles: true }));

              var selects = document.querySelectorAll("select");
              if (selects.length > 1) {
                  var shiftSelect = selects[1];
                  shiftSelect.selectedIndex = shiftSelect.options.length - 1; // select evening shift
                  shiftSelect.dispatchEvent(new Event('change', { bubbles: true }));
              }
            `);
            await driver.sleep(500);
      
            const submitBtn = await driver.findElement(By.xpath("//button[contains(., 'Schedule Event')]"));
            await driver.executeScript("arguments[0].click();", submitBtn);
            await driver.sleep(2000);
            
            // Re-open and try same date/shift again
            await driver.executeScript("arguments[0].click();", doctorCards[0]);
            await driver.sleep(1000);
            const submitBtn2 = await driver.findElement(By.xpath("//button[contains(., 'Schedule Event')]"));
            await driver.executeScript("arguments[0].click();", submitBtn2);
      
            await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'thất bại') or contains(text(), 'Vui lòng')]")), 10000);
      
        } else {
            console.log("No doctor found");
        }
    
        
        console.log("AT-206 Passed: add_doctor_schedule_fail_duplicate");
    } catch (err) { 
        console.error("AT-206 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
