// The following is a sample implementation of a backend service using Progress Kinvey (https://www.progress.com/kinvey).
// Feel free to swap in your own service / APIs / etc here for your own apps.

import { Injectable } from "@angular/core";
import { Kinvey } from "kinvey-nativescript-sdk";

Kinvey.init({
    appKey: "kid_rkDJUINIQ",
    appSecret: "17282f9d91da4af7b398855e32ea4dd0"
});

export class BackendService {
    static isUserLoggedIn() {
        return false;
        // return !!Kinvey.User.getActiveUser();
    }
}