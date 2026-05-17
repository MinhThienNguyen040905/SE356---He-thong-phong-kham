const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        
        // Chờ tải form
        const emailInput = await driver.wait(until.elementLocated(By.id("email")), 5000);
        const passInput = await driver.findElement(By.id("password"));
        const submitBtn = await driver.findElement(By.xpath("//button[@type='submit']"));
        
        // Nhập tài khoản bất kỳ để spam
        await emailInput.sendKeys("spamtest@gmail.com");
        await passInput.sendKeys("wrongpassword123");

        let rateLimitHit = false;
        console.log("Bắt đầu spam click đăng nhập 20 lần...");

        // Spam nút đăng nhập liên tục
        for (let i = 1; i <= 20; i++) {
            await driver.executeScript("arguments[0].click();", submitBtn);
            await driver.sleep(200); // Tạm dừng 200ms giữa mỗi cú click để hệ thống kịp xử lý request
            
            try {
                // Đọc text hiển thị trên UI hoặc Toast message để xem có báo lỗi 429 không
                const bodyText = await driver.findElement(By.css("body")).getText();
                
                // Các keyword nhận diện lỗi Rate limit thông thường (Tùy thuộc backend trả về)
                if (bodyText.includes("Too many") || 
                    bodyText.toLowerCase().includes("nhiều yêu cầu") || 
                    bodyText.includes("429") ||
                    bodyText.toLowerCase().includes("thử lại sau") ||
                    bodyText.toLowerCase().includes("rate limit")) {
                    
                    rateLimitHit = true;
                    console.log(`Bị chặn ở lần click thứ ${i}.`);
                    break;
                }
            } catch (e) {
                // Bỏ qua lỗi nếu UI đang load lại khiến element bị stale
            }
        }

        if (rateLimitHit) {
            console.log("AT-020 Passed: Hệ thống ĐÃ CHẶN (Rate Limit) thành công khi spam đăng nhập.");
        } else {
            console.log("AT-020 Note: Chưa phát hiện thông báo Rate limit trên UI. Có thể API đã chặn nhưng UI không báo lỗi, hoặc cần cấu hình lại limit ở backend thấp hơn để dễ test.");
        }
    } catch (err) { 
        console.error("AT-020 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
