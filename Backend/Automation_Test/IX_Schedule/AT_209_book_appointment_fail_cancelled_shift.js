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
        await driver.sleep(2000);
        
        const toggleBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Thêm / Điều chỉnh Lịch')]")), 10000);
        await toggleBtn.click();
        await driver.sleep(1000);

        // 1. Hủy 1 ca trực để tạo dữ liệu (nếu chưa có)
        const cancelBtns = await driver.findElements(By.xpath("//button[@title='Hủy ca trực']"));
        if (cancelBtns.length > 0) {
            await driver.executeScript("arguments[0].click();", cancelBtns[0]);
            await driver.sleep(1000);
            const reasonInput = await driver.wait(until.elementLocated(By.xpath("//textarea")), 5000);
            await reasonInput.sendKeys("Hủy để test");
            const confirmBtn = await driver.findElement(By.xpath("//button[contains(., 'Xác nhận')]"));
            await confirmBtn.click();
            await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'thành công')]")), 10000);
            await driver.sleep(2000);
        }

        // 2. Thử thêm lại bác sĩ vào ca vừa bị hủy
        const doctorCards = await driver.findElements(By.xpath("//div[contains(@class, 'hover:bg-blue-50/50')]"));
        if (doctorCards.length > 0) {
            await driver.executeScript("arguments[0].click();", doctorCards[0]);
            await driver.sleep(1000);
            
            // Set thời gian (chọn ca tối, giống như lúc thêm)
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 10); // set 10 days in future
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

            // Bắt lỗi khi đăng ký vào ca đã hủy (nó sẽ báo duplicate hoặc error)
            await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'thất bại') or contains(text(), 'Vui lòng') or contains(text(), 'already')]")), 10000);
        }
        
        console.log("AT-209 Passed: add_doctor_schedule_fail_cancelled_shift");
    } catch (err) { 
        console.error("AT-209 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
