import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../service/user.service';
import { NavigationExtras } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoginRequest } from '../interfaces/login-request';
import { StateService } from '../service/state.service';
import { User } from '../interfaces/user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnDestroy {
  formValid: boolean = false;
  subscription: Subscription;
  user: User | undefined;
  error: string | null = null;

  constructor(
    private router: Router,
    private userService: UserService,
    private stateService: StateService,
  ) {
    this.subscription = Subscription.EMPTY;
    // this.stateService.state?.subscribe({
    //   next: (user: User) => {
    //     this.user = user;
    //     // this.router.navigate(['home']);
    //     console.log(user);
    //   },
    //   error: (err) => {
    //     console.error(err);
    //     // this.router.navigate(['login']);
    //   },
    // });
  }

  loginForm: FormGroup = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(4),
      Validators.maxLength(300),
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(4),
      Validators.maxLength(30),
    ]),
  });

  goToRegister() {
    this.router.navigate(['register']);
  }

  onSubmit() {
    const request: LoginRequest = this.loginForm.value;
    this.subscription = this.userService.sendLoginRequest(request).subscribe({
      next: (data) => {
        const navigationExtras: NavigationExtras = { state: { data: data } };
        this.stateService.refreshState(data.jwtToken!, data);
        this.router.navigate(['home'], navigationExtras);
      },
      error: (data) => {
        this.error = data.error.message;
      },
    });
  }

  onValidate() {
    this.formValid = this.loginForm.valid;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
