const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("reception@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/receptionist"), 5000);
        await driver.get("http://localhost:5173/recep/appointments/offline");
        
        // Fill Patient Info
        await driver.wait(until.elementLocated(By.xpath("//input[contains(@placeholder, 'NGUYEN VAN A')]")), 10000).sendKeys("Patient Offline Test");
        await driver.findElement(By.xpath("//input[contains(@placeholder, '0xxx')]")).sendKeys("0123456789");
        await driver.findElement(By.xpath("//input[@type='date']")).sendKeys("01011990"); // Fix date format input
        
        // Select Specialty: Tim mạch
        let specialtyTrigger = await driver.wait(until.elementLocated(By.xpath("//button[.//span[contains(text(), 'chuyên khoa')]]")), 5000);
        await specialtyTrigger.click();
        await driver.sleep(1000);
        let cardiologyOption = await driver.wait(until.elementLocated(By.xpath("//div[@role='option' and contains(., 'Tim mạch')]")), 5000);
        await cardiologyOption.click();
        
        // Select Date (Current date) - Dùng nhãn "Ngày khám" để tìm chính xác ô bên cạnh
        let dateLabel = await driver.findElement(By.xpath("//label[contains(text(), 'Ngày khám')]"));
        let dateTrigger = await driver.findElement(By.xpath("//label[contains(text(), 'Ngày khám')]/following-sibling::div//button"));
        await dateTrigger.click();
        await driver.sleep(1000);
        
        let today = await driver.wait(until.elementLocated(By.xpath("//button[contains(@class, 'calendar-day-today') or contains(@class, 'accent')]")), 5000);
        await today.click();
        await driver.sleep(2000); // Wait for doctors to load
        
        // Wait for doctors and select one if available
        let doctorCards = await driver.findElements(By.xpath("//div[contains(., 'BS.')]"));
        if (doctorCards.length === 0) {
            console.log("AT-067 Warning: Không tìm thấy bác sĩ nào có lịch trực. Vui lòng kiểm tra lại Schedule.");
            return;
        }
        await doctorCards[0].click();
        
        // Select shift
        let shiftBtn = await driver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'cursor-pointer') and .//span[contains(text(), ':')]]")), 5000);
        await shiftBtn.click();
        
        // Submit
        let submitBtn = await driver.findElement(By.xpath("//button[contains(., 'XÁC NHẬN')]"));
        await submitBtn.click();
        
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'thành công')]")), 10000);
        console.log("AT-067 Passed: Lễ tân đặt lịch hộ thành công.");
    } catch (err) { 
        console.error("AT-067 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
