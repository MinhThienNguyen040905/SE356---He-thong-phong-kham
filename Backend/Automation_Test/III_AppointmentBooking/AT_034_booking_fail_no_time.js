const { Builder, By, until } = require("selenium-webdriver");
const fs = require('fs');

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("patient1@gmail.com");
        await driver.findElement(By.id("password")).sendKeys("Mi123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains("/patient"), 5000);
        
        await driver.get("http://localhost:5173/patient/book-appointment");
        await driver.wait(until.elementLocated(By.xpath("//h3[contains(text(), 'Nội khoa')] | //span[contains(text(), 'Nội khoa')] | //button[contains(., 'Nội')]")), 10000);
        
        // 1. Select Specialty (First one)
        const specialties = await driver.findElements(By.xpath("//button[.//span[contains(@class, 'text-xs')]]"));
        if(specialties.length > 0) {
            await specialties[2].click();
            await driver.sleep(1000);
        }

        // 2. Select Date (Tomorrow)
        const dateInput = await driver.findElements(By.xpath("//button[contains(@class, 'rdp-day') and not(@disabled) and not(ancestor::td[@data-outside='true'])]"));
        if(dateInput.length > 0) {
            const targetDate = dateInput[dateInput.length > 1 ? 1 : 0];
            await driver.executeScript("arguments[0].scrollIntoView({block: 'center', behavior: 'smooth'});", targetDate);
            await driver.sleep(1000);
            await driver.executeScript("arguments[0].click();", targetDate);
            await driver.sleep(2000); // Wait for doctors to load
        }

        // 3. Select Doctor (First one)
        const doctors = await driver.findElements(By.xpath("//button[.//h3[contains(@class, 'font-semibold')]]"));
        if(doctors.length > 0) {
            await doctors[0].click();
            await driver.sleep(1000);
        }

        // Purposefully NOT selecting shift.
        // Check if submit button is disabled
        const submitBtn = await driver.findElement(By.xpath("//button[contains(., 'Xác Nhận Đặt Lịch')]"));
        const isDisabled = await submitBtn.getAttribute('disabled');
        
        if (isDisabled === 'true' || isDisabled !== null) {
            console.log("AT-034 Passed: Cannot book without selecting time (Button is disabled)");
        } else {
            // Attempt click
            await driver.executeScript("arguments[0].click();", submitBtn);
            await driver.sleep(1000);
            const bodyText = await driver.findElement(By.css("body")).getText();
            if(bodyText.includes("giờ") || bodyText.includes("thời gian")) {
                console.log("AT-034 Passed: Validation message shown when time is not selected.");
            } else {
                throw new Error("Submit button should be disabled when time is not selected.");
            }
        }
    } catch (err) { 
        console.error("AT-034 Failed:", err); 
    } finally { 
        await driver.quit(); 
    }
}
run();
