const isDev = require("electron-is-dev");

process.isDev = isDev;
process.resourcesPath = isDev
    ? process.cwd() + "/resources"
    : process.resourcesPath;

require("./app");
