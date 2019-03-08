"use-strict";

const themes = ["#F9D716", "#D64163","#fa625f","#007bff"];
const selTheme = themes[Math.floor(Math.random() * themes.length)];
document.documentElement.style.setProperty('--theme', selTheme);