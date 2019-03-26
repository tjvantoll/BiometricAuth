// The following is a sample implementation of a backend service using Progress Kinvey (https://www.progress.com/kinvey).
// Feel free to swap in your own service / APIs / etc here for your own apps.

import { Injectable } from "@angular/core";
import { Kinvey } from "kinvey-nativescript-sdk";

Kinvey.init();

export class BackendService {
    static isUserLoggedIn() {
        // Hardcoding false just to make biometric auth easier to test by
        // always starting the app on the login screen.
        return false;

        // In a production setting use the following code 
        // return !!Kinvey.User.getActiveUser();
    }
}