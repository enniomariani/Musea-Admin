import {MainApp} from "renderer/mainApp.js";

document.addEventListener("DOMContentLoaded", async function () {
    const adminApp:MainApp = new MainApp();
    await adminApp.start();
});