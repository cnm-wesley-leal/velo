import { Page } from '@playwright/test'

export function generateOrderCode() {
    const prefix = "VLO-";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let randomPart = "";
  
    for (let i = 0; i < 6; i++) {
      randomPart += characters.charAt(Math.floor(Math.random() * characters.length));
    }
  
    return prefix + randomPart;
  }
