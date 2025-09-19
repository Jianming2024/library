//import {TodoClient} from "./generated-ts-client.ts";

const isProduction = import.meta.env.PROD;

const prod = "https://librarydemo-jm.fly.dev";
const dev = "http://localhost:5102";

export const finalUrl = isProduction ? prod : dev;

//export const todoClient = new TodoClient(finalUrl)