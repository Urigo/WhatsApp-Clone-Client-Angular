import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {MatButtonModule, MatIconModule, MatListModule, MatMenuModule, MatFormFieldModule, MatInputModule} from '@angular/material';
import {SharedModule} from '../shared/shared.module';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {LoginComponent} from './containers/login.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import {AuthInterceptor} from './services/auth.interceptor';
import {AuthGuard} from './services/auth.guard';
import {LoginService} from './services/login.service';
import { ErrorInterceptor } from './services/error.interceptor';


const routes: Routes = [
  {path: 'login', component: LoginComponent},
];

@NgModule({
  declarations: [
    LoginComponent,
  ],
  imports: [
    BrowserModule,
    // Material
    MatInputModule,
    MatFormFieldModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    // Animations
    BrowserAnimationsModule,
    // Flex layout
    FlexLayoutModule,
    // Routing
    RouterModule.forChild(routes),
    // Forms
    FormsModule,
    ReactiveFormsModule,
    // Feature modules
    SharedModule,
  ],
  providers: [
    LoginService,
    AuthInterceptor,
    ErrorInterceptor,
    AuthGuard,
  ],
})
export class LoginModule {
}
