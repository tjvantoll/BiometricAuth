import { Component, ElementRef, ViewChild, OnInit } from "@angular/core";
import { alert, confirm, prompt } from "tns-core-modules/ui/dialogs";
import { Page } from "tns-core-modules/ui/page";
import { RouterExtensions } from "nativescript-angular/router";
import { FingerprintAuth, BiometricIDAvailableResult } from "nativescript-fingerprint-auth";

import { User } from "../shared/user.model";
import { UserService } from "../shared/user.service";

@Component({
    selector: "app-login",
    moduleId: module.id,
    templateUrl: "./login.component.html",
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    isLoggingIn = true;
    user: User;
    processing = false;
    fingerprintAuth: FingerprintAuth;
    showFullLoginForm = false;

    @ViewChild("password") password: ElementRef;
    @ViewChild("confirmPassword") confirmPassword: ElementRef;

    constructor(private page: Page, private userService: UserService, private routerExtensions: RouterExtensions) {
        this.page.actionBarHidden = true;
        this.user = new User();
        this.user.email = "user@nativescript.org";
        this.user.password = "password";
        this.fingerprintAuth = new FingerprintAuth();
    }

    toggleForm() {
        this.isLoggingIn = !this.isLoggingIn;
        if (!this.showFullLoginForm) {
            this.showFullLoginForm = true;
        }
    }

    submit() {
        if (this.isLoggingIn && this.userService.getBiometricAuthOptIn() && this.userService.isLoggedIn()) {
            this.biometricAuth();
            return;
        }

        if (this.isLoggingIn && !this.showFullLoginForm) {
            this.showFullLoginForm = true;
            return;
        }

        if (!this.user.email || !this.user.password) {
            this.alert("Please provide both an email address and password.");
            return;
        }

        this.processing = true;
        if (this.isLoggingIn) {
            this.login();
        } else {
            this.register();
        }
    }

    login() {
        var successfulLogin = this.handleLogin();
        if (!successfulLogin) {
            return;
        }

        this.fingerprintAuth.available()
            .then((result: BiometricIDAvailableResult) => {
                // Biometric auth is not available. Just navigate them to the home page.
                if (!result.any) {
                    this.processing = false;
                    this.navigateHome();
                }

                var authName = result.face ? "Face ID" : "your fingerprint";
                confirm({
                    title: "APP NAME",
                    message: `Would you like to use ${authName} to authenticate on future visits?`,
                    okButtonText: "Yes",
                    cancelButtonText: "No"
                }).then((result) => {
                    this.userService.setBiometricAuthOptIn(result);
                    if (result) {
                        this.biometricAuth();
                    } else {
                        // User doesn’t want to use biometric auth. Just navigate them to the home page.
                        this.processing = false;
                        this.navigateHome();
                    }
                });
            })
            .catch(this.handleFailedBiometricAuth);
    }

    private handleFailedBiometricAuth() {
        this.processing = false;
        this.showFullLoginForm = true;
    }

    register() {
        if (this.user.password != this.user.confirmPassword) {
            this.alert("Your passwords do not match.");
            return;
        }
        this.userService.register(this.user)
            .then(() => {
                this.processing = false;
                this.alert("Your account was successfully created.");
                this.isLoggingIn = true;
            })
            .catch(() => {
                this.processing = false;
                this.alert("Unfortunately we were unable to create your account.");
            });
    }

    forgotPassword() {
        prompt({
            title: "Forgot Password",
            message: "Enter the email address you used to register for APP NAME to reset your password.",
            inputType: "email",
            defaultText: "",
            okButtonText: "Ok",
            cancelButtonText: "Cancel"
        }).then((data) => {
            if (data.result) {
                this.userService.resetPassword(data.text.trim())
                    .then(() => {
                        this.alert("Your password was successfully reset. Please check your email for instructions on choosing a new password.");
                    }).catch(() => {
                        this.alert("Unfortunately, an error occurred resetting your password.");
                    });
            }
        });
    }

    focusPassword() {
        this.password.nativeElement.focus();
    }
    focusConfirmPassword() {
        if (!this.isLoggingIn) {
            this.confirmPassword.nativeElement.focus();
        }
    }

    alert(message: string) {
        return alert({
            title: "APP NAME",
            okButtonText: "OK",
            message: message
        });
    }

    private navigateHome() {
        this.routerExtensions.navigate(["/home"], { clearHistory: true });
    }

    private async handleLogin() {
        var successfulLogin = true;
        var result = this.userService.login(this.user)
            .catch(() => {
                successfulLogin = false;
                this.processing = false;
                this.alert("Unfortunately we could not find your account.");
            });

        await result;
        return successfulLogin;
    }

    private biometricAuth() {
        return this.fingerprintAuth.verifyFingerprint({
            title: "APP NAME",
            message: ""
        }).then((enteredPassword: string) => {
            if (enteredPassword === undefined) {
                this.processing = false;
                this.navigateHome();
            } else {
                this.handleFailedBiometricAuth();
            }
        }).catch(this.handleFailedBiometricAuth);
    }
}
