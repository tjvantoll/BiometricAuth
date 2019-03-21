// The following is a sample implementation of a backend service using Progress Kinvey (https://www.progress.com/kinvey).
// Feel free to swap in your own service / APIs / etc here for your own apps.

import { Injectable } from "@angular/core";
import { Kinvey } from "kinvey-nativescript-sdk";
import { getBoolean, setBoolean } from "tns-core-modules/application-settings";

@Injectable()
export class UserService {
    isLoggedIn() {
        return !!Kinvey.User.getActiveUser();
    }

    login() {
        return Kinvey.User.loginWithMIC("sde://")
            .catch(this.handleErrors);
    }

    logout() {
        return Kinvey.User.logout()
            .catch(this.handleErrors);
    }

    handleErrors(error: Kinvey.BaseError) {
        console.error(error.message);
        return Promise.reject(error.message);
    }

    setBiometricAuthOptIn(isOptedIn: boolean) {
        setBoolean("biometricAuthOptIn", isOptedIn);
    }

    getBiometricAuthOptIn() {
        return getBoolean("biometricAuthOptIn");
    }
}
