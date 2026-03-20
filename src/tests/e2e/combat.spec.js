//test E2E de PhaserGame.jsx
import { test, expect } from '@playwright/test';

test('Flujo completo: Login -> Editor -> Combate', async ({ page }) => {
    await page.goto('http://localhost:5173');

    await page.click('text=PLAY');

    await page.fill('input[placeholder*="email"]', 'test@example.com');
    await page.fill('input[placeholder*="password"]', '123456');
    await page.click('button:has-text("ENTRAR")');

    await expect(page.locator('text=CHARACTER EDITOR')).toBeVisible();
    await page.click('text=CONTINUE');
    await page.click('text=START GAME');

    const gameCanvas = page.locator('#game-container canvas');
    await expect(gameCanvas).toBeVisible();

    await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('player-health', { 
            detail: { hp: 20, maxHP: 100 } 
        }));
    });
    const healthText = page.locator('span:has-text("20/100")');
    await expect(healthText).toBeVisible();
});