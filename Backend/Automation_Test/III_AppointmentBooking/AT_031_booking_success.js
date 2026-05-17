const { Builder, By, until } = require("selenium-webdriver");
const fs = require('fs');

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        // Login as patient
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("patient1@gmail.com");
        await driver.findElement(By.id("password")).sendKeys("Mi123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/patient"), 5000);
        
        // Go to Book Appointment
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
            // Click tomorrow or next available day
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
            
            // 4. Select Shift (First available)
            const shifts = await driver.findElements(By.xpath("//button[.//div[contains(@class, 'font-semibold text-sm')]]"));
            if(shifts.length > 0) {
                // filter disabled shifts
                let shiftClicked = false;
                for(let shift of shifts) {
                    const disabled = await shift.getAttribute('disabled');
                    if(disabled !== 'true') {
                        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", shift);
                        await driver.sleep(500);
                        await driver.executeScript("arguments[0].click();", shift);
                        shiftClicked = true;
                        break;
                    }
                }
                await driver.sleep(1000);
            }
        }

        // 5. Fill Patient Info & Symptoms
        const emailInput = await driver.findElements(By.id("email"));
        if(emailInput.length > 0) {
            await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", emailInput[0]);
            await driver.sleep(500);
            const val = await emailInput[0].getAttribute("value");
            if (!val) await emailInput[0].sendKeys("patient1@gmail.com");
        }
        
        const phoneInput = await driver.findElements(By.id("phone"));
        if(phoneInput.length > 0) {
            const val = await phoneInput[0].getAttribute("value");
            if (!val) await phoneInput[0].sendKeys("0901234567");
        }
        
        const dobInput = await driver.findElements(By.id("dob"));
        if(dobInput.length > 0) {
            const val = await dobInput[0].getAttribute("value");
            if (!val) await dobInput[0].sendKeys("01-01-1990");
        }

        const symptomsInput = await driver.findElements(By.id("symptoms"));
        if(symptomsInput.length > 0) {
            await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", symptomsInput[0]);
            await driver.sleep(500);
            await symptomsInput[0].sendKeys("Đau đầu, chóng mặt");
        }
        
        // 6. Submit
        const submitBtn = await driver.findElement(By.xpath("//button[contains(., 'Xác Nhận Đặt Lịch')]"));
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", submitBtn);
        await driver.sleep(500);
        await driver.executeScript("arguments[0].click();", submitBtn);
        
        // Wait for confirmation dialog and click Confirm
        await driver.sleep(1000);
        const confirmBtn = await driver.findElements(By.xpath("//button[contains(., 'Xác nhận đặt lịch')]"));
        if(confirmBtn.length > 0) {
            await confirmBtn[0].click();
        }

        await driver.wait(until.elementLocated(By.xpath("//h2[contains(text(), 'thành công')]")), 5000);
        console.log("AT-025 Passed");
    } catch (err) { 
        console.error("AT-025 Failed:", err); 
    } finally { 
        await driver.quit(); 
    }
}
run();
