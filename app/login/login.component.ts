import { Component } from "@angular/core";
import { alert, confirm } from "tns-core-modules/ui/dialogs";
import { Page } from "tns-core-modules/ui/page";
import { RouterExtensions } from "nativescript-angular/router";
import { FingerprintAuth, BiometricIDAvailableResult } from "nativescript-fingerprint-auth";

import { UserService } from "../shared/user.service";

const APP_NAME = "APP NAME";

@Component({
    selector: "app-login",
    moduleId: module.id,
    templateUrl: "./login.component.html",
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    fingerprintAuth: FingerprintAuth;

    constructor(private page: Page, private userService: UserService, private routerExtensions: RouterExtensions) {
        this.page.actionBarHidden = true;
        this.fingerprintAuth = new FingerprintAuth();
    }

    login() {
        if (this.userService.getBiometricAuthOptIn() && this.userService.isLoggedIn()) {
            this.biometricAuth();
            return;
        }

        this.userService.login()
            .catch(() => {
                alert({
                    title: APP_NAME,
                    okButtonText: "OK",
                    message: "Unfortunately we could not find your account."
                });
            })
            .then(() => {
                this.fingerprintAuth.available()
                    .then((result: BiometricIDAvailableResult) => {
                        // Biometric auth is not available. Just navigate them to the home page.
                        if (!result.any) {
                            this.navigateHome();
                            return;
                        }

                        var authName = result.face ? "Face ID" : "your fingerprint";
                        confirm({
                            title: APP_NAME,
                            message: `Would you like to use ${authName} to authenticate on future visits?`,
                            okButtonText: "Yes",
                            cancelButtonText: "No"
                        }).then((result) => {
                            this.userService.setBiometricAuthOptIn(result);
                            if (result) {
                                this.biometricAuth();
                            } else {
                                // User doesn’t want to use biometric auth. Just navigate them to the home page.
                                this.navigateHome();
                            }
                        });
                    });
            });
    }

    private navigateHome() {
        this.routerExtensions.navigate(["/home"], { clearHistory: true });
    }

    private biometricAuth() {
        return this.fingerprintAuth.verifyFingerprint({
            title: APP_NAME,
            message: ""
        }).then((enteredPassword: string) => {
            if (enteredPassword === undefined) {
                this.navigateHome();
            }
        });
    }
}
