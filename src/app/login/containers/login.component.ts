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
    <form (ngSubmit)="signIn()" [formGroup]="signInForm" novalidate>
      <fieldset fxLayout="column" fxLayoutGap="17px">
        <legend>Sign in</legend>
        <div>
          <label>Username</label>
          <input formControlName="username" autocomplete="username" type="text">
        </div>
        <div class="error" *ngIf="signInForm.get('username').hasError('required') && signInForm.get('username').touched">
          Username is required
        </div>

        <div>
          <label>Password</label>
          <input formControlName="password" autocomplete="current-password" type="password">
        </div>
        <div class="error" *ngIf="signInForm.get('password').hasError('required') && signInForm.get('password').touched">
          Password is required
        </div>

        <button type="submit" [disabled]="signInForm.invalid">Sign in</button>
      </fieldset>
    </form>

    <form (ngSubmit)="signUp()" [formGroup]="signUpForm" novalidate>
      <fieldset fxLayout="column" fxLayoutGap="17px">
        <legend>Sign up</legend>
        <div>
          <label>Name</label>
          <input formControlName="name" type="text">
        </div>

        <div>
          <label>Username</label>
          <input formControlName="username" autocomplete="username" type="text">
        </div>
        <div class="error" *ngIf="signUpForm.get('username').hasError('required') && signUpForm.get('username').touched">
          Username is required
        </div>

        <div>
          <label>Password</label>
          <input formControlName="newPassword" autocomplete="new-password" type="password">
        </div>
        <div class="error" *ngIf="signUpForm.get('newPassword').hasError('required') && signUpForm.get('newPassword').touched">
          Password is required
        </div>

        <div>
          <label>Password</label>
          <input formControlName="confirmPassword" type="password">
        </div>
        <div class="error" *ngIf="signUpForm.get('confirmPassword').hasError('required') && signUpForm.get('confirmPassword').touched">
          Passwords must match
        </div>

        <button type="submit" [disabled]="signUpForm.invalid">Sign up</button>
      </fieldset>
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
    const {username, newPassword: password, name} = this.signInForm.value;
    const auth = `Basic ${btoa(`${username}:${password}`)}`;
    this.http.post('http://localhost:3000/signup', {
      name,
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
