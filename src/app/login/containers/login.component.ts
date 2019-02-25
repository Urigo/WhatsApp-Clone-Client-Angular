import {Component} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {FormBuilder, Validators} from '@angular/forms';
// import {matchOtherValidator} from '@moebius/ng-validators';
import {Router} from '@angular/router';
import {User} from '../../../graphql';
import {LoginService} from '../services/login.service';

@Component({
  selector: 'app-login',
  template: `
    <img src="assets/whatsapp-icon.png" />
    <h2>WhatsApp Clone</h2>
    <form *ngIf="signingIn" (ngSubmit)="signIn()" [formGroup]="signInForm" novalidate>
      <legend>Sign in</legend>
      <div style="width: 100%">
        <mat-form-field>
          <mat-label>Username</mat-label>
          <input matInput autocomplete="username" formControlName="username" type="text" placeholder="Enter your username" />
        </mat-form-field>
        <div class="error" *ngIf="signInForm.get('username').hasError('required') && signInForm.get('username').touched">
          Username is required
        </div>
        <mat-form-field>
          <mat-label>Password</mat-label>
          <input matInput autocomplete="current-password" formControlName="password" type="password" placeholder="Enter your password" />
        </mat-form-field>
        <div class="error" *ngIf="signInForm.get('password').hasError('required') && signInForm.get('password').touched">
          Password is required
        </div>
      </div>
      <button mat-button type="submit" color="secondary" [disabled]="signInForm.invalid">Sign in</button>
      <span class="alternative">Don't have an account yet? <a (click)="signingIn = false">Sign up!</a></span>
    </form>
    <form *ngIf="!signingIn" (ngSubmit)="signUp()" [formGroup]="signUpForm" novalidate>
      <legend>Sign up</legend>
      <div style="float: left; width: calc(50% - 10px); padding-right: 10px;">
        <mat-form-field>
          <mat-label>Name</mat-label>
          <input matInput autocomplete="name" formControlName="name" type="text" placeholder="Enter your name" />
        </mat-form-field>
        <mat-form-field>
          <mat-label>Username</mat-label>
          <input matInput autocomplete="username" formControlName="username" type="text" placeholder="Enter your username" />
        </mat-form-field>
        <div class="error" *ngIf="signUpForm.get('username').hasError('required') && signUpForm.get('username').touched">
          Username is required
        </div>
      </div>
      <div style="float: right; width: calc(50% - 10px); padding-left: 10px;">
        <mat-form-field>
          <mat-label>Password</mat-label>
          <input matInput autocomplete="new-password" formControlName="newPassword" type="password" placeholder="Enter your password" />
        </mat-form-field>
        <div class="error" *ngIf="signUpForm.get('newPassword').hasError('required') && signUpForm.get('newPassword').touched">
          Password is required
        </div>
        <mat-form-field>
          <mat-label>Confirm Password</mat-label>
          <input matInput autocomplete="new-password" formControlName="confirmPassword" type="password" placeholder="Confirm password" />
        </mat-form-field>
        <div class="error" *ngIf="signUpForm.get('confirmPassword').hasError('required') && signUpForm.get('confirmPassword').touched">
          Passwords must match
        </div>
      </div>
      <button mat-button type="submit" color="secondary" [disabled]="signUpForm.invalid">Sign up</button>
      <span class="alternative">Already have an account? <a (click)="signingIn = true">Sign in!</a></span>
    </form>
  `,
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  signInForm = this.fb.group({
    username: [null, [
      Validators.required,
    ]],
    password: [null, [
      Validators.required,
    ]],
  });

  signUpForm = this.fb.group({
    name: [null, [
      Validators.required,
    ]],
    username: [null, [
      Validators.required,
    ]],
    newPassword: [null, [
      Validators.required,
    ]],
    confirmPassword: [null, [
      Validators.required,
      // matchOtherValidator('newPassword'),
    ]],
  });

  public signingIn = true;

  constructor(private http: HttpClient,
              private fb: FormBuilder,
              private router: Router,
              private loginService: LoginService) {}

  signIn() {
    const {username, password} = this.signInForm.value;
    const auth = `Basic ${btoa(`${username}:${password}`)}`;
    this.http.post('http://localhost:3000/signin', null, {
      headers: {
        Authorization: auth,
      }
    }).subscribe((user: User) => {
      this.loginService.storeAuthHeader(auth);
      this.loginService.storeUser(user);
      this.router.navigate(['/chats']);
    }, err => console.error(err));
  }

  signUp() {
    const {username, newPassword: password, name} = this.signUpForm.value;
    const auth = this.loginService.createBase64Auth(username, password);
    this.http.post('http://localhost:3000/signup', {
      name,
      username,
      password,
    }, {
      headers: {
        Authorization: auth,
      }
    }).subscribe((user: User) => {
      this.loginService.storeAuthHeader(auth);
      this.loginService.storeUser(user);
      this.router.navigate(['/chats']);
    }, err => console.error(err));
  }
}
