# Step 9: Zero latency on slow 3g networks

[//]: # (head-end)


# Chapter 5

Now we can concentrate on the client and bootstrap it using angular-cli:

    $ ng new client --style scss

Time to install a couple of packages:

    $ npm install apollo-angular apollo-angular-link-http apollo-cache-inmemory apollo-client apollo-link graphql graphql-tag

Import Apollo client from our `app.module`:

[{]: <helper> (diffStep "1.1" files="app.module.ts")

#### Step 1.1: Add angular-apollo to app module

##### Changed src&#x2F;app&#x2F;app.module.ts
```diff
@@ -3,6 +3,10 @@
 ┊ 3┊ 3┊
 ┊ 4┊ 4┊
 ┊ 5┊ 5┊import { AppComponent } from './app.component';
+┊  ┊ 6┊import {HttpClientModule} from '@angular/common/http';
+┊  ┊ 7┊import {HttpLink, HttpLinkModule, Options} from 'apollo-angular-link-http';
+┊  ┊ 8┊import {Apollo, ApolloModule} from 'apollo-angular';
+┊  ┊ 9┊import {InMemoryCache} from 'apollo-cache-inmemory';
 ┊ 6┊10┊
 ┊ 7┊11┊
 ┊ 8┊12┊@NgModule({
```
```diff
@@ -10,9 +14,23 @@
 ┊10┊14┊    AppComponent
 ┊11┊15┊  ],
 ┊12┊16┊  imports: [
-┊13┊  ┊    BrowserModule
+┊  ┊17┊    BrowserModule,
+┊  ┊18┊    // Apollo
+┊  ┊19┊    ApolloModule,
+┊  ┊20┊    HttpLinkModule,
+┊  ┊21┊    HttpClientModule,
 ┊14┊22┊  ],
 ┊15┊23┊  providers: [],
 ┊16┊24┊  bootstrap: [AppComponent]
 ┊17┊25┊})
-┊18┊  ┊export class AppModule { }
+┊  ┊26┊export class AppModule {
+┊  ┊27┊  constructor(
+┊  ┊28┊    apollo: Apollo,
+┊  ┊29┊    httpLink: HttpLink,
+┊  ┊30┊  ) {
+┊  ┊31┊    apollo.create({
+┊  ┊32┊      link: httpLink.create(<Options>{uri: 'http://localhost:3000/graphql'}),
+┊  ┊33┊      cache: new InMemoryCache()
+┊  ┊34┊    });
+┊  ┊35┊  }
+┊  ┊36┊}
```

[}]: #

Let's create a simple service to query the chats from our just created server:

[{]: <helper> (diffStep "1.2")

#### Step 1.2: Add chats service

##### Changed package.json
```diff
@@ -37,6 +37,7 @@
 ┊37┊37┊    "@angular/cli": "1.7.0",
 ┊38┊38┊    "@angular/compiler-cli": "5.2.5",
 ┊39┊39┊    "@angular/language-service": "5.2.5",
+┊  ┊40┊    "@types/graphql": "0.12.4",
 ┊40┊41┊    "@types/jasmine": "2.8.6",
 ┊41┊42┊    "@types/jasminewd2": "2.0.3",
 ┊42┊43┊    "@types/node": "6.0.101",
```

##### Added src&#x2F;app&#x2F;services&#x2F;chats.service.ts
```diff
@@ -0,0 +1,26 @@
+┊  ┊ 1┊import {ApolloQueryResult, WatchQueryOptions} from 'apollo-client';
+┊  ┊ 2┊import {map} from 'rxjs/operators';
+┊  ┊ 3┊import {Apollo} from 'apollo-angular';
+┊  ┊ 4┊import {Injectable} from '@angular/core';
+┊  ┊ 5┊import {getChatsQuery} from '../../graphql/getChats.query';
+┊  ┊ 6┊
+┊  ┊ 7┊@Injectable()
+┊  ┊ 8┊export class ChatsService {
+┊  ┊ 9┊  messagesAmount = 3;
+┊  ┊10┊
+┊  ┊11┊  constructor(private apollo: Apollo) {}
+┊  ┊12┊
+┊  ┊13┊  getChats() {
+┊  ┊14┊    const query = this.apollo.watchQuery<any>(<WatchQueryOptions>{
+┊  ┊15┊      query: getChatsQuery,
+┊  ┊16┊      variables: {
+┊  ┊17┊        amount: this.messagesAmount,
+┊  ┊18┊      },
+┊  ┊19┊    });
+┊  ┊20┊    const chats$ = query.valueChanges.pipe(
+┊  ┊21┊      map((result: ApolloQueryResult<any>) => result.data.chats)
+┊  ┊22┊    );
+┊  ┊23┊
+┊  ┊24┊    return {query, chats$};
+┊  ┊25┊  }
+┊  ┊26┊}
```

##### Added src&#x2F;graphql&#x2F;fragment.ts
```diff
@@ -0,0 +1,42 @@
+┊  ┊ 1┊import gql from 'graphql-tag';
+┊  ┊ 2┊import {DocumentNode} from 'graphql';
+┊  ┊ 3┊
+┊  ┊ 4┊export const fragments: {
+┊  ┊ 5┊  [key: string]: DocumentNode
+┊  ┊ 6┊} = {
+┊  ┊ 7┊  chatWithoutMessages: gql`
+┊  ┊ 8┊    fragment ChatWithoutMessages on Chat {
+┊  ┊ 9┊      id
+┊  ┊10┊      name
+┊  ┊11┊      picture
+┊  ┊12┊      allTimeMembers {
+┊  ┊13┊        id
+┊  ┊14┊      }
+┊  ┊15┊      unreadMessages
+┊  ┊16┊      isGroup
+┊  ┊17┊    }
+┊  ┊18┊  `,
+┊  ┊19┊  message: gql`
+┊  ┊20┊    fragment Message on Message {
+┊  ┊21┊      id
+┊  ┊22┊      sender {
+┊  ┊23┊        id
+┊  ┊24┊        name
+┊  ┊25┊      }
+┊  ┊26┊      content
+┊  ┊27┊      createdAt
+┊  ┊28┊      type
+┊  ┊29┊      recipients {
+┊  ┊30┊        user {
+┊  ┊31┊          id
+┊  ┊32┊        }
+┊  ┊33┊        message {
+┊  ┊34┊          id
+┊  ┊35┊        }
+┊  ┊36┊        receivedAt
+┊  ┊37┊        readAt
+┊  ┊38┊      }
+┊  ┊39┊      ownership
+┊  ┊40┊    }
+┊  ┊41┊  `,
+┊  ┊42┊};
```

##### Added src&#x2F;graphql&#x2F;getChats.query.ts
```diff
@@ -0,0 +1,17 @@
+┊  ┊ 1┊import gql from 'graphql-tag';
+┊  ┊ 2┊import {fragments} from './fragment';
+┊  ┊ 3┊
+┊  ┊ 4┊// We use the gql tag to parse our query string into a query document
+┊  ┊ 5┊export const getChatsQuery = gql`
+┊  ┊ 6┊  query GetChats($amount: Int) {
+┊  ┊ 7┊    chats {
+┊  ┊ 8┊      ...ChatWithoutMessages
+┊  ┊ 9┊      messages(amount: $amount) {
+┊  ┊10┊        ...Message
+┊  ┊11┊      }
+┊  ┊12┊    }
+┊  ┊13┊  }
+┊  ┊14┊
+┊  ┊15┊  ${fragments['chatWithoutMessages']}
+┊  ┊16┊  ${fragments['message']}
+┊  ┊17┊`;
```

[}]: #

We will use Materials for the UI, so let's install it:

    $ npm install @angular/cdk @angular/material hammerjs ng2-truncate

Let's configure Material:

[{]: <helper> (diffStep "1.3" files="src/index.ts, src/main.ts, src/styles.scss")

#### Step 1.3: List the chats

##### Changed src&#x2F;main.ts
```diff
@@ -4,6 +4,9 @@
 ┊ 4┊ 4┊import { AppModule } from './app/app.module';
 ┊ 5┊ 5┊import { environment } from './environments/environment';
 ┊ 6┊ 6┊
+┊  ┊ 7┊// Material gestures
+┊  ┊ 8┊import 'hammerjs';
+┊  ┊ 9┊
 ┊ 7┊10┊if (environment.production) {
 ┊ 8┊11┊  enableProdMode();
 ┊ 9┊12┊}
```

##### Changed src&#x2F;styles.scss
```diff
@@ -1 +1,8 @@
 ┊1┊1┊/* You can add global styles to this file, and also import other style files */
+┊ ┊2┊
+┊ ┊3┊/* Meterial theme */
+┊ ┊4┊@import "~@angular/material/prebuilt-themes/indigo-pink.css";
+┊ ┊5┊
+┊ ┊6┊body {
+┊ ┊7┊  margin: 0;
+┊ ┊8┊}
```

[}]: #

We're now creating a `shared` module where we will define our header component where we're going to project a different content from each component:

[{]: <helper> (diffStep "1.3" files="src/app/shared/*")

#### Step 1.3: List the chats

##### Added src&#x2F;app&#x2F;shared&#x2F;components&#x2F;toolbar&#x2F;toolbar.component.scss
```diff
@@ -0,0 +1,13 @@
+┊  ┊ 1┊:host {
+┊  ┊ 2┊  display: block;
+┊  ┊ 3┊  height: 8vh;
+┊  ┊ 4┊}
+┊  ┊ 5┊
+┊  ┊ 6┊.mat-toolbar {
+┊  ┊ 7┊  justify-content: space-between;
+┊  ┊ 8┊  height: 100%;
+┊  ┊ 9┊
+┊  ┊10┊  .left-block {
+┊  ┊11┊    display: flex;
+┊  ┊12┊  }
+┊  ┊13┊}
```

##### Added src&#x2F;app&#x2F;shared&#x2F;components&#x2F;toolbar&#x2F;toolbar.component.ts
```diff
@@ -0,0 +1,18 @@
+┊  ┊ 1┊import {Component} from '@angular/core';
+┊  ┊ 2┊
+┊  ┊ 3┊@Component({
+┊  ┊ 4┊  selector: 'app-toolbar',
+┊  ┊ 5┊  template: `
+┊  ┊ 6┊    <mat-toolbar>
+┊  ┊ 7┊      <div class="left-block">
+┊  ┊ 8┊        <ng-content select=".navigation"></ng-content>
+┊  ┊ 9┊        <ng-content select=".title"></ng-content>
+┊  ┊10┊      </div>
+┊  ┊11┊      <ng-content select=".menu"></ng-content>
+┊  ┊12┊    </mat-toolbar>
+┊  ┊13┊  `,
+┊  ┊14┊  styleUrls: ['./toolbar.component.scss']
+┊  ┊15┊})
+┊  ┊16┊export class ToolbarComponent {
+┊  ┊17┊
+┊  ┊18┊}
```

##### Added src&#x2F;app&#x2F;shared&#x2F;shared.module.ts
```diff
@@ -0,0 +1,28 @@
+┊  ┊ 1┊import {BrowserModule} from '@angular/platform-browser';
+┊  ┊ 2┊import {NgModule} from '@angular/core';
+┊  ┊ 3┊
+┊  ┊ 4┊import {MatToolbarModule} from '@angular/material';
+┊  ┊ 5┊import {ToolbarComponent} from './components/toolbar/toolbar.component';
+┊  ┊ 6┊import {FormsModule} from '@angular/forms';
+┊  ┊ 7┊import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
+┊  ┊ 8┊
+┊  ┊ 9┊@NgModule({
+┊  ┊10┊  declarations: [
+┊  ┊11┊    ToolbarComponent,
+┊  ┊12┊  ],
+┊  ┊13┊  imports: [
+┊  ┊14┊    BrowserModule,
+┊  ┊15┊    // Material
+┊  ┊16┊    MatToolbarModule,
+┊  ┊17┊    // Animations
+┊  ┊18┊    BrowserAnimationsModule,
+┊  ┊19┊    // Forms
+┊  ┊20┊    FormsModule,
+┊  ┊21┊  ],
+┊  ┊22┊  providers: [],
+┊  ┊23┊  exports: [
+┊  ┊24┊    ToolbarComponent,
+┊  ┊25┊  ],
+┊  ┊26┊})
+┊  ┊27┊export class SharedModule {
+┊  ┊28┊}
```

[}]: #

Now we want to create the `chats-lister` module, with a container component called `ChatsComponent` and a couple of presentational components.

[{]: <helper> (diffStep "1.3" files="src/app/chats-lister/*")

#### Step 1.3: List the chats

##### Added src&#x2F;app&#x2F;chats-lister&#x2F;chats-lister.module.ts
```diff
@@ -0,0 +1,48 @@
+┊  ┊ 1┊import { BrowserModule } from '@angular/platform-browser';
+┊  ┊ 2┊import { NgModule } from '@angular/core';
+┊  ┊ 3┊
+┊  ┊ 4┊import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
+┊  ┊ 5┊import {MatButtonModule, MatIconModule, MatListModule, MatMenuModule} from '@angular/material';
+┊  ┊ 6┊import {RouterModule, Routes} from '@angular/router';
+┊  ┊ 7┊import {FormsModule} from '@angular/forms';
+┊  ┊ 8┊import {ChatsService} from '../services/chats.service';
+┊  ┊ 9┊import {ChatItemComponent} from './components/chat-item/chat-item.component';
+┊  ┊10┊import {ChatsComponent} from './containers/chats/chats.component';
+┊  ┊11┊import {ChatsListComponent} from './components/chats-list/chats-list.component';
+┊  ┊12┊import {TruncateModule} from 'ng2-truncate';
+┊  ┊13┊import {SharedModule} from '../shared/shared.module';
+┊  ┊14┊
+┊  ┊15┊const routes: Routes = [
+┊  ┊16┊  {path: 'chats', component: ChatsComponent},
+┊  ┊17┊];
+┊  ┊18┊
+┊  ┊19┊@NgModule({
+┊  ┊20┊  declarations: [
+┊  ┊21┊    ChatsComponent,
+┊  ┊22┊    ChatsListComponent,
+┊  ┊23┊    ChatItemComponent,
+┊  ┊24┊  ],
+┊  ┊25┊  imports: [
+┊  ┊26┊    BrowserModule,
+┊  ┊27┊    // Material
+┊  ┊28┊    MatMenuModule,
+┊  ┊29┊    MatIconModule,
+┊  ┊30┊    MatButtonModule,
+┊  ┊31┊    MatListModule,
+┊  ┊32┊    // Animations
+┊  ┊33┊    BrowserAnimationsModule,
+┊  ┊34┊    // Routing
+┊  ┊35┊    RouterModule.forChild(routes),
+┊  ┊36┊    // Forms
+┊  ┊37┊    FormsModule,
+┊  ┊38┊    // Truncate Pipe
+┊  ┊39┊    TruncateModule,
+┊  ┊40┊    // Feature modules
+┊  ┊41┊    SharedModule,
+┊  ┊42┊  ],
+┊  ┊43┊  providers: [
+┊  ┊44┊    ChatsService,
+┊  ┊45┊  ],
+┊  ┊46┊})
+┊  ┊47┊export class ChatsListerModule {
+┊  ┊48┊}
```

##### Added src&#x2F;app&#x2F;chats-lister&#x2F;components&#x2F;chat-item&#x2F;chat-item.component.scss
```diff
@@ -0,0 +1,17 @@
+┊  ┊ 1┊:host {
+┊  ┊ 2┊  display: block;
+┊  ┊ 3┊  width: 100%;
+┊  ┊ 4┊}
+┊  ┊ 5┊
+┊  ┊ 6┊.chat-row {
+┊  ┊ 7┊  padding: 0;
+┊  ┊ 8┊  display: flex;
+┊  ┊ 9┊  width: 100%;
+┊  ┊10┊  justify-content: space-between;
+┊  ┊11┊  align-items: center;
+┊  ┊12┊
+┊  ┊13┊  .chat-recipient {
+┊  ┊14┊    display: flex;
+┊  ┊15┊    width: 60%;
+┊  ┊16┊  }
+┊  ┊17┊}
```

##### Added src&#x2F;app&#x2F;chats-lister&#x2F;components&#x2F;chat-item&#x2F;chat-item.component.ts
```diff
@@ -0,0 +1,20 @@
+┊  ┊ 1┊import {Component, Input} from '@angular/core';
+┊  ┊ 2┊
+┊  ┊ 3┊@Component({
+┊  ┊ 4┊  selector: 'app-chat-item',
+┊  ┊ 5┊  template: `
+┊  ┊ 6┊    <div class="chat-row">
+┊  ┊ 7┊        <div class="chat-recipient">
+┊  ┊ 8┊          <img *ngIf="chat.picture" [src]="chat.picture" width="48" height="48">
+┊  ┊ 9┊          <div>{{ chat.name }} [id: {{ chat.id }}]</div>
+┊  ┊10┊        </div>
+┊  ┊11┊        <div class="chat-content">{{ chat.messages[chat.messages.length - 1]?.content | truncate : 20 : '...' }}</div>
+┊  ┊12┊    </div>
+┊  ┊13┊  `,
+┊  ┊14┊  styleUrls: ['chat-item.component.scss'],
+┊  ┊15┊})
+┊  ┊16┊export class ChatItemComponent {
+┊  ┊17┊  // tslint:disable-next-line:no-input-rename
+┊  ┊18┊  @Input('item')
+┊  ┊19┊  chat: any;
+┊  ┊20┊}
```

##### Added src&#x2F;app&#x2F;chats-lister&#x2F;components&#x2F;chats-list&#x2F;chats-list.component.scss
```diff
@@ -0,0 +1,3 @@
+┊ ┊1┊:host {
+┊ ┊2┊  display: block;
+┊ ┊3┊}
```

##### Added src&#x2F;app&#x2F;chats-lister&#x2F;components&#x2F;chats-list&#x2F;chats-list.component.ts
```diff
@@ -0,0 +1,20 @@
+┊  ┊ 1┊import {Component, Input} from '@angular/core';
+┊  ┊ 2┊
+┊  ┊ 3┊@Component({
+┊  ┊ 4┊  selector: 'app-chats-list',
+┊  ┊ 5┊  template: `
+┊  ┊ 6┊    <mat-list>
+┊  ┊ 7┊      <mat-list-item *ngFor="let chat of chats">
+┊  ┊ 8┊        <app-chat-item [item]="chat"></app-chat-item>
+┊  ┊ 9┊      </mat-list-item>
+┊  ┊10┊    </mat-list>
+┊  ┊11┊  `,
+┊  ┊12┊  styleUrls: ['chats-list.component.scss'],
+┊  ┊13┊})
+┊  ┊14┊export class ChatsListComponent {
+┊  ┊15┊  // tslint:disable-next-line:no-input-rename
+┊  ┊16┊  @Input('items')
+┊  ┊17┊  chats: any[];
+┊  ┊18┊
+┊  ┊19┊  constructor() {}
+┊  ┊20┊}
```

##### Added src&#x2F;app&#x2F;chats-lister&#x2F;containers&#x2F;chats&#x2F;chats.component.scss
```diff
@@ -0,0 +1,5 @@
+┊ ┊1┊.chat-button {
+┊ ┊2┊  position: absolute;
+┊ ┊3┊  bottom: 5vw;
+┊ ┊4┊  right: 5vw;
+┊ ┊5┊}
```

##### Added src&#x2F;app&#x2F;chats-lister&#x2F;containers&#x2F;chats&#x2F;chats.component.ts
```diff
@@ -0,0 +1,46 @@
+┊  ┊ 1┊import {Component, OnInit} from '@angular/core';
+┊  ┊ 2┊import {ChatsService} from '../../../services/chats.service';
+┊  ┊ 3┊import {Observable} from 'rxjs/Observable';
+┊  ┊ 4┊
+┊  ┊ 5┊@Component({
+┊  ┊ 6┊  template: `
+┊  ┊ 7┊    <app-toolbar>
+┊  ┊ 8┊      <div class="title">Whatsapp Clone</div>
+┊  ┊ 9┊      <button mat-icon-button [matMenuTriggerFor]="menu" class="menu">
+┊  ┊10┊        <mat-icon>more_vert</mat-icon>
+┊  ┊11┊      </button>
+┊  ┊12┊    </app-toolbar>
+┊  ┊13┊
+┊  ┊14┊    <mat-menu #menu="matMenu">
+┊  ┊15┊      <button mat-menu-item>
+┊  ┊16┊        <mat-icon>dialpad</mat-icon>
+┊  ┊17┊        <span>Redial</span>
+┊  ┊18┊      </button>
+┊  ┊19┊      <button mat-menu-item disabled>
+┊  ┊20┊        <mat-icon>voicemail</mat-icon>
+┊  ┊21┊        <span>Check voicemail</span>
+┊  ┊22┊      </button>
+┊  ┊23┊      <button mat-menu-item>
+┊  ┊24┊        <mat-icon>notifications_off</mat-icon>
+┊  ┊25┊        <span>Disable alerts</span>
+┊  ┊26┊      </button>
+┊  ┊27┊    </mat-menu>
+┊  ┊28┊
+┊  ┊29┊    <app-chats-list [items]="chats$ | async"></app-chats-list>
+┊  ┊30┊
+┊  ┊31┊    <button class="chat-button" mat-fab color="primary">
+┊  ┊32┊      <mat-icon aria-label="Icon-button with a + icon">add</mat-icon>
+┊  ┊33┊    </button>
+┊  ┊34┊  `,
+┊  ┊35┊  styleUrls: ['./chats.component.scss'],
+┊  ┊36┊})
+┊  ┊37┊export class ChatsComponent implements OnInit {
+┊  ┊38┊  chats$: Observable<any[]>;
+┊  ┊39┊
+┊  ┊40┊  constructor(private chatsService: ChatsService) {
+┊  ┊41┊  }
+┊  ┊42┊
+┊  ┊43┊  ngOnInit() {
+┊  ┊44┊    this.chats$ = this.chatsService.getChats().chats$;
+┊  ┊45┊  }
+┊  ┊46┊}
```

[}]: #

Finally let's wire everything up to the main module:

[{]: <helper> (diffStep "1.3" files="src/app/app.component.ts, src/app/app.module.ts")

#### Step 1.3: List the chats

##### Changed src&#x2F;app&#x2F;app.component.ts
```diff
@@ -2,7 +2,9 @@
 ┊ 2┊ 2┊
 ┊ 3┊ 3┊@Component({
 ┊ 4┊ 4┊  selector: 'app-root',
-┊ 5┊  ┊  templateUrl: './app.component.html',
+┊  ┊ 5┊  template: `
+┊  ┊ 6┊    <router-outlet></router-outlet>
+┊  ┊ 7┊  `,
 ┊ 6┊ 8┊  styleUrls: ['./app.component.scss']
 ┊ 7┊ 9┊})
 ┊ 8┊10┊export class AppComponent {
```

##### Changed src&#x2F;app&#x2F;app.module.ts
```diff
@@ -7,7 +7,12 @@
 ┊ 7┊ 7┊import {HttpLink, HttpLinkModule, Options} from 'apollo-angular-link-http';
 ┊ 8┊ 8┊import {Apollo, ApolloModule} from 'apollo-angular';
 ┊ 9┊ 9┊import {InMemoryCache} from 'apollo-cache-inmemory';
+┊  ┊10┊import {ChatsListerModule} from './chats-lister/chats-lister.module';
+┊  ┊11┊import {RouterModule, Routes} from '@angular/router';
 ┊10┊12┊
+┊  ┊13┊const routes: Routes = [
+┊  ┊14┊  {path: '', redirectTo: 'chats', pathMatch: 'full'},
+┊  ┊15┊];
 ┊11┊16┊
 ┊12┊17┊@NgModule({
 ┊13┊18┊  declarations: [
```
```diff
@@ -19,6 +24,10 @@
 ┊19┊24┊    ApolloModule,
 ┊20┊25┊    HttpLinkModule,
 ┊21┊26┊    HttpClientModule,
+┊  ┊27┊    // Routing
+┊  ┊28┊    RouterModule.forRoot(routes),
+┊  ┊29┊    // Feature modules
+┊  ┊30┊    ChatsListerModule,
 ┊22┊31┊  ],
 ┊23┊32┊  providers: [],
 ┊24┊33┊  bootstrap: [AppComponent]
```

[}]: #

# Chapter 6

Let's do the same on the client:

$ npm install graphql-code-generator

[{]: <helper> (diffStep "2.1")

#### Step 2.1: Install graphql-code-generator

##### Changed package.json
```diff
@@ -46,6 +46,7 @@
 ┊46┊46┊    "@types/jasminewd2": "2.0.3",
 ┊47┊47┊    "@types/node": "6.0.101",
 ┊48┊48┊    "codelyzer": "4.1.0",
+┊  ┊49┊    "graphql-code-generator": "0.8.14",
 ┊49┊50┊    "jasmine-core": "2.8.0",
 ┊50┊51┊    "jasmine-spec-reporter": "4.2.1",
 ┊51┊52┊    "karma": "2.0.0",
```

[}]: #

Those are our generated types:
[{]: <helper> (diffStep "2.2")

#### Step 2.2: Run generator

##### Changed package.json
```diff
@@ -8,7 +8,8 @@
 ┊ 8┊ 8┊    "build": "ng build --prod",
 ┊ 9┊ 9┊    "test": "ng test",
 ┊10┊10┊    "lint": "ng lint",
-┊11┊  ┊    "e2e": "ng e2e"
+┊  ┊11┊    "e2e": "ng e2e",
+┊  ┊12┊    "generator": "gql-gen --url http://localhost:3000/graphql --template ts --out ./src/types.d.ts \"./src/graphql/**/*.ts\""
 ┊12┊13┊  },
 ┊13┊14┊  "private": true,
 ┊14┊15┊  "dependencies": {
```
```diff
@@ -30,7 +31,7 @@
 ┊30┊31┊    "apollo-client": "2.2.5",
 ┊31┊32┊    "apollo-link": "1.1.0",
 ┊32┊33┊    "core-js": "2.5.3",
-┊33┊  ┊    "graphql": "0.13.1",
+┊  ┊34┊    "graphql": "0.12.3",
 ┊34┊35┊    "graphql-tag": "2.7.3",
 ┊35┊36┊    "hammerjs": "2.0.8",
 ┊36┊37┊    "ng2-truncate": "1.3.11",
```

##### Added src&#x2F;types.d.ts
```diff
@@ -0,0 +1,118 @@
+┊   ┊  1┊/* tslint:disable */
+┊   ┊  2┊
+┊   ┊  3┊export interface Query {
+┊   ┊  4┊  users: User[]; 
+┊   ┊  5┊  chats: Chat[]; 
+┊   ┊  6┊  chat?: Chat | null; 
+┊   ┊  7┊}
+┊   ┊  8┊
+┊   ┊  9┊export interface User {
+┊   ┊ 10┊  id: string; 
+┊   ┊ 11┊  name?: string | null; 
+┊   ┊ 12┊  picture?: string | null; 
+┊   ┊ 13┊  phone?: string | null; 
+┊   ┊ 14┊}
+┊   ┊ 15┊
+┊   ┊ 16┊export interface Chat {
+┊   ┊ 17┊  id: string; /* May be a chat or a group */
+┊   ┊ 18┊  name?: string | null; /* Computed for chats */
+┊   ┊ 19┊  picture?: string | null; /* Computed for chats */
+┊   ┊ 20┊  allTimeMembers: User[]; /* All members, current and past ones. */
+┊   ┊ 21┊  listingMembers: User[]; /* Whoever gets the chat listed. For groups includes past members who still didn&#x27;t delete the group. */
+┊   ┊ 22┊  actualGroupMembers: User[]; /* Actual members of the group (they are not the only ones who get the group listed). Null for chats. */
+┊   ┊ 23┊  admins: User[]; /* Null for chats */
+┊   ┊ 24┊  owner?: User | null; /* If null the group is read-only. Null for chats. */
+┊   ┊ 25┊  messages: Message[]; 
+┊   ┊ 26┊  unreadMessages: number; /* Computed property */
+┊   ┊ 27┊  isGroup: boolean; /* Computed property */
+┊   ┊ 28┊}
+┊   ┊ 29┊
+┊   ┊ 30┊export interface Message {
+┊   ┊ 31┊  id: string; 
+┊   ┊ 32┊  sender: User; 
+┊   ┊ 33┊  chat: Chat; 
+┊   ┊ 34┊  content: string; 
+┊   ┊ 35┊  createdAt: string; 
+┊   ┊ 36┊  type: number; /* FIXME: should return MessageType */
+┊   ┊ 37┊  recipients: Recipient[]; /* Whoever received the message */
+┊   ┊ 38┊  holders: User[]; /* Whoever still holds a copy of the message. Cannot be null because the message gets deleted otherwise */
+┊   ┊ 39┊  ownership: boolean; /* Computed property */
+┊   ┊ 40┊}
+┊   ┊ 41┊
+┊   ┊ 42┊export interface Recipient {
+┊   ┊ 43┊  user: User; 
+┊   ┊ 44┊  message: Message; 
+┊   ┊ 45┊  receivedAt?: string | null; 
+┊   ┊ 46┊  readAt?: string | null; 
+┊   ┊ 47┊}
+┊   ┊ 48┊export interface ChatQueryArgs {
+┊   ┊ 49┊  chatId: string; 
+┊   ┊ 50┊}
+┊   ┊ 51┊export interface MessagesChatArgs {
+┊   ┊ 52┊  amount?: number | null; 
+┊   ┊ 53┊}
+┊   ┊ 54┊
+┊   ┊ 55┊export type MessageType = "LOCATION" | "TEXT" | "PICTURE";
+┊   ┊ 56┊
+┊   ┊ 57┊export namespace GetChats {
+┊   ┊ 58┊  export type Variables = {
+┊   ┊ 59┊    amount?: number | null;
+┊   ┊ 60┊  }
+┊   ┊ 61┊
+┊   ┊ 62┊  export type Query = {
+┊   ┊ 63┊    chats: Chats[]; 
+┊   ┊ 64┊  } 
+┊   ┊ 65┊
+┊   ┊ 66┊  export type Chats = {
+┊   ┊ 67┊    messages: Messages[]; 
+┊   ┊ 68┊  } & ChatWithoutMessages.Fragment
+┊   ┊ 69┊
+┊   ┊ 70┊  export type Messages = Message.Fragment
+┊   ┊ 71┊}
+┊   ┊ 72┊
+┊   ┊ 73┊export namespace ChatWithoutMessages {
+┊   ┊ 74┊  export type Fragment = {
+┊   ┊ 75┊    id: string; 
+┊   ┊ 76┊    name?: string | null; 
+┊   ┊ 77┊    picture?: string | null; 
+┊   ┊ 78┊    allTimeMembers: AllTimeMembers[]; 
+┊   ┊ 79┊    unreadMessages: number; 
+┊   ┊ 80┊    isGroup: boolean; 
+┊   ┊ 81┊  } 
+┊   ┊ 82┊
+┊   ┊ 83┊  export type AllTimeMembers = {
+┊   ┊ 84┊    id: string; 
+┊   ┊ 85┊  } 
+┊   ┊ 86┊}
+┊   ┊ 87┊
+┊   ┊ 88┊export namespace Message {
+┊   ┊ 89┊  export type Fragment = {
+┊   ┊ 90┊    id: string; 
+┊   ┊ 91┊    sender: Sender; 
+┊   ┊ 92┊    content: string; 
+┊   ┊ 93┊    createdAt: string; 
+┊   ┊ 94┊    type: number; 
+┊   ┊ 95┊    recipients: Recipients[]; 
+┊   ┊ 96┊    ownership: boolean; 
+┊   ┊ 97┊  } 
+┊   ┊ 98┊
+┊   ┊ 99┊  export type Sender = {
+┊   ┊100┊    id: string; 
+┊   ┊101┊    name?: string | null; 
+┊   ┊102┊  } 
+┊   ┊103┊
+┊   ┊104┊  export type Recipients = {
+┊   ┊105┊    user: User; 
+┊   ┊106┊    message: Message; 
+┊   ┊107┊    receivedAt?: string | null; 
+┊   ┊108┊    readAt?: string | null; 
+┊   ┊109┊  } 
+┊   ┊110┊
+┊   ┊111┊  export type User = {
+┊   ┊112┊    id: string; 
+┊   ┊113┊  } 
+┊   ┊114┊
+┊   ┊115┊  export type Message = {
+┊   ┊116┊    id: string; 
+┊   ┊117┊  } 
+┊   ┊118┊}
```

[}]: #

Let's use them:

[{]: <helper> (diffStep "2.3")

#### Step 2.3: Use the generated types

##### Changed src&#x2F;app&#x2F;chats-lister&#x2F;components&#x2F;chat-item&#x2F;chat-item.component.ts
```diff
@@ -1,4 +1,5 @@
 ┊1┊1┊import {Component, Input} from '@angular/core';
+┊ ┊2┊import {GetChats} from '../../../../types';
 ┊2┊3┊
 ┊3┊4┊@Component({
 ┊4┊5┊  selector: 'app-chat-item',
```
```diff
@@ -16,5 +17,5 @@
 ┊16┊17┊export class ChatItemComponent {
 ┊17┊18┊  // tslint:disable-next-line:no-input-rename
 ┊18┊19┊  @Input('item')
-┊19┊  ┊  chat: any;
+┊  ┊20┊  chat: GetChats.Chats;
 ┊20┊21┊}
```

##### Changed src&#x2F;app&#x2F;chats-lister&#x2F;components&#x2F;chats-list&#x2F;chats-list.component.ts
```diff
@@ -1,4 +1,5 @@
 ┊1┊1┊import {Component, Input} from '@angular/core';
+┊ ┊2┊import {GetChats} from '../../../../types';
 ┊2┊3┊
 ┊3┊4┊@Component({
 ┊4┊5┊  selector: 'app-chats-list',
```
```diff
@@ -14,7 +15,7 @@
 ┊14┊15┊export class ChatsListComponent {
 ┊15┊16┊  // tslint:disable-next-line:no-input-rename
 ┊16┊17┊  @Input('items')
-┊17┊  ┊  chats: any[];
+┊  ┊18┊  chats: GetChats.Chats[];
 ┊18┊19┊
 ┊19┊20┊  constructor() {}
 ┊20┊21┊}
```

##### Changed src&#x2F;app&#x2F;chats-lister&#x2F;containers&#x2F;chats&#x2F;chats.component.ts
```diff
@@ -1,6 +1,7 @@
 ┊1┊1┊import {Component, OnInit} from '@angular/core';
 ┊2┊2┊import {ChatsService} from '../../../services/chats.service';
 ┊3┊3┊import {Observable} from 'rxjs/Observable';
+┊ ┊4┊import {GetChats} from '../../../../types';
 ┊4┊5┊
 ┊5┊6┊@Component({
 ┊6┊7┊  template: `
```
```diff
@@ -35,7 +36,7 @@
 ┊35┊36┊  styleUrls: ['./chats.component.scss'],
 ┊36┊37┊})
 ┊37┊38┊export class ChatsComponent implements OnInit {
-┊38┊  ┊  chats$: Observable<any[]>;
+┊  ┊39┊  chats$: Observable<GetChats.Chats[]>;
 ┊39┊40┊
 ┊40┊41┊  constructor(private chatsService: ChatsService) {
 ┊41┊42┊  }
```

##### Changed src&#x2F;app&#x2F;services&#x2F;chats.service.ts
```diff
@@ -3,6 +3,7 @@
 ┊3┊3┊import {Apollo} from 'apollo-angular';
 ┊4┊4┊import {Injectable} from '@angular/core';
 ┊5┊5┊import {getChatsQuery} from '../../graphql/getChats.query';
+┊ ┊6┊import {GetChats} from '../../types';
 ┊6┊7┊
 ┊7┊8┊@Injectable()
 ┊8┊9┊export class ChatsService {
```
```diff
@@ -11,14 +12,14 @@
 ┊11┊12┊  constructor(private apollo: Apollo) {}
 ┊12┊13┊
 ┊13┊14┊  getChats() {
-┊14┊  ┊    const query = this.apollo.watchQuery<any>(<WatchQueryOptions>{
+┊  ┊15┊    const query = this.apollo.watchQuery<GetChats.Query>(<WatchQueryOptions>{
 ┊15┊16┊      query: getChatsQuery,
 ┊16┊17┊      variables: {
 ┊17┊18┊        amount: this.messagesAmount,
 ┊18┊19┊      },
 ┊19┊20┊    });
 ┊20┊21┊    const chats$ = query.valueChanges.pipe(
-┊21┊  ┊      map((result: ApolloQueryResult<any>) => result.data.chats)
+┊  ┊22┊      map((result: ApolloQueryResult<GetChats.Query>) => result.data.chats)
 ┊22┊23┊    );
 ┊23┊24┊
 ┊24┊25┊    return {query, chats$};
```

[}]: #

# Chapter 7

[{]: <helper> (diffStep "3.1")

#### Step 3.1: Testing

##### Deleted src&#x2F;app&#x2F;app.component.spec.ts
```diff
@@ -1,27 +0,0 @@
-┊ 1┊  ┊import { TestBed, async } from '@angular/core/testing';
-┊ 2┊  ┊import { AppComponent } from './app.component';
-┊ 3┊  ┊describe('AppComponent', () => {
-┊ 4┊  ┊  beforeEach(async(() => {
-┊ 5┊  ┊    TestBed.configureTestingModule({
-┊ 6┊  ┊      declarations: [
-┊ 7┊  ┊        AppComponent
-┊ 8┊  ┊      ],
-┊ 9┊  ┊    }).compileComponents();
-┊10┊  ┊  }));
-┊11┊  ┊  it('should create the app', async(() => {
-┊12┊  ┊    const fixture = TestBed.createComponent(AppComponent);
-┊13┊  ┊    const app = fixture.debugElement.componentInstance;
-┊14┊  ┊    expect(app).toBeTruthy();
-┊15┊  ┊  }));
-┊16┊  ┊  it(`should have as title 'app'`, async(() => {
-┊17┊  ┊    const fixture = TestBed.createComponent(AppComponent);
-┊18┊  ┊    const app = fixture.debugElement.componentInstance;
-┊19┊  ┊    expect(app.title).toEqual('app');
-┊20┊  ┊  }));
-┊21┊  ┊  it('should render title in a h1 tag', async(() => {
-┊22┊  ┊    const fixture = TestBed.createComponent(AppComponent);
-┊23┊  ┊    fixture.detectChanges();
-┊24┊  ┊    const compiled = fixture.debugElement.nativeElement;
-┊25┊  ┊    expect(compiled.querySelector('h1').textContent).toContain('Welcome to app!');
-┊26┊  ┊  }));
-┊27┊  ┊});
```

##### Added src&#x2F;app&#x2F;chats-lister&#x2F;components&#x2F;chat-item&#x2F;chat-item.component.spec.ts
```diff
@@ -0,0 +1,95 @@
+┊  ┊ 1┊import { async, ComponentFixture, TestBed } from '@angular/core/testing';
+┊  ┊ 2┊
+┊  ┊ 3┊import { ChatItemComponent } from './chat-item.component';
+┊  ┊ 4┊import {DebugElement} from '@angular/core';
+┊  ┊ 5┊import {By} from '@angular/platform-browser';
+┊  ┊ 6┊import {TruncateModule} from 'ng2-truncate';
+┊  ┊ 7┊
+┊  ┊ 8┊describe('ChatItemComponent', () => {
+┊  ┊ 9┊  let component: ChatItemComponent;
+┊  ┊10┊  let fixture: ComponentFixture<ChatItemComponent>;
+┊  ┊11┊  let el: DebugElement;
+┊  ┊12┊
+┊  ┊13┊  const chat: any = {
+┊  ┊14┊    id: '1',
+┊  ┊15┊    __typename: 'Chat',
+┊  ┊16┊    name: 'Niccolo\' Belli',
+┊  ┊17┊    picture: null,
+┊  ┊18┊    allTimeMembers: [
+┊  ┊19┊      {
+┊  ┊20┊        id: '1',
+┊  ┊21┊        __typename: 'User',
+┊  ┊22┊      },
+┊  ┊23┊      {
+┊  ┊24┊        id: '2',
+┊  ┊25┊        __typename: 'User',
+┊  ┊26┊      }
+┊  ┊27┊    ],
+┊  ┊28┊    unreadMessages: 0,
+┊  ┊29┊    isGroup: false,
+┊  ┊30┊    messages: [
+┊  ┊31┊      {
+┊  ┊32┊        id: '1234567890',
+┊  ┊33┊        __typename: 'Message',
+┊  ┊34┊        sender: {
+┊  ┊35┊          id: '1',
+┊  ┊36┊          __typename: 'User',
+┊  ┊37┊          name: 'Niccolo\' Belli',
+┊  ┊38┊        },
+┊  ┊39┊        content: 'Hello! How are you? A lot happened since last time',
+┊  ┊40┊        createdAt: '1513435525',
+┊  ┊41┊        type: 1,
+┊  ┊42┊        recipients: [
+┊  ┊43┊          {
+┊  ┊44┊            user: {
+┊  ┊45┊              id: '2',
+┊  ┊46┊              __typename: 'User',
+┊  ┊47┊            },
+┊  ┊48┊            message: {
+┊  ┊49┊              id: '1234567890',
+┊  ┊50┊              __typename: 'Message',
+┊  ┊51┊            },
+┊  ┊52┊            __typename: 'Recipient',
+┊  ┊53┊            receivedAt: null,
+┊  ┊54┊            readAt: null,
+┊  ┊55┊          }
+┊  ┊56┊        ],
+┊  ┊57┊        ownership: true,
+┊  ┊58┊      }
+┊  ┊59┊    ],
+┊  ┊60┊  };
+┊  ┊61┊
+┊  ┊62┊  beforeEach(async(() => {
+┊  ┊63┊    TestBed.configureTestingModule({
+┊  ┊64┊      declarations: [ ChatItemComponent ],
+┊  ┊65┊      imports: [TruncateModule]
+┊  ┊66┊    })
+┊  ┊67┊    .compileComponents();
+┊  ┊68┊  }));
+┊  ┊69┊
+┊  ┊70┊  beforeEach(() => {
+┊  ┊71┊    fixture = TestBed.createComponent(ChatItemComponent);
+┊  ┊72┊    component = fixture.componentInstance;
+┊  ┊73┊    component.chat = chat;
+┊  ┊74┊    fixture.detectChanges();
+┊  ┊75┊    el = fixture.debugElement;
+┊  ┊76┊  });
+┊  ┊77┊
+┊  ┊78┊  it('should create', () => {
+┊  ┊79┊    expect(component).toBeTruthy();
+┊  ┊80┊  });
+┊  ┊81┊
+┊  ┊82┊  it('should contain the chat name', () => {
+┊  ┊83┊    expect(el.query(By.css('.chat-recipient > div:first-child')).nativeElement.textContent).toContain(chat.name);
+┊  ┊84┊  });
+┊  ┊85┊
+┊  ┊86┊  it('should contain the first couple of characters of the message content', () => {
+┊  ┊87┊    expect(el.query(By.css('.chat-content')).nativeElement.textContent)
+┊  ┊88┊      .toContain(chat.messages[chat.messages.length - 1].content.slice(0, 20));
+┊  ┊89┊  });
+┊  ┊90┊
+┊  ┊91┊  it('should not contain the latest characters of the message content', () => {
+┊  ┊92┊    expect(el.query(By.css('.chat-content')).nativeElement.textContent)
+┊  ┊93┊      .not.toContain(chat.messages[chat.messages.length - 1].content.slice(20));
+┊  ┊94┊  });
+┊  ┊95┊});
```

##### Added src&#x2F;app&#x2F;chats-lister&#x2F;containers&#x2F;chats&#x2F;chats.component.spec.ts
```diff
@@ -0,0 +1,324 @@
+┊   ┊  1┊import { async, ComponentFixture, TestBed } from '@angular/core/testing';
+┊   ┊  2┊
+┊   ┊  3┊import { ChatsComponent } from './chats.component';
+┊   ┊  4┊import {DebugElement, NO_ERRORS_SCHEMA} from '@angular/core';
+┊   ┊  5┊import {ChatsListComponent} from '../../components/chats-list/chats-list.component';
+┊   ┊  6┊import {ChatItemComponent} from '../../components/chat-item/chat-item.component';
+┊   ┊  7┊import {TruncateModule} from 'ng2-truncate';
+┊   ┊  8┊import {MatButtonModule, MatIconModule, MatListModule, MatMenuModule} from '@angular/material';
+┊   ┊  9┊import {ChatsService} from '../../../services/chats.service';
+┊   ┊ 10┊import {Apollo} from 'apollo-angular';
+┊   ┊ 11┊import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
+┊   ┊ 12┊import {HttpLink, HttpLinkModule, Options} from 'apollo-angular-link-http';
+┊   ┊ 13┊import {InMemoryCache} from 'apollo-cache-inmemory';
+┊   ┊ 14┊import {By} from '@angular/platform-browser';
+┊   ┊ 15┊import {RouterTestingModule} from '@angular/router/testing';
+┊   ┊ 16┊
+┊   ┊ 17┊describe('ChatsComponent', () => {
+┊   ┊ 18┊  let component: ChatsComponent;
+┊   ┊ 19┊  let fixture: ComponentFixture<ChatsComponent>;
+┊   ┊ 20┊  let el: DebugElement;
+┊   ┊ 21┊
+┊   ┊ 22┊  let httpMock: HttpTestingController;
+┊   ┊ 23┊  let httpLink: HttpLink;
+┊   ┊ 24┊  let apollo: Apollo;
+┊   ┊ 25┊
+┊   ┊ 26┊  const chats: any = [
+┊   ┊ 27┊    {
+┊   ┊ 28┊      id: '1',
+┊   ┊ 29┊      __typename: 'Chat',
+┊   ┊ 30┊      name: 'Avery Stewart',
+┊   ┊ 31┊      picture: 'https://randomuser.me/api/portraits/thumb/women/1.jpg',
+┊   ┊ 32┊      allTimeMembers: [
+┊   ┊ 33┊        {
+┊   ┊ 34┊          id: '1',
+┊   ┊ 35┊          __typename: 'User',
+┊   ┊ 36┊        },
+┊   ┊ 37┊        {
+┊   ┊ 38┊          id: '3',
+┊   ┊ 39┊          __typename: 'User',
+┊   ┊ 40┊        }
+┊   ┊ 41┊      ],
+┊   ┊ 42┊      unreadMessages: 1,
+┊   ┊ 43┊      isGroup: false,
+┊   ┊ 44┊      messages: [
+┊   ┊ 45┊        {
+┊   ┊ 46┊          id: '708323562255',
+┊   ┊ 47┊          __typename: 'Message',
+┊   ┊ 48┊          sender: {
+┊   ┊ 49┊            id: '3',
+┊   ┊ 50┊            __typename: 'User',
+┊   ┊ 51┊            name: 'Avery Stewart'
+┊   ┊ 52┊          },
+┊   ┊ 53┊          content: 'Yep!',
+┊   ┊ 54┊          createdAt: '1514035700',
+┊   ┊ 55┊          type: 0,
+┊   ┊ 56┊          recipients: [
+┊   ┊ 57┊            {
+┊   ┊ 58┊              user: {
+┊   ┊ 59┊                id: '1',
+┊   ┊ 60┊                __typename: 'User',
+┊   ┊ 61┊              },
+┊   ┊ 62┊              message: {
+┊   ┊ 63┊                id: '708323562255',
+┊   ┊ 64┊                __typename: 'Message',
+┊   ┊ 65┊              },
+┊   ┊ 66┊              __typename: 'Recipient',
+┊   ┊ 67┊              receivedAt: null,
+┊   ┊ 68┊              readAt: null,
+┊   ┊ 69┊            }
+┊   ┊ 70┊          ],
+┊   ┊ 71┊          ownership: false,
+┊   ┊ 72┊        }
+┊   ┊ 73┊      ],
+┊   ┊ 74┊    },
+┊   ┊ 75┊    {
+┊   ┊ 76┊      id: '2',
+┊   ┊ 77┊      __typename: 'Chat',
+┊   ┊ 78┊      name: 'Katie Peterson',
+┊   ┊ 79┊      picture: 'https://randomuser.me/api/portraits/thumb/women/2.jpg',
+┊   ┊ 80┊      allTimeMembers: [
+┊   ┊ 81┊        {
+┊   ┊ 82┊          id: '1',
+┊   ┊ 83┊          __typename: 'User',
+┊   ┊ 84┊        },
+┊   ┊ 85┊        {
+┊   ┊ 86┊          id: '4',
+┊   ┊ 87┊          __typename: 'User',
+┊   ┊ 88┊        }
+┊   ┊ 89┊      ],
+┊   ┊ 90┊      unreadMessages: 0,
+┊   ┊ 91┊      isGroup: false,
+┊   ┊ 92┊      messages: [
+┊   ┊ 93┊        {
+┊   ┊ 94┊          id: '559578737535',
+┊   ┊ 95┊          __typename: 'Message',
+┊   ┊ 96┊          sender: {
+┊   ┊ 97┊            id: '1',
+┊   ┊ 98┊            __typename: 'User',
+┊   ┊ 99┊            name: 'Ethan Gonzalez'
+┊   ┊100┊          },
+┊   ┊101┊          content: 'Hey, it\'s me',
+┊   ┊102┊          createdAt: '1514031800',
+┊   ┊103┊          type: 0,
+┊   ┊104┊          recipients: [
+┊   ┊105┊            {
+┊   ┊106┊              user: {
+┊   ┊107┊                id: '4',
+┊   ┊108┊                __typename: 'User',
+┊   ┊109┊              },
+┊   ┊110┊              message: {
+┊   ┊111┊                id: '559578737535',
+┊   ┊112┊                __typename: 'Message',
+┊   ┊113┊              },
+┊   ┊114┊              __typename: 'Recipient',
+┊   ┊115┊              receivedAt: null,
+┊   ┊116┊              readAt: null,
+┊   ┊117┊            }
+┊   ┊118┊          ],
+┊   ┊119┊          ownership: true
+┊   ┊120┊        }
+┊   ┊121┊      ],
+┊   ┊122┊    },
+┊   ┊123┊    {
+┊   ┊124┊      id: '3',
+┊   ┊125┊      __typename: 'Chat',
+┊   ┊126┊      name: 'Ray Edwards',
+┊   ┊127┊      picture: 'https://randomuser.me/api/portraits/thumb/men/3.jpg',
+┊   ┊128┊      allTimeMembers: [
+┊   ┊129┊        {
+┊   ┊130┊          id: '1',
+┊   ┊131┊          __typename: 'User',
+┊   ┊132┊        },
+┊   ┊133┊        {
+┊   ┊134┊          id: '5',
+┊   ┊135┊          __typename: 'User',
+┊   ┊136┊        }
+┊   ┊137┊      ],
+┊   ┊138┊      unreadMessages: 0,
+┊   ┊139┊      isGroup: false,
+┊   ┊140┊      messages: [
+┊   ┊141┊        {
+┊   ┊142┊          id: '127559683621',
+┊   ┊143┊          __typename: 'Message',
+┊   ┊144┊          sender: {
+┊   ┊145┊            id: '1',
+┊   ┊146┊            __typename: 'User',
+┊   ┊147┊            name: 'Ethan Gonzalez'
+┊   ┊148┊          },
+┊   ┊149┊          content: 'You still there?',
+┊   ┊150┊          createdAt: '1514010200',
+┊   ┊151┊          type: 0,
+┊   ┊152┊          recipients: [
+┊   ┊153┊            {
+┊   ┊154┊              user: {
+┊   ┊155┊                id: '5',
+┊   ┊156┊                __typename: 'User',
+┊   ┊157┊              },
+┊   ┊158┊              message: {
+┊   ┊159┊                id: '127559683621',
+┊   ┊160┊                __typename: 'Message',
+┊   ┊161┊              },
+┊   ┊162┊              __typename: 'Recipient',
+┊   ┊163┊              receivedAt: null,
+┊   ┊164┊              readAt: null
+┊   ┊165┊            }
+┊   ┊166┊          ],
+┊   ┊167┊          ownership: true
+┊   ┊168┊        }
+┊   ┊169┊      ],
+┊   ┊170┊    },
+┊   ┊171┊    {
+┊   ┊172┊      id: '6',
+┊   ┊173┊      __typename: 'Chat',
+┊   ┊174┊      name: 'Niccolò Belli',
+┊   ┊175┊      picture: 'https://randomuser.me/api/portraits/thumb/men/4.jpg',
+┊   ┊176┊      allTimeMembers: [
+┊   ┊177┊        {
+┊   ┊178┊          id: '1',
+┊   ┊179┊          __typename: 'User',
+┊   ┊180┊        },
+┊   ┊181┊        {
+┊   ┊182┊          id: '6',
+┊   ┊183┊          __typename: 'User',
+┊   ┊184┊        }
+┊   ┊185┊      ],
+┊   ┊186┊      unreadMessages: 0,
+┊   ┊187┊      messages: [],
+┊   ┊188┊      isGroup: false
+┊   ┊189┊    },
+┊   ┊190┊    {
+┊   ┊191┊      id: '8',
+┊   ┊192┊      __typename: 'Chat',
+┊   ┊193┊      name: 'A user 0 group',
+┊   ┊194┊      picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg',
+┊   ┊195┊      allTimeMembers: [
+┊   ┊196┊        {
+┊   ┊197┊          id: '1',
+┊   ┊198┊          __typename: 'User',
+┊   ┊199┊        },
+┊   ┊200┊        {
+┊   ┊201┊          id: '3',
+┊   ┊202┊          __typename: 'User',
+┊   ┊203┊        },
+┊   ┊204┊        {
+┊   ┊205┊          id: '4',
+┊   ┊206┊          __typename: 'User',
+┊   ┊207┊        },
+┊   ┊208┊        {
+┊   ┊209┊          id: '6',
+┊   ┊210┊          __typename: 'User',
+┊   ┊211┊        },
+┊   ┊212┊      ],
+┊   ┊213┊      unreadMessages: 1,
+┊   ┊214┊      isGroup: true,
+┊   ┊215┊      messages: [
+┊   ┊216┊        {
+┊   ┊217┊          id: '147283729633',
+┊   ┊218┊          __typename: 'Message',
+┊   ┊219┊          sender: {
+┊   ┊220┊            id: '4',
+┊   ┊221┊            __typename: 'User',
+┊   ┊222┊            name: 'Katie Peterson'
+┊   ┊223┊          },
+┊   ┊224┊          content: 'Awesome!',
+┊   ┊225┊          createdAt: '1512830000',
+┊   ┊226┊          type: 0,
+┊   ┊227┊          recipients: [
+┊   ┊228┊            {
+┊   ┊229┊              user: {
+┊   ┊230┊                id: '1',
+┊   ┊231┊                __typename: 'User',
+┊   ┊232┊              },
+┊   ┊233┊              message: {
+┊   ┊234┊                id: '147283729633',
+┊   ┊235┊                __typename: 'Message',
+┊   ┊236┊              },
+┊   ┊237┊              __typename: 'Recipient',
+┊   ┊238┊              receivedAt: null,
+┊   ┊239┊              readAt: null
+┊   ┊240┊            },
+┊   ┊241┊            {
+┊   ┊242┊              user: {
+┊   ┊243┊                id: '6',
+┊   ┊244┊                __typename: 'User',
+┊   ┊245┊              },
+┊   ┊246┊              message: {
+┊   ┊247┊                id: '147283729633',
+┊   ┊248┊                __typename: 'Message',
+┊   ┊249┊              },
+┊   ┊250┊              __typename: 'Recipient',
+┊   ┊251┊              receivedAt: null,
+┊   ┊252┊              readAt: null
+┊   ┊253┊            }
+┊   ┊254┊          ],
+┊   ┊255┊          ownership: false
+┊   ┊256┊        }
+┊   ┊257┊      ],
+┊   ┊258┊    },
+┊   ┊259┊  ];
+┊   ┊260┊
+┊   ┊261┊  beforeEach(async(() => {
+┊   ┊262┊    TestBed.configureTestingModule({
+┊   ┊263┊      declarations: [
+┊   ┊264┊        ChatsComponent,
+┊   ┊265┊        ChatsListComponent,
+┊   ┊266┊        ChatItemComponent
+┊   ┊267┊      ],
+┊   ┊268┊      imports: [
+┊   ┊269┊        MatMenuModule,
+┊   ┊270┊        MatIconModule,
+┊   ┊271┊        MatButtonModule,
+┊   ┊272┊        MatListModule,
+┊   ┊273┊        TruncateModule,
+┊   ┊274┊        HttpLinkModule,
+┊   ┊275┊        HttpClientTestingModule,
+┊   ┊276┊        RouterTestingModule
+┊   ┊277┊      ],
+┊   ┊278┊      providers: [
+┊   ┊279┊        ChatsService,
+┊   ┊280┊        Apollo,
+┊   ┊281┊      ],
+┊   ┊282┊      schemas: [NO_ERRORS_SCHEMA]
+┊   ┊283┊    })
+┊   ┊284┊      .compileComponents();
+┊   ┊285┊
+┊   ┊286┊    httpMock = TestBed.get(HttpTestingController);
+┊   ┊287┊    httpLink = TestBed.get(HttpLink);
+┊   ┊288┊    apollo = TestBed.get(Apollo);
+┊   ┊289┊
+┊   ┊290┊    apollo.create({
+┊   ┊291┊      link: httpLink.create(<Options>{ uri: 'http://localhost:3000/graphql' }),
+┊   ┊292┊      cache: new InMemoryCache()
+┊   ┊293┊    });
+┊   ┊294┊  }));
+┊   ┊295┊
+┊   ┊296┊  beforeEach(() => {
+┊   ┊297┊    fixture = TestBed.createComponent(ChatsComponent);
+┊   ┊298┊    component = fixture.componentInstance;
+┊   ┊299┊    fixture.detectChanges();
+┊   ┊300┊    const req = httpMock.expectOne('http://localhost:3000/graphql', 'call to api');
+┊   ┊301┊    req.flush({
+┊   ┊302┊      data: {
+┊   ┊303┊        chats
+┊   ┊304┊      }
+┊   ┊305┊    });
+┊   ┊306┊  });
+┊   ┊307┊
+┊   ┊308┊  it('should create', () => {
+┊   ┊309┊    expect(component).toBeTruthy();
+┊   ┊310┊  });
+┊   ┊311┊
+┊   ┊312┊  it('should display the chats', () => {
+┊   ┊313┊    fixture.whenStable().then(() => {
+┊   ┊314┊      fixture.detectChanges();
+┊   ┊315┊      el = fixture.debugElement;
+┊   ┊316┊      for (let i = 0; i < chats.length; i++) {
+┊   ┊317┊        expect(el.query(By.css(`app-chats-list > mat-list > mat-list-item:nth-child(${i + 1}) > div > app-chat-item > div > div > div`))
+┊   ┊318┊          .nativeElement.textContent).toContain(chats[i].name);
+┊   ┊319┊      }
+┊   ┊320┊    });
+┊   ┊321┊
+┊   ┊322┊    httpMock.verify();
+┊   ┊323┊  });
+┊   ┊324┊});
```

##### Added src&#x2F;app&#x2F;services&#x2F;chats.service.spec.ts
```diff
@@ -0,0 +1,292 @@
+┊   ┊  1┊import { TestBed, inject } from '@angular/core/testing';
+┊   ┊  2┊
+┊   ┊  3┊import { ChatsService } from './chats.service';
+┊   ┊  4┊import {Apollo} from 'apollo-angular';
+┊   ┊  5┊import {HttpLink, HttpLinkModule, Options} from 'apollo-angular-link-http';
+┊   ┊  6┊import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
+┊   ┊  7┊import {InMemoryCache} from 'apollo-cache-inmemory';
+┊   ┊  8┊
+┊   ┊  9┊describe('ChatsService', () => {
+┊   ┊ 10┊  let httpMock: HttpTestingController;
+┊   ┊ 11┊  let httpLink: HttpLink;
+┊   ┊ 12┊  let apollo: Apollo;
+┊   ┊ 13┊  const chats: any = [
+┊   ┊ 14┊    {
+┊   ┊ 15┊      id: '1',
+┊   ┊ 16┊      __typename: 'Chat',
+┊   ┊ 17┊      name: 'Avery Stewart',
+┊   ┊ 18┊      picture: 'https://randomuser.me/api/portraits/thumb/women/1.jpg',
+┊   ┊ 19┊      allTimeMembers: [
+┊   ┊ 20┊        {
+┊   ┊ 21┊          id: '1',
+┊   ┊ 22┊          __typename: 'User',
+┊   ┊ 23┊        },
+┊   ┊ 24┊        {
+┊   ┊ 25┊          id: '3',
+┊   ┊ 26┊          __typename: 'User',
+┊   ┊ 27┊        }
+┊   ┊ 28┊      ],
+┊   ┊ 29┊      unreadMessages: 1,
+┊   ┊ 30┊      isGroup: false,
+┊   ┊ 31┊      messages: [
+┊   ┊ 32┊        {
+┊   ┊ 33┊          id: '708323562255',
+┊   ┊ 34┊          __typename: 'Message',
+┊   ┊ 35┊          sender: {
+┊   ┊ 36┊            id: '3',
+┊   ┊ 37┊            __typename: 'User',
+┊   ┊ 38┊            name: 'Avery Stewart'
+┊   ┊ 39┊          },
+┊   ┊ 40┊          content: 'Yep!',
+┊   ┊ 41┊          createdAt: '1514035700',
+┊   ┊ 42┊          type: 0,
+┊   ┊ 43┊          recipients: [
+┊   ┊ 44┊            {
+┊   ┊ 45┊              user: {
+┊   ┊ 46┊                id: '1',
+┊   ┊ 47┊                __typename: 'User',
+┊   ┊ 48┊              },
+┊   ┊ 49┊              message: {
+┊   ┊ 50┊                id: '708323562255',
+┊   ┊ 51┊                __typename: 'Message',
+┊   ┊ 52┊              },
+┊   ┊ 53┊              __typename: 'Recipient',
+┊   ┊ 54┊              receivedAt: null,
+┊   ┊ 55┊              readAt: null,
+┊   ┊ 56┊            }
+┊   ┊ 57┊          ],
+┊   ┊ 58┊          ownership: false,
+┊   ┊ 59┊        }
+┊   ┊ 60┊      ],
+┊   ┊ 61┊    },
+┊   ┊ 62┊    {
+┊   ┊ 63┊      id: '2',
+┊   ┊ 64┊      __typename: 'Chat',
+┊   ┊ 65┊      name: 'Katie Peterson',
+┊   ┊ 66┊      picture: 'https://randomuser.me/api/portraits/thumb/women/2.jpg',
+┊   ┊ 67┊      allTimeMembers: [
+┊   ┊ 68┊        {
+┊   ┊ 69┊          id: '1',
+┊   ┊ 70┊          __typename: 'User',
+┊   ┊ 71┊        },
+┊   ┊ 72┊        {
+┊   ┊ 73┊          id: '4',
+┊   ┊ 74┊          __typename: 'User',
+┊   ┊ 75┊        }
+┊   ┊ 76┊      ],
+┊   ┊ 77┊      unreadMessages: 0,
+┊   ┊ 78┊      isGroup: false,
+┊   ┊ 79┊      messages: [
+┊   ┊ 80┊        {
+┊   ┊ 81┊          id: '559578737535',
+┊   ┊ 82┊          __typename: 'Message',
+┊   ┊ 83┊          sender: {
+┊   ┊ 84┊            id: '1',
+┊   ┊ 85┊            __typename: 'User',
+┊   ┊ 86┊            name: 'Ethan Gonzalez'
+┊   ┊ 87┊          },
+┊   ┊ 88┊          content: 'Hey, it\'s me',
+┊   ┊ 89┊          createdAt: '1514031800',
+┊   ┊ 90┊          type: 0,
+┊   ┊ 91┊          recipients: [
+┊   ┊ 92┊            {
+┊   ┊ 93┊              user: {
+┊   ┊ 94┊                id: '4',
+┊   ┊ 95┊                __typename: 'User',
+┊   ┊ 96┊              },
+┊   ┊ 97┊              message: {
+┊   ┊ 98┊                id: '559578737535',
+┊   ┊ 99┊                __typename: 'Message',
+┊   ┊100┊              },
+┊   ┊101┊              __typename: 'Recipient',
+┊   ┊102┊              receivedAt: null,
+┊   ┊103┊              readAt: null,
+┊   ┊104┊            }
+┊   ┊105┊          ],
+┊   ┊106┊          ownership: true
+┊   ┊107┊        }
+┊   ┊108┊      ],
+┊   ┊109┊    },
+┊   ┊110┊    {
+┊   ┊111┊      id: '3',
+┊   ┊112┊      __typename: 'Chat',
+┊   ┊113┊      name: 'Ray Edwards',
+┊   ┊114┊      picture: 'https://randomuser.me/api/portraits/thumb/men/3.jpg',
+┊   ┊115┊      allTimeMembers: [
+┊   ┊116┊        {
+┊   ┊117┊          id: '1',
+┊   ┊118┊          __typename: 'User',
+┊   ┊119┊        },
+┊   ┊120┊        {
+┊   ┊121┊          id: '5',
+┊   ┊122┊          __typename: 'User',
+┊   ┊123┊        }
+┊   ┊124┊      ],
+┊   ┊125┊      unreadMessages: 0,
+┊   ┊126┊      isGroup: false,
+┊   ┊127┊      messages: [
+┊   ┊128┊        {
+┊   ┊129┊          id: '127559683621',
+┊   ┊130┊          __typename: 'Message',
+┊   ┊131┊          sender: {
+┊   ┊132┊            id: '1',
+┊   ┊133┊            __typename: 'User',
+┊   ┊134┊            name: 'Ethan Gonzalez'
+┊   ┊135┊          },
+┊   ┊136┊          content: 'You still there?',
+┊   ┊137┊          createdAt: '1514010200',
+┊   ┊138┊          type: 0,
+┊   ┊139┊          recipients: [
+┊   ┊140┊            {
+┊   ┊141┊              user: {
+┊   ┊142┊                id: '5',
+┊   ┊143┊                __typename: 'User',
+┊   ┊144┊              },
+┊   ┊145┊              message: {
+┊   ┊146┊                id: '127559683621',
+┊   ┊147┊                __typename: 'Message',
+┊   ┊148┊              },
+┊   ┊149┊              __typename: 'Recipient',
+┊   ┊150┊              receivedAt: null,
+┊   ┊151┊              readAt: null
+┊   ┊152┊            }
+┊   ┊153┊          ],
+┊   ┊154┊          ownership: true
+┊   ┊155┊        }
+┊   ┊156┊      ],
+┊   ┊157┊    },
+┊   ┊158┊    {
+┊   ┊159┊      id: '6',
+┊   ┊160┊      __typename: 'Chat',
+┊   ┊161┊      name: 'Niccolò Belli',
+┊   ┊162┊      picture: 'https://randomuser.me/api/portraits/thumb/men/4.jpg',
+┊   ┊163┊      allTimeMembers: [
+┊   ┊164┊        {
+┊   ┊165┊          id: '1',
+┊   ┊166┊          __typename: 'User',
+┊   ┊167┊        },
+┊   ┊168┊        {
+┊   ┊169┊          id: '6',
+┊   ┊170┊          __typename: 'User',
+┊   ┊171┊        }
+┊   ┊172┊      ],
+┊   ┊173┊      unreadMessages: 0,
+┊   ┊174┊      messages: [],
+┊   ┊175┊      isGroup: false
+┊   ┊176┊    },
+┊   ┊177┊    {
+┊   ┊178┊      id: '8',
+┊   ┊179┊      __typename: 'Chat',
+┊   ┊180┊      name: 'A user 0 group',
+┊   ┊181┊      picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg',
+┊   ┊182┊      allTimeMembers: [
+┊   ┊183┊        {
+┊   ┊184┊          id: '1',
+┊   ┊185┊          __typename: 'User',
+┊   ┊186┊        },
+┊   ┊187┊        {
+┊   ┊188┊          id: '3',
+┊   ┊189┊          __typename: 'User',
+┊   ┊190┊        },
+┊   ┊191┊        {
+┊   ┊192┊          id: '4',
+┊   ┊193┊          __typename: 'User',
+┊   ┊194┊        },
+┊   ┊195┊        {
+┊   ┊196┊          id: '6',
+┊   ┊197┊          __typename: 'User',
+┊   ┊198┊        },
+┊   ┊199┊      ],
+┊   ┊200┊      unreadMessages: 1,
+┊   ┊201┊      isGroup: true,
+┊   ┊202┊      messages: [
+┊   ┊203┊        {
+┊   ┊204┊          id: '147283729633',
+┊   ┊205┊          __typename: 'Message',
+┊   ┊206┊          sender: {
+┊   ┊207┊            id: '4',
+┊   ┊208┊            __typename: 'User',
+┊   ┊209┊            name: 'Katie Peterson'
+┊   ┊210┊          },
+┊   ┊211┊          content: 'Awesome!',
+┊   ┊212┊          createdAt: '1512830000',
+┊   ┊213┊          type: 0,
+┊   ┊214┊          recipients: [
+┊   ┊215┊            {
+┊   ┊216┊              user: {
+┊   ┊217┊                id: '1',
+┊   ┊218┊                __typename: 'User',
+┊   ┊219┊              },
+┊   ┊220┊              message: {
+┊   ┊221┊                id: '147283729633',
+┊   ┊222┊                __typename: 'Message',
+┊   ┊223┊              },
+┊   ┊224┊              __typename: 'Recipient',
+┊   ┊225┊              receivedAt: null,
+┊   ┊226┊              readAt: null
+┊   ┊227┊            },
+┊   ┊228┊            {
+┊   ┊229┊              user: {
+┊   ┊230┊                id: '6',
+┊   ┊231┊                __typename: 'User',
+┊   ┊232┊              },
+┊   ┊233┊              message: {
+┊   ┊234┊                id: '147283729633',
+┊   ┊235┊                __typename: 'Message',
+┊   ┊236┊              },
+┊   ┊237┊              __typename: 'Recipient',
+┊   ┊238┊              receivedAt: null,
+┊   ┊239┊              readAt: null
+┊   ┊240┊            }
+┊   ┊241┊          ],
+┊   ┊242┊          ownership: false
+┊   ┊243┊        }
+┊   ┊244┊      ],
+┊   ┊245┊    },
+┊   ┊246┊  ];
+┊   ┊247┊
+┊   ┊248┊  beforeEach(() => {
+┊   ┊249┊    TestBed.configureTestingModule({
+┊   ┊250┊      imports: [
+┊   ┊251┊        HttpLinkModule,
+┊   ┊252┊        // HttpClientModule,
+┊   ┊253┊        HttpClientTestingModule,
+┊   ┊254┊      ],
+┊   ┊255┊      providers: [
+┊   ┊256┊        ChatsService,
+┊   ┊257┊        Apollo,
+┊   ┊258┊      ]
+┊   ┊259┊    });
+┊   ┊260┊
+┊   ┊261┊    httpMock = TestBed.get(HttpTestingController);
+┊   ┊262┊    httpLink = TestBed.get(HttpLink);
+┊   ┊263┊    apollo = TestBed.get(Apollo);
+┊   ┊264┊
+┊   ┊265┊    apollo.create({
+┊   ┊266┊      link: httpLink.create(<Options>{ uri: 'http://localhost:3000/graphql' }),
+┊   ┊267┊      cache: new InMemoryCache()
+┊   ┊268┊    });
+┊   ┊269┊  });
+┊   ┊270┊
+┊   ┊271┊  it('should be created', inject([ChatsService], (service: ChatsService) => {
+┊   ┊272┊    expect(service).toBeTruthy();
+┊   ┊273┊  }));
+┊   ┊274┊
+┊   ┊275┊  it('should get chats', inject([ChatsService], (service: ChatsService) => {
+┊   ┊276┊    service.getChats().chats$.subscribe(_chats => {
+┊   ┊277┊      expect(_chats.length).toEqual(chats.length);
+┊   ┊278┊      for (let i = 0; i < _chats.length; i++) {
+┊   ┊279┊        expect(_chats[i]).toEqual(chats[i]);
+┊   ┊280┊      }
+┊   ┊281┊    });
+┊   ┊282┊
+┊   ┊283┊    const req = httpMock.expectOne('http://localhost:3000/graphql', 'call to api');
+┊   ┊284┊    expect(req.request.method).toBe('POST');
+┊   ┊285┊    req.flush({
+┊   ┊286┊      data: {
+┊   ┊287┊        chats
+┊   ┊288┊      }
+┊   ┊289┊    });
+┊   ┊290┊    httpMock.verify();
+┊   ┊291┊  }));
+┊   ┊292┊});
```

[}]: #

# Chapter 8

We created a module which lists all of our chats, but we still need to show a particular chat.
Let's create the `chat-viewer` module! We're going to create a container component called `ChatComponent` and a couple of presentational components.

[{]: <helper> (diffStep "4.1")

#### Step 4.1: Chat Viewer

##### Changed src&#x2F;app&#x2F;app.module.ts
```diff
@@ -9,6 +9,7 @@
 ┊ 9┊ 9┊import {InMemoryCache} from 'apollo-cache-inmemory';
 ┊10┊10┊import {ChatsListerModule} from './chats-lister/chats-lister.module';
 ┊11┊11┊import {RouterModule, Routes} from '@angular/router';
+┊  ┊12┊import {ChatViewerModule} from './chat-viewer/chat-viewer.module';
 ┊12┊13┊
 ┊13┊14┊const routes: Routes = [
 ┊14┊15┊  {path: '', redirectTo: 'chats', pathMatch: 'full'},
```
```diff
@@ -28,6 +29,7 @@
 ┊28┊29┊    RouterModule.forRoot(routes),
 ┊29┊30┊    // Feature modules
 ┊30┊31┊    ChatsListerModule,
+┊  ┊32┊    ChatViewerModule,
 ┊31┊33┊  ],
 ┊32┊34┊  providers: [],
 ┊33┊35┊  bootstrap: [AppComponent]
```

##### Added src&#x2F;app&#x2F;chat-viewer&#x2F;chat-viewer.module.ts
```diff
@@ -0,0 +1,53 @@
+┊  ┊ 1┊import { BrowserModule } from '@angular/platform-browser';
+┊  ┊ 2┊import { NgModule } from '@angular/core';
+┊  ┊ 3┊
+┊  ┊ 4┊import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
+┊  ┊ 5┊import {MatButtonModule, MatGridListModule, MatIconModule, MatListModule, MatMenuModule, MatToolbarModule} from '@angular/material';
+┊  ┊ 6┊import {RouterModule, Routes} from '@angular/router';
+┊  ┊ 7┊import {FormsModule} from '@angular/forms';
+┊  ┊ 8┊import {ChatsService} from '../services/chats.service';
+┊  ┊ 9┊import {ChatComponent} from './containers/chat/chat.component';
+┊  ┊10┊import {MessagesListComponent} from './components/messages-list/messages-list.component';
+┊  ┊11┊import {MessageItemComponent} from './components/message-item/message-item.component';
+┊  ┊12┊import {NewMessageComponent} from './components/new-message/new-message.component';
+┊  ┊13┊import {SharedModule} from '../shared/shared.module';
+┊  ┊14┊
+┊  ┊15┊const routes: Routes = [
+┊  ┊16┊  {
+┊  ┊17┊    path: 'chat', children: [
+┊  ┊18┊      {path: ':id', component: ChatComponent},
+┊  ┊19┊    ],
+┊  ┊20┊  },
+┊  ┊21┊];
+┊  ┊22┊
+┊  ┊23┊@NgModule({
+┊  ┊24┊  declarations: [
+┊  ┊25┊    ChatComponent,
+┊  ┊26┊    MessagesListComponent,
+┊  ┊27┊    MessageItemComponent,
+┊  ┊28┊    NewMessageComponent,
+┊  ┊29┊  ],
+┊  ┊30┊  imports: [
+┊  ┊31┊    BrowserModule,
+┊  ┊32┊    // Material
+┊  ┊33┊    MatToolbarModule,
+┊  ┊34┊    MatMenuModule,
+┊  ┊35┊    MatIconModule,
+┊  ┊36┊    MatButtonModule,
+┊  ┊37┊    MatListModule,
+┊  ┊38┊    MatGridListModule,
+┊  ┊39┊    // Animations
+┊  ┊40┊    BrowserAnimationsModule,
+┊  ┊41┊    // Routing
+┊  ┊42┊    RouterModule.forChild(routes),
+┊  ┊43┊    // Forms
+┊  ┊44┊    FormsModule,
+┊  ┊45┊    // Feature modules
+┊  ┊46┊    SharedModule,
+┊  ┊47┊  ],
+┊  ┊48┊  providers: [
+┊  ┊49┊    ChatsService,
+┊  ┊50┊  ],
+┊  ┊51┊})
+┊  ┊52┊export class ChatViewerModule {
+┊  ┊53┊}
```

##### Added src&#x2F;app&#x2F;chat-viewer&#x2F;components&#x2F;message-item&#x2F;message-item.component.scss
```diff
@@ -0,0 +1,18 @@
+┊  ┊ 1┊:host {
+┊  ┊ 2┊  display: flex;
+┊  ┊ 3┊  width: 100%;
+┊  ┊ 4┊}
+┊  ┊ 5┊
+┊  ┊ 6┊.message {
+┊  ┊ 7┊  max-width: 75%;
+┊  ┊ 8┊  background-color: lightgoldenrodyellow;
+┊  ┊ 9┊
+┊  ┊10┊  &.mine {
+┊  ┊11┊    background-color: lightcyan;
+┊  ┊12┊    margin-left: auto;
+┊  ┊13┊  }
+┊  ┊14┊
+┊  ┊15┊  .message-sender {
+┊  ┊16┊    font-size: small;
+┊  ┊17┊  }
+┊  ┊18┊}
```

##### Added src&#x2F;app&#x2F;chat-viewer&#x2F;components&#x2F;message-item&#x2F;message-item.component.ts
```diff
@@ -0,0 +1,21 @@
+┊  ┊ 1┊import {Component, Input} from '@angular/core';
+┊  ┊ 2┊
+┊  ┊ 3┊@Component({
+┊  ┊ 4┊  selector: 'app-message-item',
+┊  ┊ 5┊  template: `
+┊  ┊ 6┊    <div class="message"
+┊  ┊ 7┊         [ngClass]="{'mine': message.ownership}">
+┊  ┊ 8┊      <div *ngIf="isGroup && !message.ownership" class="message-sender">{{ message.sender.name }}</div>
+┊  ┊ 9┊      <div>{{ message.content }}</div>
+┊  ┊10┊    </div>
+┊  ┊11┊  `,
+┊  ┊12┊  styleUrls: ['message-item.component.scss'],
+┊  ┊13┊})
+┊  ┊14┊export class MessageItemComponent {
+┊  ┊15┊  // tslint:disable-next-line:no-input-rename
+┊  ┊16┊  @Input('item')
+┊  ┊17┊  message: any;
+┊  ┊18┊
+┊  ┊19┊  @Input()
+┊  ┊20┊  isGroup: boolean;
+┊  ┊21┊}
```

##### Added src&#x2F;app&#x2F;chat-viewer&#x2F;components&#x2F;messages-list&#x2F;messages-list.component.scss
```diff
@@ -0,0 +1,12 @@
+┊  ┊ 1┊:host {
+┊  ┊ 2┊  display: block;
+┊  ┊ 3┊  height: 100%;
+┊  ┊ 4┊  overflow-y: scroll;
+┊  ┊ 5┊  background-color: aliceblue;
+┊  ┊ 6┊}
+┊  ┊ 7┊
+┊  ┊ 8┊/*
+┊  ┊ 9┊:host::-webkit-scrollbar {
+┊  ┊10┊  display: none;
+┊  ┊11┊}
+┊  ┊12┊*/
```

##### Added src&#x2F;app&#x2F;chat-viewer&#x2F;components&#x2F;messages-list&#x2F;messages-list.component.ts
```diff
@@ -0,0 +1,23 @@
+┊  ┊ 1┊import {Component, Input} from '@angular/core';
+┊  ┊ 2┊
+┊  ┊ 3┊@Component({
+┊  ┊ 4┊  selector: 'app-messages-list',
+┊  ┊ 5┊  template: `
+┊  ┊ 6┊    <mat-list>
+┊  ┊ 7┊      <mat-list-item *ngFor="let message of messages">
+┊  ┊ 8┊        <app-message-item [item]="message" [isGroup]="isGroup"></app-message-item>
+┊  ┊ 9┊      </mat-list-item>
+┊  ┊10┊    </mat-list>
+┊  ┊11┊  `,
+┊  ┊12┊  styleUrls: ['messages-list.component.scss'],
+┊  ┊13┊})
+┊  ┊14┊export class MessagesListComponent {
+┊  ┊15┊  // tslint:disable-next-line:no-input-rename
+┊  ┊16┊  @Input('items')
+┊  ┊17┊  messages: any[];
+┊  ┊18┊
+┊  ┊19┊  @Input()
+┊  ┊20┊  isGroup: boolean;
+┊  ┊21┊
+┊  ┊22┊  constructor() {}
+┊  ┊23┊}
```

##### Added src&#x2F;app&#x2F;chat-viewer&#x2F;components&#x2F;new-message&#x2F;new-message.component.scss
```diff
@@ -0,0 +1,13 @@
+┊  ┊ 1┊:host {
+┊  ┊ 2┊  display: flex;
+┊  ┊ 3┊  height: 8vh;
+┊  ┊ 4┊}
+┊  ┊ 5┊
+┊  ┊ 6┊input {
+┊  ┊ 7┊  width: 100%;
+┊  ┊ 8┊}
+┊  ┊ 9┊
+┊  ┊10┊button {
+┊  ┊11┊  width: 8vh;
+┊  ┊12┊  min-width: 56px;
+┊  ┊13┊}
```

##### Added src&#x2F;app&#x2F;chat-viewer&#x2F;components&#x2F;new-message&#x2F;new-message.component.ts
```diff
@@ -0,0 +1,34 @@
+┊  ┊ 1┊import {Component, EventEmitter, Input, Output} from '@angular/core';
+┊  ┊ 2┊
+┊  ┊ 3┊@Component({
+┊  ┊ 4┊  selector: 'app-new-message',
+┊  ┊ 5┊  template: `
+┊  ┊ 6┊    <input type="text" [(ngModel)]="message" (keyup)="onInputKeyup($event)"/>
+┊  ┊ 7┊    <button mat-button (click)="emitMessage()" [disabled]="disabled">
+┊  ┊ 8┊      <mat-icon aria-label="Icon-button with a send icon">send</mat-icon>
+┊  ┊ 9┊    </button>
+┊  ┊10┊  `,
+┊  ┊11┊  styleUrls: ['new-message.component.scss'],
+┊  ┊12┊})
+┊  ┊13┊export class NewMessageComponent {
+┊  ┊14┊  @Input()
+┊  ┊15┊  disabled: boolean;
+┊  ┊16┊
+┊  ┊17┊  @Output()
+┊  ┊18┊  newMessage = new EventEmitter<string>();
+┊  ┊19┊
+┊  ┊20┊  message = '';
+┊  ┊21┊
+┊  ┊22┊  onInputKeyup({ keyCode }: KeyboardEvent) {
+┊  ┊23┊    if (keyCode === 13) {
+┊  ┊24┊      this.emitMessage();
+┊  ┊25┊    }
+┊  ┊26┊  }
+┊  ┊27┊
+┊  ┊28┊  emitMessage() {
+┊  ┊29┊    if (this.message && !this.disabled) {
+┊  ┊30┊      this.newMessage.emit(this.message);
+┊  ┊31┊      this.message = '';
+┊  ┊32┊    }
+┊  ┊33┊  }
+┊  ┊34┊}
```

##### Added src&#x2F;app&#x2F;chat-viewer&#x2F;containers&#x2F;chat&#x2F;chat.component.scss
```diff
@@ -0,0 +1,10 @@
+┊  ┊ 1┊.container {
+┊  ┊ 2┊  display: flex;
+┊  ┊ 3┊  flex-flow: column;
+┊  ┊ 4┊  justify-content: space-between;
+┊  ┊ 5┊  height: calc(100vh - 8vh);
+┊  ┊ 6┊
+┊  ┊ 7┊  app-confirm-selection {
+┊  ┊ 8┊    bottom: 10vh;
+┊  ┊ 9┊  }
+┊  ┊10┊}
```

##### Added src&#x2F;app&#x2F;chat-viewer&#x2F;containers&#x2F;chat&#x2F;chat.component.ts
```diff
@@ -0,0 +1,45 @@
+┊  ┊ 1┊import {Component, OnInit} from '@angular/core';
+┊  ┊ 2┊import {ActivatedRoute, Router} from '@angular/router';
+┊  ┊ 3┊import {ChatsService} from '../../../services/chats.service';
+┊  ┊ 4┊
+┊  ┊ 5┊@Component({
+┊  ┊ 6┊  template: `
+┊  ┊ 7┊    <app-toolbar>
+┊  ┊ 8┊      <button class="navigation" mat-button (click)="goToChats()">
+┊  ┊ 9┊        <mat-icon aria-label="Icon-button with an arrow back icon">arrow_back</mat-icon>
+┊  ┊10┊      </button>
+┊  ┊11┊      <div class="title">{{ name }}</div>
+┊  ┊12┊    </app-toolbar>
+┊  ┊13┊    <div class="container">
+┊  ┊14┊      <app-messages-list [items]="messages" [isGroup]="isGroup"></app-messages-list>
+┊  ┊15┊      <app-new-message></app-new-message>
+┊  ┊16┊    </div>
+┊  ┊17┊  `,
+┊  ┊18┊  styleUrls: ['./chat.component.scss']
+┊  ┊19┊})
+┊  ┊20┊export class ChatComponent implements OnInit {
+┊  ┊21┊  chatId: string;
+┊  ┊22┊  messages: any[];
+┊  ┊23┊  name: string;
+┊  ┊24┊  isGroup: boolean;
+┊  ┊25┊
+┊  ┊26┊  constructor(private route: ActivatedRoute,
+┊  ┊27┊              private router: Router,
+┊  ┊28┊              private chatsService: ChatsService) {
+┊  ┊29┊  }
+┊  ┊30┊
+┊  ┊31┊  ngOnInit() {
+┊  ┊32┊    this.route.params.subscribe(({id: chatId}) => {
+┊  ┊33┊      this.chatId = chatId;
+┊  ┊34┊      this.chatsService.getChat(chatId).chat$.subscribe(chat => {
+┊  ┊35┊        this.messages = chat.messages;
+┊  ┊36┊        this.name = chat.name;
+┊  ┊37┊        this.isGroup = chat.isGroup;
+┊  ┊38┊      });
+┊  ┊39┊    });
+┊  ┊40┊  }
+┊  ┊41┊
+┊  ┊42┊  goToChats() {
+┊  ┊43┊    this.router.navigate(['/chats']);
+┊  ┊44┊  }
+┊  ┊45┊}
```

##### Changed src&#x2F;app&#x2F;chats-lister&#x2F;components&#x2F;chat-item&#x2F;chat-item.component.ts
```diff
@@ -1,11 +1,11 @@
-┊ 1┊  ┊import {Component, Input} from '@angular/core';
+┊  ┊ 1┊import {Component, EventEmitter, Input, Output} from '@angular/core';
 ┊ 2┊ 2┊import {GetChats} from '../../../../types';
 ┊ 3┊ 3┊
 ┊ 4┊ 4┊@Component({
 ┊ 5┊ 5┊  selector: 'app-chat-item',
 ┊ 6┊ 6┊  template: `
 ┊ 7┊ 7┊    <div class="chat-row">
-┊ 8┊  ┊        <div class="chat-recipient">
+┊  ┊ 8┊        <div class="chat-recipient" (click)="selectChat()">
 ┊ 9┊ 9┊          <img *ngIf="chat.picture" [src]="chat.picture" width="48" height="48">
 ┊10┊10┊          <div>{{ chat.name }} [id: {{ chat.id }}]</div>
 ┊11┊11┊        </div>
```
```diff
@@ -18,4 +18,11 @@
 ┊18┊18┊  // tslint:disable-next-line:no-input-rename
 ┊19┊19┊  @Input('item')
 ┊20┊20┊  chat: GetChats.Chats;
+┊  ┊21┊
+┊  ┊22┊  @Output()
+┊  ┊23┊  select = new EventEmitter<string>();
+┊  ┊24┊
+┊  ┊25┊  selectChat() {
+┊  ┊26┊    this.select.emit(this.chat.id);
+┊  ┊27┊  }
 ┊21┊28┊}
```

##### Changed src&#x2F;app&#x2F;chats-lister&#x2F;components&#x2F;chats-list&#x2F;chats-list.component.ts
```diff
@@ -1,4 +1,4 @@
-┊1┊ ┊import {Component, Input} from '@angular/core';
+┊ ┊1┊import {Component, EventEmitter, Input, Output} from '@angular/core';
 ┊2┊2┊import {GetChats} from '../../../../types';
 ┊3┊3┊
 ┊4┊4┊@Component({
```
```diff
@@ -6,7 +6,7 @@
 ┊ 6┊ 6┊  template: `
 ┊ 7┊ 7┊    <mat-list>
 ┊ 8┊ 8┊      <mat-list-item *ngFor="let chat of chats">
-┊ 9┊  ┊        <app-chat-item [item]="chat"></app-chat-item>
+┊  ┊ 9┊        <app-chat-item [item]="chat" (select)="selectChat($event)"></app-chat-item>
 ┊10┊10┊      </mat-list-item>
 ┊11┊11┊    </mat-list>
 ┊12┊12┊  `,
```
```diff
@@ -17,5 +17,12 @@
 ┊17┊17┊  @Input('items')
 ┊18┊18┊  chats: GetChats.Chats[];
 ┊19┊19┊
+┊  ┊20┊  @Output()
+┊  ┊21┊  select = new EventEmitter<string>();
+┊  ┊22┊
 ┊20┊23┊  constructor() {}
+┊  ┊24┊
+┊  ┊25┊  selectChat(id: string) {
+┊  ┊26┊    this.select.emit(id);
+┊  ┊27┊  }
 ┊21┊28┊}
```

##### Changed src&#x2F;app&#x2F;chats-lister&#x2F;containers&#x2F;chats&#x2F;chats.component.ts
```diff
@@ -2,6 +2,7 @@
 ┊2┊2┊import {ChatsService} from '../../../services/chats.service';
 ┊3┊3┊import {Observable} from 'rxjs/Observable';
 ┊4┊4┊import {GetChats} from '../../../../types';
+┊ ┊5┊import {Router} from '@angular/router';
 ┊5┊6┊
 ┊6┊7┊@Component({
 ┊7┊8┊  template: `
```
```diff
@@ -27,7 +28,7 @@
 ┊27┊28┊      </button>
 ┊28┊29┊    </mat-menu>
 ┊29┊30┊
-┊30┊  ┊    <app-chats-list [items]="chats$ | async"></app-chats-list>
+┊  ┊31┊    <app-chats-list [items]="chats$ | async" (select)="goToChat($event)"></app-chats-list>
 ┊31┊32┊
 ┊32┊33┊    <button class="chat-button" mat-fab color="primary">
 ┊33┊34┊      <mat-icon aria-label="Icon-button with a + icon">add</mat-icon>
```
```diff
@@ -38,10 +39,15 @@
 ┊38┊39┊export class ChatsComponent implements OnInit {
 ┊39┊40┊  chats$: Observable<GetChats.Chats[]>;
 ┊40┊41┊
-┊41┊  ┊  constructor(private chatsService: ChatsService) {
+┊  ┊42┊  constructor(private chatsService: ChatsService,
+┊  ┊43┊              private router: Router) {
 ┊42┊44┊  }
 ┊43┊45┊
 ┊44┊46┊  ngOnInit() {
 ┊45┊47┊    this.chats$ = this.chatsService.getChats().chats$;
 ┊46┊48┊  }
+┊  ┊49┊
+┊  ┊50┊  goToChat(chatId: string) {
+┊  ┊51┊    this.router.navigate(['/chat', chatId]);
+┊  ┊52┊  }
 ┊47┊53┊}
```

##### Changed src&#x2F;app&#x2F;services&#x2F;chats.service.ts
```diff
@@ -4,6 +4,7 @@
 ┊ 4┊ 4┊import {Injectable} from '@angular/core';
 ┊ 5┊ 5┊import {getChatsQuery} from '../../graphql/getChats.query';
 ┊ 6┊ 6┊import {GetChats} from '../../types';
+┊  ┊ 7┊import {getChatQuery} from '../../graphql/getChat.query';
 ┊ 7┊ 8┊
 ┊ 8┊ 9┊@Injectable()
 ┊ 9┊10┊export class ChatsService {
```
```diff
@@ -24,4 +25,19 @@
 ┊24┊25┊
 ┊25┊26┊    return {query, chats$};
 ┊26┊27┊  }
+┊  ┊28┊
+┊  ┊29┊  getChat(chatId: string) {
+┊  ┊30┊    const query = this.apollo.watchQuery<any>({
+┊  ┊31┊      query: getChatQuery,
+┊  ┊32┊      variables: {
+┊  ┊33┊        chatId: chatId,
+┊  ┊34┊      }
+┊  ┊35┊    });
+┊  ┊36┊
+┊  ┊37┊    const chat$ = query.valueChanges.pipe(
+┊  ┊38┊      map((result: ApolloQueryResult<any>) => result.data.chat)
+┊  ┊39┊    );
+┊  ┊40┊
+┊  ┊41┊    return {query, chat$};
+┊  ┊42┊  }
 ┊27┊43┊}
```

##### Added src&#x2F;graphql&#x2F;getChat.query.ts
```diff
@@ -0,0 +1,17 @@
+┊  ┊ 1┊import gql from 'graphql-tag';
+┊  ┊ 2┊import {fragments} from './fragment';
+┊  ┊ 3┊
+┊  ┊ 4┊// We use the gql tag to parse our query string into a query document
+┊  ┊ 5┊export const getChatQuery = gql`
+┊  ┊ 6┊  query GetChat($chatId: ID!) {
+┊  ┊ 7┊    chat(chatId: $chatId) {
+┊  ┊ 8┊      ...ChatWithoutMessages
+┊  ┊ 9┊      messages {
+┊  ┊10┊        ...Message
+┊  ┊11┊      }
+┊  ┊12┊    }
+┊  ┊13┊  }
+┊  ┊14┊
+┊  ┊15┊  ${fragments['chatWithoutMessages']}
+┊  ┊16┊  ${fragments['message']}
+┊  ┊17┊`;
```

[}]: #

It's time to generate our types and use them:

    $ npm run generator

[{]: <helper> (diffStep "4.2" files="^\(?!src/types.d.ts$\).*")

#### Step 4.2: Add generated types

##### Changed src&#x2F;app&#x2F;chat-viewer&#x2F;components&#x2F;message-item&#x2F;message-item.component.ts
```diff
@@ -1,4 +1,5 @@
 ┊1┊1┊import {Component, Input} from '@angular/core';
+┊ ┊2┊import {GetChat} from '../../../../types';
 ┊2┊3┊
 ┊3┊4┊@Component({
 ┊4┊5┊  selector: 'app-message-item',
```
```diff
@@ -14,7 +15,7 @@
 ┊14┊15┊export class MessageItemComponent {
 ┊15┊16┊  // tslint:disable-next-line:no-input-rename
 ┊16┊17┊  @Input('item')
-┊17┊  ┊  message: any;
+┊  ┊18┊  message: GetChat.Messages;
 ┊18┊19┊
 ┊19┊20┊  @Input()
 ┊20┊21┊  isGroup: boolean;
```

##### Changed src&#x2F;app&#x2F;chat-viewer&#x2F;components&#x2F;messages-list&#x2F;messages-list.component.ts
```diff
@@ -1,4 +1,5 @@
 ┊1┊1┊import {Component, Input} from '@angular/core';
+┊ ┊2┊import {GetChat} from '../../../../types';
 ┊2┊3┊
 ┊3┊4┊@Component({
 ┊4┊5┊  selector: 'app-messages-list',
```
```diff
@@ -14,7 +15,7 @@
 ┊14┊15┊export class MessagesListComponent {
 ┊15┊16┊  // tslint:disable-next-line:no-input-rename
 ┊16┊17┊  @Input('items')
-┊17┊  ┊  messages: any[];
+┊  ┊18┊  messages: GetChat.Messages[];
 ┊18┊19┊
 ┊19┊20┊  @Input()
 ┊20┊21┊  isGroup: boolean;
```

##### Changed src&#x2F;app&#x2F;chat-viewer&#x2F;containers&#x2F;chat&#x2F;chat.component.ts
```diff
@@ -1,6 +1,7 @@
 ┊1┊1┊import {Component, OnInit} from '@angular/core';
 ┊2┊2┊import {ActivatedRoute, Router} from '@angular/router';
 ┊3┊3┊import {ChatsService} from '../../../services/chats.service';
+┊ ┊4┊import {GetChat} from '../../../../types';
 ┊4┊5┊
 ┊5┊6┊@Component({
 ┊6┊7┊  template: `
```
```diff
@@ -19,7 +20,7 @@
 ┊19┊20┊})
 ┊20┊21┊export class ChatComponent implements OnInit {
 ┊21┊22┊  chatId: string;
-┊22┊  ┊  messages: any[];
+┊  ┊23┊  messages: GetChat.Messages[];
 ┊23┊24┊  name: string;
 ┊24┊25┊  isGroup: boolean;
 ┊25┊26┊
```

##### Changed src&#x2F;app&#x2F;services&#x2F;chats.service.ts
```diff
@@ -3,7 +3,7 @@
 ┊3┊3┊import {Apollo} from 'apollo-angular';
 ┊4┊4┊import {Injectable} from '@angular/core';
 ┊5┊5┊import {getChatsQuery} from '../../graphql/getChats.query';
-┊6┊ ┊import {GetChats} from '../../types';
+┊ ┊6┊import {GetChat, GetChats} from '../../types';
 ┊7┊7┊import {getChatQuery} from '../../graphql/getChat.query';
 ┊8┊8┊
 ┊9┊9┊@Injectable()
```
```diff
@@ -27,7 +27,7 @@
 ┊27┊27┊  }
 ┊28┊28┊
 ┊29┊29┊  getChat(chatId: string) {
-┊30┊  ┊    const query = this.apollo.watchQuery<any>({
+┊  ┊30┊    const query = this.apollo.watchQuery<GetChat.Query>({
 ┊31┊31┊      query: getChatQuery,
 ┊32┊32┊      variables: {
 ┊33┊33┊        chatId: chatId,
```
```diff
@@ -35,7 +35,7 @@
 ┊35┊35┊    });
 ┊36┊36┊
 ┊37┊37┊    const chat$ = query.valueChanges.pipe(
-┊38┊  ┊      map((result: ApolloQueryResult<any>) => result.data.chat)
+┊  ┊38┊      map((result: ApolloQueryResult<GetChat.Query>) => result.data.chat)
 ┊39┊39┊    );
 ┊40┊40┊
 ┊41┊41┊    return {query, chat$};
```

[}]: #

[{]: <helper> (diffStep "4.3")

#### Step 4.3: Testing

##### Added src&#x2F;app&#x2F;chat-viewer&#x2F;containers&#x2F;chat&#x2F;chat.component.spec.ts
```diff
@@ -0,0 +1,151 @@
+┊   ┊  1┊import { async, ComponentFixture, TestBed } from '@angular/core/testing';
+┊   ┊  2┊
+┊   ┊  3┊import { ChatComponent } from './chat.component';
+┊   ┊  4┊import {DebugElement, NO_ERRORS_SCHEMA} from '@angular/core';
+┊   ┊  5┊import {MatButtonModule, MatGridListModule, MatIconModule, MatListModule, MatMenuModule, MatToolbarModule} from '@angular/material';
+┊   ┊  6┊import {ChatsService} from '../../../services/chats.service';
+┊   ┊  7┊import {Apollo} from 'apollo-angular';
+┊   ┊  8┊import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
+┊   ┊  9┊import {HttpLink, HttpLinkModule, Options} from 'apollo-angular-link-http';
+┊   ┊ 10┊import {InMemoryCache} from 'apollo-cache-inmemory';
+┊   ┊ 11┊import {RouterTestingModule} from '@angular/router/testing';
+┊   ┊ 12┊import {ActivatedRoute} from '@angular/router';
+┊   ┊ 13┊import {of} from 'rxjs/observable/of';
+┊   ┊ 14┊import {By} from '@angular/platform-browser';
+┊   ┊ 15┊import {FormsModule} from '@angular/forms';
+┊   ┊ 16┊import {SharedModule} from '../../../shared/shared.module';
+┊   ┊ 17┊import {NewMessageComponent} from '../../components/new-message/new-message.component';
+┊   ┊ 18┊import {MessagesListComponent} from '../../components/messages-list/messages-list.component';
+┊   ┊ 19┊import {MessageItemComponent} from '../../components/message-item/message-item.component';
+┊   ┊ 20┊
+┊   ┊ 21┊describe('ChatComponent', () => {
+┊   ┊ 22┊  let component: ChatComponent;
+┊   ┊ 23┊  let fixture: ComponentFixture<ChatComponent>;
+┊   ┊ 24┊  let el: DebugElement;
+┊   ┊ 25┊
+┊   ┊ 26┊  let httpMock: HttpTestingController;
+┊   ┊ 27┊  let httpLink: HttpLink;
+┊   ┊ 28┊  let apollo: Apollo;
+┊   ┊ 29┊
+┊   ┊ 30┊  const chat: any = {
+┊   ┊ 31┊    id: '1',
+┊   ┊ 32┊    __typename: 'Chat',
+┊   ┊ 33┊    name: 'Avery Stewart',
+┊   ┊ 34┊    picture: 'https://randomuser.me/api/portraits/thumb/women/1.jpg',
+┊   ┊ 35┊    allTimeMembers: [
+┊   ┊ 36┊      {
+┊   ┊ 37┊        id: '1',
+┊   ┊ 38┊        __typename: 'User',
+┊   ┊ 39┊      },
+┊   ┊ 40┊      {
+┊   ┊ 41┊        id: '3',
+┊   ┊ 42┊        __typename: 'User',
+┊   ┊ 43┊      }
+┊   ┊ 44┊    ],
+┊   ┊ 45┊    unreadMessages: 1,
+┊   ┊ 46┊    isGroup: false,
+┊   ┊ 47┊    messages: [
+┊   ┊ 48┊      {
+┊   ┊ 49┊        id: '708323562255',
+┊   ┊ 50┊        __typename: 'Message',
+┊   ┊ 51┊        sender: {
+┊   ┊ 52┊          id: '3',
+┊   ┊ 53┊          __typename: 'User',
+┊   ┊ 54┊          name: 'Avery Stewart'
+┊   ┊ 55┊        },
+┊   ┊ 56┊        content: 'Yep!',
+┊   ┊ 57┊        createdAt: '1514035700',
+┊   ┊ 58┊        type: 0,
+┊   ┊ 59┊        recipients: [
+┊   ┊ 60┊          {
+┊   ┊ 61┊            user: {
+┊   ┊ 62┊              id: '1',
+┊   ┊ 63┊              __typename: 'User',
+┊   ┊ 64┊            },
+┊   ┊ 65┊            message: {
+┊   ┊ 66┊              id: '708323562255',
+┊   ┊ 67┊              __typename: 'Message',
+┊   ┊ 68┊            },
+┊   ┊ 69┊            __typename: 'Recipient',
+┊   ┊ 70┊            receivedAt: null,
+┊   ┊ 71┊            readAt: null
+┊   ┊ 72┊          }
+┊   ┊ 73┊        ],
+┊   ┊ 74┊        ownership: false
+┊   ┊ 75┊      }
+┊   ┊ 76┊    ],
+┊   ┊ 77┊  };
+┊   ┊ 78┊
+┊   ┊ 79┊  beforeEach(async(() => {
+┊   ┊ 80┊    TestBed.configureTestingModule({
+┊   ┊ 81┊      declarations: [
+┊   ┊ 82┊        ChatComponent,
+┊   ┊ 83┊        MessagesListComponent,
+┊   ┊ 84┊        MessageItemComponent,
+┊   ┊ 85┊        NewMessageComponent,
+┊   ┊ 86┊      ],
+┊   ┊ 87┊      imports: [
+┊   ┊ 88┊        MatToolbarModule,
+┊   ┊ 89┊        MatMenuModule,
+┊   ┊ 90┊        MatIconModule,
+┊   ┊ 91┊        MatButtonModule,
+┊   ┊ 92┊        MatListModule,
+┊   ┊ 93┊        MatGridListModule,
+┊   ┊ 94┊        FormsModule,
+┊   ┊ 95┊        SharedModule,
+┊   ┊ 96┊        HttpLinkModule,
+┊   ┊ 97┊        HttpClientTestingModule,
+┊   ┊ 98┊        RouterTestingModule
+┊   ┊ 99┊      ],
+┊   ┊100┊      providers: [
+┊   ┊101┊        ChatsService,
+┊   ┊102┊        Apollo,
+┊   ┊103┊        {
+┊   ┊104┊          provide: ActivatedRoute,
+┊   ┊105┊          useValue: { params: of({ id: chat.id }) }
+┊   ┊106┊        }
+┊   ┊107┊      ],
+┊   ┊108┊      schemas: [NO_ERRORS_SCHEMA]
+┊   ┊109┊    })
+┊   ┊110┊      .compileComponents();
+┊   ┊111┊
+┊   ┊112┊    httpMock = TestBed.get(HttpTestingController);
+┊   ┊113┊    httpLink = TestBed.get(HttpLink);
+┊   ┊114┊    apollo = TestBed.get(Apollo);
+┊   ┊115┊
+┊   ┊116┊    apollo.create({
+┊   ┊117┊      link: httpLink.create(<Options>{ uri: 'http://localhost:3000/graphql' }),
+┊   ┊118┊      cache: new InMemoryCache()
+┊   ┊119┊    });
+┊   ┊120┊  }));
+┊   ┊121┊
+┊   ┊122┊  beforeEach(() => {
+┊   ┊123┊    fixture = TestBed.createComponent(ChatComponent);
+┊   ┊124┊    component = fixture.componentInstance;
+┊   ┊125┊    fixture.detectChanges();
+┊   ┊126┊    const req = httpMock.expectOne('http://localhost:3000/graphql', 'call to api');
+┊   ┊127┊    req.flush({
+┊   ┊128┊      data: {
+┊   ┊129┊        chat
+┊   ┊130┊      }
+┊   ┊131┊    });
+┊   ┊132┊  });
+┊   ┊133┊
+┊   ┊134┊  it('should create', () => {
+┊   ┊135┊    expect(component).toBeTruthy();
+┊   ┊136┊  });
+┊   ┊137┊
+┊   ┊138┊  it('should display the chat', () => {
+┊   ┊139┊    fixture.whenStable().then(() => {
+┊   ┊140┊      fixture.detectChanges();
+┊   ┊141┊      el = fixture.debugElement;
+┊   ┊142┊      expect(el.query(By.css(`app-toolbar > mat-toolbar > div > div`)).nativeElement.textContent).toContain(chat.name);
+┊   ┊143┊      for (let i = 0; i < chat.messages.length; i++) {
+┊   ┊144┊        expect(el.query(By.css(`app-messages-list > mat-list > mat-list-item:nth-child(${i + 1}) > div > app-message-item > div`))
+┊   ┊145┊          .nativeElement.textContent).toContain(chat.messages[i].content);
+┊   ┊146┊      }
+┊   ┊147┊    });
+┊   ┊148┊
+┊   ┊149┊    httpMock.verify();
+┊   ┊150┊  });
+┊   ┊151┊});
```

[}]: #

# Chapter 9

In the client, let's start by wiring the addMessage mutation. We're going to write the GraphQL query and then use the generator to generate the types:

[{]: <helper> (diffStep "5.1" files="^\(?!src/types.d.ts$\).*")

#### Step 5.1: Create addMessage mutation and generate types

##### Added src&#x2F;graphql&#x2F;addMessage.mutation.ts
```diff
@@ -0,0 +1,13 @@
+┊  ┊ 1┊import gql from 'graphql-tag';
+┊  ┊ 2┊import {fragments} from './fragment';
+┊  ┊ 3┊
+┊  ┊ 4┊// We use the gql tag to parse our query string into a query document
+┊  ┊ 5┊export const addMessageMutation = gql`
+┊  ┊ 6┊  mutation AddMessage($chatId: ID!, $content: String!) {
+┊  ┊ 7┊    addMessage(chatId: $chatId, content: $content) {
+┊  ┊ 8┊      ...Message
+┊  ┊ 9┊    }
+┊  ┊10┊  }
+┊  ┊11┊
+┊  ┊12┊  ${fragments['message']}
+┊  ┊13┊`;
```

[}]: #

    $ npm run generator

Now let's use the just-created query:

[{]: <helper> (diffStep "5.2")

#### Step 5.2: Modify chat component and service

##### Changed src&#x2F;app&#x2F;chat-viewer&#x2F;containers&#x2F;chat&#x2F;chat.component.ts
```diff
@@ -13,7 +13,7 @@
 ┊13┊13┊    </app-toolbar>
 ┊14┊14┊    <div class="container">
 ┊15┊15┊      <app-messages-list [items]="messages" [isGroup]="isGroup"></app-messages-list>
-┊16┊  ┊      <app-new-message></app-new-message>
+┊  ┊16┊      <app-new-message (newMessage)="addMessage($event)"></app-new-message>
 ┊17┊17┊    </div>
 ┊18┊18┊  `,
 ┊19┊19┊  styleUrls: ['./chat.component.scss']
```
```diff
@@ -43,4 +43,8 @@
 ┊43┊43┊  goToChats() {
 ┊44┊44┊    this.router.navigate(['/chats']);
 ┊45┊45┊  }
+┊  ┊46┊
+┊  ┊47┊  addMessage(content: string) {
+┊  ┊48┊    this.chatsService.addMessage(this.chatId, content).subscribe();
+┊  ┊49┊  }
 ┊46┊50┊}
```

##### Changed src&#x2F;app&#x2F;services&#x2F;chats.service.ts
```diff
@@ -3,8 +3,9 @@
 ┊ 3┊ 3┊import {Apollo} from 'apollo-angular';
 ┊ 4┊ 4┊import {Injectable} from '@angular/core';
 ┊ 5┊ 5┊import {getChatsQuery} from '../../graphql/getChats.query';
-┊ 6┊  ┊import {GetChat, GetChats} from '../../types';
+┊  ┊ 6┊import {AddMessage, GetChat, GetChats} from '../../types';
 ┊ 7┊ 7┊import {getChatQuery} from '../../graphql/getChat.query';
+┊  ┊ 8┊import {addMessageMutation} from '../../graphql/addMessage.mutation';
 ┊ 8┊ 9┊
 ┊ 9┊10┊@Injectable()
 ┊10┊11┊export class ChatsService {
```
```diff
@@ -40,4 +41,14 @@
 ┊40┊41┊
 ┊41┊42┊    return {query, chat$};
 ┊42┊43┊  }
+┊  ┊44┊
+┊  ┊45┊  addMessage(chatId: string, content: string) {
+┊  ┊46┊    return this.apollo.mutate({
+┊  ┊47┊      mutation: addMessageMutation,
+┊  ┊48┊      variables: <AddMessage.Variables>{
+┊  ┊49┊        chatId,
+┊  ┊50┊        content,
+┊  ┊51┊      },
+┊  ┊52┊    });
+┊  ┊53┊  }
 ┊43┊54┊}
```

[}]: #

# Chapter 10

Did you notice that after creating a new message you'll have to refresh the page in order to see it?
How to fix that? If you thought about re-querying the server you would be wrong! The best solution is to use the response provided by the server to update our Apollo local cache:

[{]: <helper> (diffStep "6.1")

#### Step 6.1: Update the store

##### Changed src&#x2F;app&#x2F;services&#x2F;chats.service.ts
```diff
@@ -1,4 +1,4 @@
-┊1┊ ┊import {ApolloQueryResult, WatchQueryOptions} from 'apollo-client';
+┊ ┊1┊import {ApolloQueryResult, MutationOptions, WatchQueryOptions} from 'apollo-client';
 ┊2┊2┊import {map} from 'rxjs/operators';
 ┊3┊3┊import {Apollo} from 'apollo-angular';
 ┊4┊4┊import {Injectable} from '@angular/core';
```
```diff
@@ -43,12 +43,49 @@
 ┊43┊43┊  }
 ┊44┊44┊
 ┊45┊45┊  addMessage(chatId: string, content: string) {
-┊46┊  ┊    return this.apollo.mutate({
+┊  ┊46┊    return this.apollo.mutate(<MutationOptions>{
 ┊47┊47┊      mutation: addMessageMutation,
 ┊48┊48┊      variables: <AddMessage.Variables>{
 ┊49┊49┊        chatId,
 ┊50┊50┊        content,
 ┊51┊51┊      },
+┊  ┊52┊      update: (store, { data: { addMessage } }: {data: AddMessage.Mutation}) => {
+┊  ┊53┊        // Update the messages cache
+┊  ┊54┊        {
+┊  ┊55┊          // Read the data from our cache for this query.
+┊  ┊56┊          const {chat}: GetChat.Query = store.readQuery({
+┊  ┊57┊            query: getChatQuery, variables: {
+┊  ┊58┊              chatId,
+┊  ┊59┊            }
+┊  ┊60┊          });
+┊  ┊61┊          // Add our message from the mutation to the end.
+┊  ┊62┊          chat.messages.push(addMessage);
+┊  ┊63┊          // Write our data back to the cache.
+┊  ┊64┊          store.writeQuery({ query: getChatQuery, data: {chat} });
+┊  ┊65┊        }
+┊  ┊66┊        // Update last message cache
+┊  ┊67┊        {
+┊  ┊68┊          // Read the data from our cache for this query.
+┊  ┊69┊          const {chats}: GetChats.Query = store.readQuery({
+┊  ┊70┊            query: getChatsQuery,
+┊  ┊71┊            variables: <GetChats.Variables>{
+┊  ┊72┊              amount: this.messagesAmount,
+┊  ┊73┊            },
+┊  ┊74┊          });
+┊  ┊75┊          // Add our comment from the mutation to the end.
+┊  ┊76┊          chats.find(chat => chat.id === chatId).messages.push(addMessage);
+┊  ┊77┊          // Write our data back to the cache.
+┊  ┊78┊          store.writeQuery({
+┊  ┊79┊            query: getChatsQuery,
+┊  ┊80┊            variables: <GetChats.Variables>{
+┊  ┊81┊              amount: this.messagesAmount,
+┊  ┊82┊            },
+┊  ┊83┊            data: {
+┊  ┊84┊              chats,
+┊  ┊85┊            },
+┊  ┊86┊          });
+┊  ┊87┊        }
+┊  ┊88┊      },
 ┊52┊89┊    });
 ┊53┊90┊  }
 ┊54┊91┊}
```

[}]: #

# Chapter 11

Since we're now familiar with the way mutations work, it's time to add messages and chats removal to our list of features!
Since the most annoying part is going to be dealing with the user interface (because a multiple selection started by a press event is involved), I created an Angular directive to ease the process.
Let's start by installing it:

    $ npm install ngx-selectable-list

Now let's import it:

[{]: <helper> (diffStep "7.1" files="chats-lister.module.ts")

#### Step 7.1: Add SelectableListModule

##### Changed src&#x2F;app&#x2F;chats-lister&#x2F;chats-lister.module.ts
```diff
@@ -11,6 +11,7 @@
 ┊11┊11┊import {ChatsListComponent} from './components/chats-list/chats-list.component';
 ┊12┊12┊import {TruncateModule} from 'ng2-truncate';
 ┊13┊13┊import {SharedModule} from '../shared/shared.module';
+┊  ┊14┊import {SelectableListModule} from 'ngx-selectable-list';
 ┊14┊15┊
 ┊15┊16┊const routes: Routes = [
 ┊16┊17┊  {path: 'chats', component: ChatsComponent},
```
```diff
@@ -39,6 +40,7 @@
 ┊39┊40┊    TruncateModule,
 ┊40┊41┊    // Feature modules
 ┊41┊42┊    SharedModule,
+┊  ┊43┊    SelectableListModule,
 ┊42┊44┊  ],
 ┊43┊45┊  providers: [
 ┊44┊46┊    ChatsService,
```

[}]: #

Let's create the mutations:

[{]: <helper> (diffStep "7.2" files="src/graphql")

#### Step 7.2: Remove messages and chats

##### Added src&#x2F;graphql&#x2F;removeAllMessages.mutation.ts
```diff
@@ -0,0 +1,9 @@
+┊ ┊1┊import gql from 'graphql-tag';
+┊ ┊2┊
+┊ ┊3┊// We use the gql tag to parse our query string into a query document
+┊ ┊4┊// Issue 195: https://github.com/apollographql/apollo-codegen/issues/195
+┊ ┊5┊export const removeAllMessagesMutation = gql`
+┊ ┊6┊  mutation RemoveAllMessages($chatId: ID!, $all: Boolean) {
+┊ ┊7┊    removeMessages(chatId: $chatId, all: $all)
+┊ ┊8┊  }
+┊ ┊9┊`;
```

##### Added src&#x2F;graphql&#x2F;removeChat.mutation.ts
```diff
@@ -0,0 +1,8 @@
+┊ ┊1┊import gql from 'graphql-tag';
+┊ ┊2┊
+┊ ┊3┊// We use the gql tag to parse our query string into a query document
+┊ ┊4┊export const removeChatMutation = gql`
+┊ ┊5┊  mutation RemoveChat($chatId: ID!) {
+┊ ┊6┊    removeChat(chatId: $chatId)
+┊ ┊7┊  }
+┊ ┊8┊`;
```

##### Added src&#x2F;graphql&#x2F;removeMessages.mutation.ts
```diff
@@ -0,0 +1,9 @@
+┊ ┊1┊import gql from 'graphql-tag';
+┊ ┊2┊
+┊ ┊3┊// We use the gql tag to parse our query string into a query document
+┊ ┊4┊// Issue 195: https://github.com/apollographql/apollo-codegen/issues/195
+┊ ┊5┊export const removeMessagesMutation = gql`
+┊ ┊6┊  mutation RemoveMessages($chatId: ID!, $messageIds: [ID]) {
+┊ ┊7┊    removeMessages(chatId: $chatId, messageIds: $messageIds)
+┊ ┊8┊  }
+┊ ┊9┊`;
```

[}]: #

Now let's update our service:

[{]: <helper> (diffStep "7.2" files="chats.service.ts")

#### Step 7.2: Remove messages and chats

##### Changed src&#x2F;app&#x2F;services&#x2F;chats.service.ts
```diff
@@ -3,9 +3,13 @@
 ┊ 3┊ 3┊import {Apollo} from 'apollo-angular';
 ┊ 4┊ 4┊import {Injectable} from '@angular/core';
 ┊ 5┊ 5┊import {getChatsQuery} from '../../graphql/getChats.query';
-┊ 6┊  ┊import {AddMessage, GetChat, GetChats} from '../../types';
+┊  ┊ 6┊import {AddMessage, GetChat, GetChats, RemoveAllMessages, RemoveChat, RemoveMessages} from '../../types';
 ┊ 7┊ 7┊import {getChatQuery} from '../../graphql/getChat.query';
 ┊ 8┊ 8┊import {addMessageMutation} from '../../graphql/addMessage.mutation';
+┊  ┊ 9┊import {removeChatMutation} from '../../graphql/removeChat.mutation';
+┊  ┊10┊import {DocumentNode} from 'graphql';
+┊  ┊11┊import {removeAllMessagesMutation} from '../../graphql/removeAllMessages.mutation';
+┊  ┊12┊import {removeMessagesMutation} from '../../graphql/removeMessages.mutation';
 ┊ 9┊13┊
 ┊10┊14┊@Injectable()
 ┊11┊15┊export class ChatsService {
```
```diff
@@ -88,4 +92,107 @@
 ┊ 88┊ 92┊      },
 ┊ 89┊ 93┊    });
 ┊ 90┊ 94┊  }
+┊   ┊ 95┊
+┊   ┊ 96┊  removeChat(chatId: string) {
+┊   ┊ 97┊    return this.apollo.mutate({
+┊   ┊ 98┊      mutation: removeChatMutation,
+┊   ┊ 99┊      variables: <RemoveChat.Variables>{
+┊   ┊100┊        chatId,
+┊   ┊101┊      },
+┊   ┊102┊      update: (store, { data: { removeChat } }) => {
+┊   ┊103┊        // Read the data from our cache for this query.
+┊   ┊104┊        const {chats}: GetChats.Query = store.readQuery({
+┊   ┊105┊          query: getChatsQuery,
+┊   ┊106┊          variables: <GetChats.Variables>{
+┊   ┊107┊            amount: this.messagesAmount,
+┊   ┊108┊          },
+┊   ┊109┊        });
+┊   ┊110┊        // Remove the chat (mutable)
+┊   ┊111┊        for (const index of chats.keys()) {
+┊   ┊112┊          if (chats[index].id === removeChat) {
+┊   ┊113┊            chats.splice(index, 1);
+┊   ┊114┊          }
+┊   ┊115┊        }
+┊   ┊116┊        // Write our data back to the cache.
+┊   ┊117┊        store.writeQuery({
+┊   ┊118┊          query: getChatsQuery,
+┊   ┊119┊          variables: <GetChats.Variables>{
+┊   ┊120┊            amount: this.messagesAmount,
+┊   ┊121┊          },
+┊   ┊122┊          data: {
+┊   ┊123┊            chats,
+┊   ┊124┊          },
+┊   ┊125┊        });
+┊   ┊126┊      },
+┊   ┊127┊    });
+┊   ┊128┊  }
+┊   ┊129┊
+┊   ┊130┊  removeMessages(chatId: string, messages: GetChat.Messages[], messageIdsOrAll: string[] | boolean) {
+┊   ┊131┊    let variables: RemoveMessages.Variables | RemoveAllMessages.Variables;
+┊   ┊132┊    let ids: string[] = [];
+┊   ┊133┊    let mutation: DocumentNode;
+┊   ┊134┊
+┊   ┊135┊    if (typeof messageIdsOrAll === 'boolean') {
+┊   ┊136┊      variables = {chatId, all: messageIdsOrAll} as RemoveAllMessages.Variables;
+┊   ┊137┊      ids = messages.map(message => message.id);
+┊   ┊138┊      mutation = removeAllMessagesMutation;
+┊   ┊139┊    } else {
+┊   ┊140┊      variables = {chatId, messageIds: messageIdsOrAll} as RemoveMessages.Variables;
+┊   ┊141┊      ids = messageIdsOrAll;
+┊   ┊142┊      mutation = removeMessagesMutation;
+┊   ┊143┊    }
+┊   ┊144┊
+┊   ┊145┊    return this.apollo.mutate(<MutationOptions>{
+┊   ┊146┊      mutation,
+┊   ┊147┊      variables,
+┊   ┊148┊      update: (store, { data: { removeMessages } }: {data: RemoveMessages.Mutation | RemoveAllMessages.Mutation}) => {
+┊   ┊149┊        // Update the messages cache
+┊   ┊150┊        {
+┊   ┊151┊          // Read the data from our cache for this query.
+┊   ┊152┊          const {chat}: GetChat.Query = store.readQuery({
+┊   ┊153┊            query: getChatQuery, variables: {
+┊   ┊154┊              chatId,
+┊   ┊155┊            }
+┊   ┊156┊          });
+┊   ┊157┊          // Remove the messages (mutable)
+┊   ┊158┊          removeMessages.forEach(messageId => {
+┊   ┊159┊            for (const index of chat.messages.keys()) {
+┊   ┊160┊              if (chat.messages[index].id === messageId) {
+┊   ┊161┊                chat.messages.splice(index, 1);
+┊   ┊162┊              }
+┊   ┊163┊            }
+┊   ┊164┊          });
+┊   ┊165┊          // Write our data back to the cache.
+┊   ┊166┊          store.writeQuery({ query: getChatQuery, data: {chat} });
+┊   ┊167┊        }
+┊   ┊168┊        // Update last message cache
+┊   ┊169┊        {
+┊   ┊170┊          // Read the data from our cache for this query.
+┊   ┊171┊          const {chats}: GetChats.Query = store.readQuery({
+┊   ┊172┊            query: getChatsQuery,
+┊   ┊173┊            variables: <GetChats.Variables>{
+┊   ┊174┊              amount: this.messagesAmount,
+┊   ┊175┊            },
+┊   ┊176┊          });
+┊   ┊177┊          // Fix last message
+┊   ┊178┊          console.log(ids);
+┊   ┊179┊          console.log(chats.find(chat => chat.id === chatId).messages);
+┊   ┊180┊          chats.find(chat => chat.id === chatId).messages = messages
+┊   ┊181┊            .filter(message => !ids.includes(message.id))
+┊   ┊182┊            .sort((a, b) => Number(b.createdAt) - Number(a.createdAt)) || [];
+┊   ┊183┊          console.log(chats.find(chat => chat.id === chatId).messages);
+┊   ┊184┊          // Write our data back to the cache.
+┊   ┊185┊          store.writeQuery({
+┊   ┊186┊            query: getChatsQuery,
+┊   ┊187┊            variables: <GetChats.Variables>{
+┊   ┊188┊              amount: this.messagesAmount,
+┊   ┊189┊            },
+┊   ┊190┊            data: {
+┊   ┊191┊              chats,
+┊   ┊192┊            },
+┊   ┊193┊          });
+┊   ┊194┊        }
+┊   ┊195┊      },
+┊   ┊196┊    });
+┊   ┊197┊  }
 ┊ 91┊198┊}
```

[}]: #

And finally wire everything up into our components:

[{]: <helper> (diffStep "7.2" files="src/app/chat-viewer, src/app/chats-lister, src/app/shared")

#### Step 7.2: Remove messages and chats

##### Changed src&#x2F;app&#x2F;chat-viewer&#x2F;chat-viewer.module.ts
```diff
@@ -11,6 +11,7 @@
 ┊11┊11┊import {MessageItemComponent} from './components/message-item/message-item.component';
 ┊12┊12┊import {NewMessageComponent} from './components/new-message/new-message.component';
 ┊13┊13┊import {SharedModule} from '../shared/shared.module';
+┊  ┊14┊import {SelectableListModule} from 'ngx-selectable-list';
 ┊14┊15┊
 ┊15┊16┊const routes: Routes = [
 ┊16┊17┊  {
```
```diff
@@ -44,6 +45,7 @@
 ┊44┊45┊    FormsModule,
 ┊45┊46┊    // Feature modules
 ┊46┊47┊    SharedModule,
+┊  ┊48┊    SelectableListModule,
 ┊47┊49┊  ],
 ┊48┊50┊  providers: [
 ┊49┊51┊    ChatsService,
```

##### Changed src&#x2F;app&#x2F;chat-viewer&#x2F;components&#x2F;messages-list&#x2F;messages-list.component.ts
```diff
@@ -1,14 +1,17 @@
 ┊ 1┊ 1┊import {Component, Input} from '@angular/core';
 ┊ 2┊ 2┊import {GetChat} from '../../../../types';
+┊  ┊ 3┊import {SelectableListDirective} from 'ngx-selectable-list';
 ┊ 3┊ 4┊
 ┊ 4┊ 5┊@Component({
 ┊ 5┊ 6┊  selector: 'app-messages-list',
 ┊ 6┊ 7┊  template: `
 ┊ 7┊ 8┊    <mat-list>
 ┊ 8┊ 9┊      <mat-list-item *ngFor="let message of messages">
-┊ 9┊  ┊        <app-message-item [item]="message" [isGroup]="isGroup"></app-message-item>
+┊  ┊10┊        <app-message-item [item]="message" [isGroup]="isGroup"
+┊  ┊11┊                          appSelectableItem></app-message-item>
 ┊10┊12┊      </mat-list-item>
 ┊11┊13┊    </mat-list>
+┊  ┊14┊    <ng-content *ngIf="selectableListDirective.selecting"></ng-content>
 ┊12┊15┊  `,
 ┊13┊16┊  styleUrls: ['messages-list.component.scss'],
 ┊14┊17┊})
```
```diff
@@ -20,5 +23,5 @@
 ┊20┊23┊  @Input()
 ┊21┊24┊  isGroup: boolean;
 ┊22┊25┊
-┊23┊  ┊  constructor() {}
+┊  ┊26┊  constructor(public selectableListDirective: SelectableListDirective) {}
 ┊24┊27┊}
```

##### Changed src&#x2F;app&#x2F;chat-viewer&#x2F;containers&#x2F;chat&#x2F;chat.component.spec.ts
```diff
@@ -17,6 +17,7 @@
 ┊17┊17┊import {NewMessageComponent} from '../../components/new-message/new-message.component';
 ┊18┊18┊import {MessagesListComponent} from '../../components/messages-list/messages-list.component';
 ┊19┊19┊import {MessageItemComponent} from '../../components/message-item/message-item.component';
+┊  ┊20┊import {SelectableListModule} from 'ngx-selectable-list';
 ┊20┊21┊
 ┊21┊22┊describe('ChatComponent', () => {
 ┊22┊23┊  let component: ChatComponent;
```
```diff
@@ -95,7 +96,8 @@
 ┊ 95┊ 96┊        SharedModule,
 ┊ 96┊ 97┊        HttpLinkModule,
 ┊ 97┊ 98┊        HttpClientTestingModule,
-┊ 98┊   ┊        RouterTestingModule
+┊   ┊ 99┊        RouterTestingModule,
+┊   ┊100┊        SelectableListModule,
 ┊ 99┊101┊      ],
 ┊100┊102┊      providers: [
 ┊101┊103┊        ChatsService,
```

##### Changed src&#x2F;app&#x2F;chat-viewer&#x2F;containers&#x2F;chat&#x2F;chat.component.ts
```diff
@@ -12,7 +12,10 @@
 ┊12┊12┊      <div class="title">{{ name }}</div>
 ┊13┊13┊    </app-toolbar>
 ┊14┊14┊    <div class="container">
-┊15┊  ┊      <app-messages-list [items]="messages" [isGroup]="isGroup"></app-messages-list>
+┊  ┊15┊      <app-messages-list [items]="messages" [isGroup]="isGroup"
+┊  ┊16┊                         appSelectableList="multiple_press" (multiple)="deleteMessages($event)">
+┊  ┊17┊        <app-confirm-selection #confirmSelection></app-confirm-selection>
+┊  ┊18┊      </app-messages-list>
 ┊16┊19┊      <app-new-message (newMessage)="addMessage($event)"></app-new-message>
 ┊17┊20┊    </div>
 ┊18┊21┊  `,
```
```diff
@@ -47,4 +50,8 @@
 ┊47┊50┊  addMessage(content: string) {
 ┊48┊51┊    this.chatsService.addMessage(this.chatId, content).subscribe();
 ┊49┊52┊  }
+┊  ┊53┊
+┊  ┊54┊  deleteMessages(messageIds: string[]) {
+┊  ┊55┊    this.chatsService.removeMessages(this.chatId, this.messages, messageIds).subscribe();
+┊  ┊56┊  }
 ┊50┊57┊}
```

##### Changed src&#x2F;app&#x2F;chats-lister&#x2F;components&#x2F;chat-item&#x2F;chat-item.component.ts
```diff
@@ -5,7 +5,7 @@
 ┊ 5┊ 5┊  selector: 'app-chat-item',
 ┊ 6┊ 6┊  template: `
 ┊ 7┊ 7┊    <div class="chat-row">
-┊ 8┊  ┊        <div class="chat-recipient" (click)="selectChat()">
+┊  ┊ 8┊        <div class="chat-recipient">
 ┊ 9┊ 9┊          <img *ngIf="chat.picture" [src]="chat.picture" width="48" height="48">
 ┊10┊10┊          <div>{{ chat.name }} [id: {{ chat.id }}]</div>
 ┊11┊11┊        </div>
```
```diff
@@ -18,11 +18,4 @@
 ┊18┊18┊  // tslint:disable-next-line:no-input-rename
 ┊19┊19┊  @Input('item')
 ┊20┊20┊  chat: GetChats.Chats;
-┊21┊  ┊
-┊22┊  ┊  @Output()
-┊23┊  ┊  select = new EventEmitter<string>();
-┊24┊  ┊
-┊25┊  ┊  selectChat() {
-┊26┊  ┊    this.select.emit(this.chat.id);
-┊27┊  ┊  }
 ┊28┊21┊}
```

##### Changed src&#x2F;app&#x2F;chats-lister&#x2F;components&#x2F;chats-list&#x2F;chats-list.component.ts
```diff
@@ -1,14 +1,17 @@
-┊ 1┊  ┊import {Component, EventEmitter, Input, Output} from '@angular/core';
+┊  ┊ 1┊import {Component, Input} from '@angular/core';
 ┊ 2┊ 2┊import {GetChats} from '../../../../types';
+┊  ┊ 3┊import {SelectableListDirective} from 'ngx-selectable-list';
 ┊ 3┊ 4┊
 ┊ 4┊ 5┊@Component({
 ┊ 5┊ 6┊  selector: 'app-chats-list',
 ┊ 6┊ 7┊  template: `
 ┊ 7┊ 8┊    <mat-list>
 ┊ 8┊ 9┊      <mat-list-item *ngFor="let chat of chats">
-┊ 9┊  ┊        <app-chat-item [item]="chat" (select)="selectChat($event)"></app-chat-item>
+┊  ┊10┊        <app-chat-item [item]="chat"
+┊  ┊11┊                       appSelectableItem></app-chat-item>
 ┊10┊12┊      </mat-list-item>
 ┊11┊13┊    </mat-list>
+┊  ┊14┊    <ng-content *ngIf="selectableListDirective.selecting"></ng-content>
 ┊12┊15┊  `,
 ┊13┊16┊  styleUrls: ['chats-list.component.scss'],
 ┊14┊17┊})
```
```diff
@@ -17,12 +20,5 @@
 ┊17┊20┊  @Input('items')
 ┊18┊21┊  chats: GetChats.Chats[];
 ┊19┊22┊
-┊20┊  ┊  @Output()
-┊21┊  ┊  select = new EventEmitter<string>();
-┊22┊  ┊
-┊23┊  ┊  constructor() {}
-┊24┊  ┊
-┊25┊  ┊  selectChat(id: string) {
-┊26┊  ┊    this.select.emit(id);
-┊27┊  ┊  }
+┊  ┊23┊  constructor(public selectableListDirective: SelectableListDirective) {}
 ┊28┊24┊}
```

##### Changed src&#x2F;app&#x2F;chats-lister&#x2F;containers&#x2F;chats&#x2F;chats.component.spec.ts
```diff
@@ -13,6 +13,7 @@
 ┊13┊13┊import {InMemoryCache} from 'apollo-cache-inmemory';
 ┊14┊14┊import {By} from '@angular/platform-browser';
 ┊15┊15┊import {RouterTestingModule} from '@angular/router/testing';
+┊  ┊16┊import {SelectableListModule} from 'ngx-selectable-list';
 ┊16┊17┊
 ┊17┊18┊describe('ChatsComponent', () => {
 ┊18┊19┊  let component: ChatsComponent;
```
```diff
@@ -273,7 +274,8 @@
 ┊273┊274┊        TruncateModule,
 ┊274┊275┊        HttpLinkModule,
 ┊275┊276┊        HttpClientTestingModule,
-┊276┊   ┊        RouterTestingModule
+┊   ┊277┊        RouterTestingModule,
+┊   ┊278┊        SelectableListModule,
 ┊277┊279┊      ],
 ┊278┊280┊      providers: [
 ┊279┊281┊        ChatsService,
```

##### Changed src&#x2F;app&#x2F;chats-lister&#x2F;containers&#x2F;chats&#x2F;chats.component.ts
```diff
@@ -28,9 +28,13 @@
 ┊28┊28┊      </button>
 ┊29┊29┊    </mat-menu>
 ┊30┊30┊
-┊31┊  ┊    <app-chats-list [items]="chats$ | async" (select)="goToChat($event)"></app-chats-list>
+┊  ┊31┊    <app-chats-list [items]="chats$ | async"
+┊  ┊32┊                    appSelectableList="both"
+┊  ┊33┊                    (single)="goToChat($event)" (multiple)="deleteChats($event)" (isSelecting)="isSelecting = $event">
+┊  ┊34┊      <app-confirm-selection #confirmSelection></app-confirm-selection>
+┊  ┊35┊    </app-chats-list>
 ┊32┊36┊
-┊33┊  ┊    <button class="chat-button" mat-fab color="primary">
+┊  ┊37┊    <button *ngIf="!isSelecting" class="chat-button" mat-fab color="primary">
 ┊34┊38┊      <mat-icon aria-label="Icon-button with a + icon">add</mat-icon>
 ┊35┊39┊    </button>
 ┊36┊40┊  `,
```
```diff
@@ -38,6 +42,7 @@
 ┊38┊42┊})
 ┊39┊43┊export class ChatsComponent implements OnInit {
 ┊40┊44┊  chats$: Observable<GetChats.Chats[]>;
+┊  ┊45┊  isSelecting = false;
 ┊41┊46┊
 ┊42┊47┊  constructor(private chatsService: ChatsService,
 ┊43┊48┊              private router: Router) {
```
```diff
@@ -50,4 +55,10 @@
 ┊50┊55┊  goToChat(chatId: string) {
 ┊51┊56┊    this.router.navigate(['/chat', chatId]);
 ┊52┊57┊  }
+┊  ┊58┊
+┊  ┊59┊  deleteChats(chatIds: string[]) {
+┊  ┊60┊    chatIds.forEach(chatId => {
+┊  ┊61┊      this.chatsService.removeChat(chatId).subscribe();
+┊  ┊62┊    });
+┊  ┊63┊  }
 ┊53┊64┊}
```

##### Added src&#x2F;app&#x2F;shared&#x2F;components&#x2F;confirm-selection&#x2F;confirm-selection.component.scss
```diff
@@ -0,0 +1,6 @@
+┊ ┊1┊:host {
+┊ ┊2┊  display: block;
+┊ ┊3┊  position: absolute;
+┊ ┊4┊  bottom: 5vw;
+┊ ┊5┊  right: 5vw;
+┊ ┊6┊}
```

##### Added src&#x2F;app&#x2F;shared&#x2F;components&#x2F;confirm-selection&#x2F;confirm-selection.component.ts
```diff
@@ -0,0 +1,21 @@
+┊  ┊ 1┊import {Component, EventEmitter, Input, Output} from '@angular/core';
+┊  ┊ 2┊
+┊  ┊ 3┊@Component({
+┊  ┊ 4┊  selector: 'app-confirm-selection',
+┊  ┊ 5┊  template: `
+┊  ┊ 6┊    <button mat-fab color="primary" (click)="handleClick()">
+┊  ┊ 7┊      <mat-icon aria-label="Icon-button">{{ icon }}</mat-icon>
+┊  ┊ 8┊    </button>
+┊  ┊ 9┊  `,
+┊  ┊10┊  styleUrls: ['./confirm-selection.component.scss'],
+┊  ┊11┊})
+┊  ┊12┊export class ConfirmSelectionComponent {
+┊  ┊13┊  @Input()
+┊  ┊14┊  icon = 'delete';
+┊  ┊15┊  @Output()
+┊  ┊16┊  emitClick = new EventEmitter<null>();
+┊  ┊17┊
+┊  ┊18┊  handleClick() {
+┊  ┊19┊    this.emitClick.emit();
+┊  ┊20┊  }
+┊  ┊21┊}
```

##### Changed src&#x2F;app&#x2F;shared&#x2F;shared.module.ts
```diff
@@ -1,19 +1,23 @@
 ┊ 1┊ 1┊import {BrowserModule} from '@angular/platform-browser';
 ┊ 2┊ 2┊import {NgModule} from '@angular/core';
 ┊ 3┊ 3┊
-┊ 4┊  ┊import {MatToolbarModule} from '@angular/material';
+┊  ┊ 4┊import {MatButtonModule, MatIconModule, MatToolbarModule} from '@angular/material';
 ┊ 5┊ 5┊import {ToolbarComponent} from './components/toolbar/toolbar.component';
 ┊ 6┊ 6┊import {FormsModule} from '@angular/forms';
 ┊ 7┊ 7┊import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
+┊  ┊ 8┊import {ConfirmSelectionComponent} from './components/confirm-selection/confirm-selection.component';
 ┊ 8┊ 9┊
 ┊ 9┊10┊@NgModule({
 ┊10┊11┊  declarations: [
 ┊11┊12┊    ToolbarComponent,
+┊  ┊13┊    ConfirmSelectionComponent,
 ┊12┊14┊  ],
 ┊13┊15┊  imports: [
 ┊14┊16┊    BrowserModule,
 ┊15┊17┊    // Material
 ┊16┊18┊    MatToolbarModule,
+┊  ┊19┊    MatIconModule,
+┊  ┊20┊    MatButtonModule,
 ┊17┊21┊    // Animations
 ┊18┊22┊    BrowserAnimationsModule,
 ┊19┊23┊    // Forms
```
```diff
@@ -22,6 +26,7 @@
 ┊22┊26┊  providers: [],
 ┊23┊27┊  exports: [
 ┊24┊28┊    ToolbarComponent,
+┊  ┊29┊    ConfirmSelectionComponent,
 ┊25┊30┊  ],
 ┊26┊31┊})
 ┊27┊32┊export class SharedModule {
```

[}]: #

We also created a `ConfirmSelectionComponent` to use for content projection, since our selectable list directive will be able to listen to its events.
The selectable list directive supports much more different use cases, for info please read the documentation.

# Chapter 12

We still cannot create new chats or groups, so let's implement it.
We're going to create a `ChatsCreation` module, with a `NewChat` and a `NewGroup` containers, along with several presentational components.
We're going to make use of the selectable list directive once again, to ease selecting the users when we're creating a new group.
You should also notice that we are looking for existing chats before creating a new one: if it already exists we're are simply redirecting to that chat instead of creating a new one (the server wouldn't allow that anyway and it will simply 
return the chat id).

[{]: <helper> (diffStep "8.1")

#### Step 8.1: New chats and groups

##### Changed src&#x2F;app&#x2F;app.module.ts
```diff
@@ -10,6 +10,7 @@
 ┊10┊10┊import {ChatsListerModule} from './chats-lister/chats-lister.module';
 ┊11┊11┊import {RouterModule, Routes} from '@angular/router';
 ┊12┊12┊import {ChatViewerModule} from './chat-viewer/chat-viewer.module';
+┊  ┊13┊import {ChatsCreationModule} from './chats-creation/chats-creation.module';
 ┊13┊14┊
 ┊14┊15┊const routes: Routes = [
 ┊15┊16┊  {path: '', redirectTo: 'chats', pathMatch: 'full'},
```
```diff
@@ -30,6 +31,7 @@
 ┊30┊31┊    // Feature modules
 ┊31┊32┊    ChatsListerModule,
 ┊32┊33┊    ChatViewerModule,
+┊  ┊34┊    ChatsCreationModule,
 ┊33┊35┊  ],
 ┊34┊36┊  providers: [],
 ┊35┊37┊  bootstrap: [AppComponent]
```

##### Changed src&#x2F;app&#x2F;chat-viewer&#x2F;containers&#x2F;chat&#x2F;chat.component.spec.ts
```diff
@@ -125,7 +125,8 @@
 ┊125┊125┊    fixture = TestBed.createComponent(ChatComponent);
 ┊126┊126┊    component = fixture.componentInstance;
 ┊127┊127┊    fixture.detectChanges();
-┊128┊   ┊    const req = httpMock.expectOne('http://localhost:3000/graphql', 'call to api');
+┊   ┊128┊    httpMock.expectOne(httpReq => httpReq.body.operationName === 'GetChats', 'call to getChats api');
+┊   ┊129┊    const req = httpMock.expectOne(httpReq => httpReq.body.operationName === 'GetChat', 'call to getChat api');
 ┊129┊130┊    req.flush({
 ┊130┊131┊      data: {
 ┊131┊132┊        chat
```

##### Added src&#x2F;app&#x2F;chats-creation&#x2F;chats-creation.module.ts
```diff
@@ -0,0 +1,60 @@
+┊  ┊ 1┊import { BrowserModule } from '@angular/platform-browser';
+┊  ┊ 2┊import { NgModule } from '@angular/core';
+┊  ┊ 3┊
+┊  ┊ 4┊import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
+┊  ┊ 5┊import {
+┊  ┊ 6┊  MatButtonModule, MatFormFieldModule, MatGridListModule, MatIconModule, MatInputModule, MatListModule, MatMenuModule,
+┊  ┊ 7┊  MatToolbarModule
+┊  ┊ 8┊} from '@angular/material';
+┊  ┊ 9┊import {RouterModule, Routes} from '@angular/router';
+┊  ┊10┊import {FormsModule} from '@angular/forms';
+┊  ┊11┊import {ChatsService} from '../services/chats.service';
+┊  ┊12┊import {UserItemComponent} from './components/user-item/user-item.component';
+┊  ┊13┊import {UsersListComponent} from './components/users-list/users-list.component';
+┊  ┊14┊import {NewGroupComponent} from './containers/new-group/new-group.component';
+┊  ┊15┊import {NewChatComponent} from './containers/new-chat/new-chat.component';
+┊  ┊16┊import {NewGroupDetailsComponent} from './components/new-group-details/new-group-details.component';
+┊  ┊17┊import {SharedModule} from '../shared/shared.module';
+┊  ┊18┊import {SelectableListModule} from 'ngx-selectable-list';
+┊  ┊19┊
+┊  ┊20┊const routes: Routes = [
+┊  ┊21┊  {path: 'new-chat', component: NewChatComponent},
+┊  ┊22┊  {path: 'new-group', component: NewGroupComponent},
+┊  ┊23┊];
+┊  ┊24┊
+┊  ┊25┊@NgModule({
+┊  ┊26┊  declarations: [
+┊  ┊27┊    NewChatComponent,
+┊  ┊28┊    UsersListComponent,
+┊  ┊29┊    NewGroupComponent,
+┊  ┊30┊    UserItemComponent,
+┊  ┊31┊    NewGroupDetailsComponent,
+┊  ┊32┊  ],
+┊  ┊33┊  imports: [
+┊  ┊34┊    BrowserModule,
+┊  ┊35┊    // Animations (for Material)
+┊  ┊36┊    BrowserAnimationsModule,
+┊  ┊37┊    // Material
+┊  ┊38┊    MatToolbarModule,
+┊  ┊39┊    MatMenuModule,
+┊  ┊40┊    MatIconModule,
+┊  ┊41┊    MatButtonModule,
+┊  ┊42┊    MatListModule,
+┊  ┊43┊    MatGridListModule,
+┊  ┊44┊    MatInputModule,
+┊  ┊45┊    MatFormFieldModule,
+┊  ┊46┊    MatGridListModule,
+┊  ┊47┊    // Routing
+┊  ┊48┊    RouterModule.forChild(routes),
+┊  ┊49┊    // Forms
+┊  ┊50┊    FormsModule,
+┊  ┊51┊    // Feature modules
+┊  ┊52┊    SelectableListModule,
+┊  ┊53┊    SharedModule,
+┊  ┊54┊  ],
+┊  ┊55┊  providers: [
+┊  ┊56┊    ChatsService,
+┊  ┊57┊  ],
+┊  ┊58┊})
+┊  ┊59┊export class ChatsCreationModule {
+┊  ┊60┊}
```

##### Added src&#x2F;app&#x2F;chats-creation&#x2F;components&#x2F;new-group-details&#x2F;new-group-details.component.scss
```diff
@@ -0,0 +1,25 @@
+┊  ┊ 1┊:host {
+┊  ┊ 2┊  display: block;
+┊  ┊ 3┊}
+┊  ┊ 4┊
+┊  ┊ 5┊div {
+┊  ┊ 6┊  padding: 16px;
+┊  ┊ 7┊  mat-form-field {
+┊  ┊ 8┊    width: 100%;
+┊  ┊ 9┊  }
+┊  ┊10┊}
+┊  ┊11┊
+┊  ┊12┊.new-group {
+┊  ┊13┊  position: absolute;
+┊  ┊14┊  bottom: 5vw;
+┊  ┊15┊  right: 5vw;
+┊  ┊16┊}
+┊  ┊17┊
+┊  ┊18┊.users {
+┊  ┊19┊  display: flex;
+┊  ┊20┊  flex-flow: row wrap;
+┊  ┊21┊  img {
+┊  ┊22┊    flex: 0 1 8vh;
+┊  ┊23┊    height: 8vh;
+┊  ┊24┊  }
+┊  ┊25┊}
```

##### Added src&#x2F;app&#x2F;chats-creation&#x2F;components&#x2F;new-group-details&#x2F;new-group-details.component.ts
```diff
@@ -0,0 +1,34 @@
+┊  ┊ 1┊import {Component, EventEmitter, Input, Output} from '@angular/core';
+┊  ┊ 2┊import {GetUsers} from '../../../../types';
+┊  ┊ 3┊
+┊  ┊ 4┊@Component({
+┊  ┊ 5┊  selector: 'app-new-group-details',
+┊  ┊ 6┊  template: `
+┊  ┊ 7┊    <div>
+┊  ┊ 8┊      <mat-form-field>
+┊  ┊ 9┊        <input matInput placeholder="Group name" [(ngModel)]="groupName">
+┊  ┊10┊      </mat-form-field>
+┊  ┊11┊    </div>
+┊  ┊12┊    <button [disabled]="!groupName" class="new-group" mat-fab color="primary" (click)="emitGroupDetails()">
+┊  ┊13┊      <mat-icon aria-label="Icon-button with a + icon">arrow_forward</mat-icon>
+┊  ┊14┊    </button>
+┊  ┊15┊    <div>Members</div>
+┊  ┊16┊    <div class="users">
+┊  ┊17┊      <img *ngFor="let user of users;" [src]="user.picture"/>
+┊  ┊18┊    </div>
+┊  ┊19┊  `,
+┊  ┊20┊  styleUrls: ['new-group-details.component.scss'],
+┊  ┊21┊})
+┊  ┊22┊export class NewGroupDetailsComponent {
+┊  ┊23┊  groupName: string;
+┊  ┊24┊  @Input()
+┊  ┊25┊  users: GetUsers.Users[];
+┊  ┊26┊  @Output()
+┊  ┊27┊  groupDetails = new EventEmitter<string>();
+┊  ┊28┊
+┊  ┊29┊  emitGroupDetails() {
+┊  ┊30┊    if (this.groupDetails) {
+┊  ┊31┊      this.groupDetails.emit(this.groupName);
+┊  ┊32┊    }
+┊  ┊33┊  }
+┊  ┊34┊}
```

##### Added src&#x2F;app&#x2F;chats-creation&#x2F;components&#x2F;user-item&#x2F;user-item.component.scss
```diff
@@ -0,0 +1,28 @@
+┊  ┊ 1┊:host {
+┊  ┊ 2┊  display: block;
+┊  ┊ 3┊  width: 100%;
+┊  ┊ 4┊  height: 100%;
+┊  ┊ 5┊}
+┊  ┊ 6┊
+┊  ┊ 7┊button {
+┊  ┊ 8┊  padding: 0;
+┊  ┊ 9┊  display: flex;
+┊  ┊10┊  align-items: center;
+┊  ┊11┊  height: 100%;
+┊  ┊12┊  width: 100%;
+┊  ┊13┊  border: none;
+┊  ┊14┊
+┊  ┊15┊  div:first-of-type {
+┊  ┊16┊    display: flex;
+┊  ┊17┊    justify-content: center;
+┊  ┊18┊    align-items: center;
+┊  ┊19┊
+┊  ┊20┊    img {
+┊  ┊21┊      max-width: 100%;
+┊  ┊22┊    }
+┊  ┊23┊  }
+┊  ┊24┊
+┊  ┊25┊  div:nth-of-type(2) {
+┊  ┊26┊    padding-left: 16px;
+┊  ┊27┊  }
+┊  ┊28┊}
```

##### Added src&#x2F;app&#x2F;chats-creation&#x2F;components&#x2F;user-item&#x2F;user-item.component.ts
```diff
@@ -0,0 +1,20 @@
+┊  ┊ 1┊import {Component, Input} from '@angular/core';
+┊  ┊ 2┊import {GetUsers} from '../../../../types';
+┊  ┊ 3┊
+┊  ┊ 4┊@Component({
+┊  ┊ 5┊  selector: 'app-user-item',
+┊  ┊ 6┊  template: `
+┊  ┊ 7┊    <button mat-menu-item>
+┊  ┊ 8┊      <div>
+┊  ┊ 9┊        <img [src]="user.picture" *ngIf="user.picture">
+┊  ┊10┊      </div>
+┊  ┊11┊      <div>{{ user.name }}</div>
+┊  ┊12┊    </button>
+┊  ┊13┊  `,
+┊  ┊14┊  styleUrls: ['user-item.component.scss']
+┊  ┊15┊})
+┊  ┊16┊export class UserItemComponent {
+┊  ┊17┊  // tslint:disable-next-line:no-input-rename
+┊  ┊18┊  @Input('item')
+┊  ┊19┊  user: GetUsers.Users;
+┊  ┊20┊}
```

##### Added src&#x2F;app&#x2F;chats-creation&#x2F;components&#x2F;users-list&#x2F;users-list.component.scss
```diff
@@ -0,0 +1,3 @@
+┊ ┊1┊:host {
+┊ ┊2┊  display: block;
+┊ ┊3┊}
```

##### Added src&#x2F;app&#x2F;chats-creation&#x2F;components&#x2F;users-list&#x2F;users-list.component.ts
```diff
@@ -0,0 +1,24 @@
+┊  ┊ 1┊import {Component, Input} from '@angular/core';
+┊  ┊ 2┊import {GetUsers} from '../../../../types';
+┊  ┊ 3┊import {SelectableListDirective} from 'ngx-selectable-list';
+┊  ┊ 4┊
+┊  ┊ 5┊@Component({
+┊  ┊ 6┊  selector: 'app-users-list',
+┊  ┊ 7┊  template: `
+┊  ┊ 8┊    <mat-list>
+┊  ┊ 9┊      <mat-list-item *ngFor="let user of users">
+┊  ┊10┊        <app-user-item [item]="user"
+┊  ┊11┊                       appSelectableItem></app-user-item>
+┊  ┊12┊      </mat-list-item>
+┊  ┊13┊    </mat-list>
+┊  ┊14┊    <ng-content *ngIf="selectableListDirective.selecting"></ng-content>
+┊  ┊15┊  `,
+┊  ┊16┊  styleUrls: ['users-list.component.scss'],
+┊  ┊17┊})
+┊  ┊18┊export class UsersListComponent {
+┊  ┊19┊  // tslint:disable-next-line:no-input-rename
+┊  ┊20┊  @Input('items')
+┊  ┊21┊  users: GetUsers.Users[];
+┊  ┊22┊
+┊  ┊23┊  constructor(public selectableListDirective: SelectableListDirective) {}
+┊  ┊24┊}
```

##### Added src&#x2F;app&#x2F;chats-creation&#x2F;containers&#x2F;new-chat&#x2F;new-chat.component.scss
```diff
@@ -0,0 +1,23 @@
+┊  ┊ 1┊.new-group {
+┊  ┊ 2┊  display: flex;
+┊  ┊ 3┊  height: 8vh;
+┊  ┊ 4┊  align-items: center;
+┊  ┊ 5┊
+┊  ┊ 6┊  div:first-of-type {
+┊  ┊ 7┊    height: 8vh;
+┊  ┊ 8┊    width: 8vh;
+┊  ┊ 9┊    display: flex;
+┊  ┊10┊    justify-content: center;
+┊  ┊11┊    align-items: center;
+┊  ┊12┊
+┊  ┊13┊    mat-icon {
+┊  ┊14┊      height: 5vh;
+┊  ┊15┊      width: 5vh;
+┊  ┊16┊      font-size: 5vh;
+┊  ┊17┊    }
+┊  ┊18┊  }
+┊  ┊19┊
+┊  ┊20┊  div:nth-of-type(2) {
+┊  ┊21┊    padding: 16px;
+┊  ┊22┊  }
+┊  ┊23┊}
```

##### Added src&#x2F;app&#x2F;chats-creation&#x2F;containers&#x2F;new-chat&#x2F;new-chat.component.ts
```diff
@@ -0,0 +1,59 @@
+┊  ┊ 1┊import {Component, OnInit} from '@angular/core';
+┊  ┊ 2┊import {Location} from '@angular/common';
+┊  ┊ 3┊import {Router} from '@angular/router';
+┊  ┊ 4┊import {AddChat, GetUsers} from '../../../../types';
+┊  ┊ 5┊import {ChatsService} from '../../../services/chats.service';
+┊  ┊ 6┊
+┊  ┊ 7┊@Component({
+┊  ┊ 8┊  template: `
+┊  ┊ 9┊    <app-toolbar>
+┊  ┊10┊      <button class="navigation" mat-button (click)="goBack()">
+┊  ┊11┊        <mat-icon aria-label="Icon-button with an arrow back icon">arrow_back</mat-icon>
+┊  ┊12┊      </button>
+┊  ┊13┊      <div class="title">New chat</div>
+┊  ┊14┊    </app-toolbar>
+┊  ┊15┊
+┊  ┊16┊    <div class="new-group" (click)="goToNewGroup()">
+┊  ┊17┊      <div>
+┊  ┊18┊        <mat-icon aria-label="Icon-button with a group add icon">group_add</mat-icon>
+┊  ┊19┊      </div>
+┊  ┊20┊      <div>New group</div>
+┊  ┊21┊    </div>
+┊  ┊22┊
+┊  ┊23┊    <app-users-list [items]="users"
+┊  ┊24┊                    appSelectableList="single" (single)="addChat($event)">
+┊  ┊25┊    </app-users-list>
+┊  ┊26┊  `,
+┊  ┊27┊  styleUrls: ['new-chat.component.scss'],
+┊  ┊28┊})
+┊  ┊29┊export class NewChatComponent implements OnInit {
+┊  ┊30┊  users: GetUsers.Users[];
+┊  ┊31┊
+┊  ┊32┊  constructor(private router: Router,
+┊  ┊33┊              private location: Location,
+┊  ┊34┊              private chatsService: ChatsService) {}
+┊  ┊35┊
+┊  ┊36┊  ngOnInit () {
+┊  ┊37┊    this.chatsService.getUsers().users$.subscribe(users => this.users = users);
+┊  ┊38┊  }
+┊  ┊39┊
+┊  ┊40┊  goBack() {
+┊  ┊41┊    this.location.back();
+┊  ┊42┊  }
+┊  ┊43┊
+┊  ┊44┊  goToNewGroup() {
+┊  ┊45┊    this.router.navigate(['/new-group']);
+┊  ┊46┊  }
+┊  ┊47┊
+┊  ┊48┊  addChat(recipientId: string) {
+┊  ┊49┊    const chatId = this.chatsService.getChatId(recipientId);
+┊  ┊50┊    if (chatId) {
+┊  ┊51┊      // Chat is already listed for the current user
+┊  ┊52┊      this.router.navigate(['/chat', chatId]);
+┊  ┊53┊    } else {
+┊  ┊54┊      this.chatsService.addChat(recipientId).subscribe(({data: {addChat: {id}}}: { data: AddChat.Mutation }) => {
+┊  ┊55┊        this.router.navigate(['/chat', id]);
+┊  ┊56┊      });
+┊  ┊57┊    }
+┊  ┊58┊  }
+┊  ┊59┊}
```

##### Added src&#x2F;app&#x2F;chats-creation&#x2F;containers&#x2F;new-group&#x2F;new-group.component.scss


##### Added src&#x2F;app&#x2F;chats-creation&#x2F;containers&#x2F;new-group&#x2F;new-group.component.ts
```diff
@@ -0,0 +1,60 @@
+┊  ┊ 1┊import {Component, OnInit} from '@angular/core';
+┊  ┊ 2┊import {Location} from '@angular/common';
+┊  ┊ 3┊import {Router} from '@angular/router';
+┊  ┊ 4┊import {AddGroup, GetUsers} from '../../../../types';
+┊  ┊ 5┊import {ChatsService} from '../../../services/chats.service';
+┊  ┊ 6┊
+┊  ┊ 7┊@Component({
+┊  ┊ 8┊  template: `
+┊  ┊ 9┊    <app-toolbar>
+┊  ┊10┊      <button class="navigation" mat-button (click)="goBack()">
+┊  ┊11┊        <mat-icon aria-label="Icon-button with an arrow back icon">arrow_back</mat-icon>
+┊  ┊12┊      </button>
+┊  ┊13┊      <div class="title">New group</div>
+┊  ┊14┊    </app-toolbar>
+┊  ┊15┊
+┊  ┊16┊    <app-users-list *ngIf="!recipientIds.length" [items]="users"
+┊  ┊17┊                    appSelectableList="multiple_tap" (multiple)="selectUsers($event)">
+┊  ┊18┊      <app-confirm-selection #confirmSelection icon="arrow_forward"></app-confirm-selection>
+┊  ┊19┊    </app-users-list>
+┊  ┊20┊    <app-new-group-details *ngIf="recipientIds.length" [users]="getSelectedUsers()"
+┊  ┊21┊                           (groupDetails)="addGroup($event)"></app-new-group-details>
+┊  ┊22┊  `,
+┊  ┊23┊  styleUrls: ['new-group.component.scss'],
+┊  ┊24┊})
+┊  ┊25┊export class NewGroupComponent implements OnInit {
+┊  ┊26┊  users: GetUsers.Users[];
+┊  ┊27┊  recipientIds: string[] = [];
+┊  ┊28┊
+┊  ┊29┊  constructor(private router: Router,
+┊  ┊30┊              private location: Location,
+┊  ┊31┊              private chatsService: ChatsService) {}
+┊  ┊32┊
+┊  ┊33┊  ngOnInit () {
+┊  ┊34┊    this.chatsService.getUsers().users$.subscribe(users => this.users = users);
+┊  ┊35┊  }
+┊  ┊36┊
+┊  ┊37┊  goBack() {
+┊  ┊38┊    if (this.recipientIds.length) {
+┊  ┊39┊      this.recipientIds = [];
+┊  ┊40┊    } else {
+┊  ┊41┊      this.location.back();
+┊  ┊42┊    }
+┊  ┊43┊  }
+┊  ┊44┊
+┊  ┊45┊  selectUsers(recipientIds: string[]) {
+┊  ┊46┊    this.recipientIds = recipientIds;
+┊  ┊47┊  }
+┊  ┊48┊
+┊  ┊49┊  getSelectedUsers() {
+┊  ┊50┊    return this.users.filter(user => this.recipientIds.includes(user.id));
+┊  ┊51┊  }
+┊  ┊52┊
+┊  ┊53┊  addGroup(groupName: string) {
+┊  ┊54┊    if (groupName && this.recipientIds.length) {
+┊  ┊55┊      this.chatsService.addGroup(this.recipientIds, groupName).subscribe(({data: {addGroup: {id}}}: { data: AddGroup.Mutation }) => {
+┊  ┊56┊        this.router.navigate(['/chat', id]);
+┊  ┊57┊      });
+┊  ┊58┊    }
+┊  ┊59┊  }
+┊  ┊60┊}
```

##### Changed src&#x2F;app&#x2F;chats-lister&#x2F;containers&#x2F;chats&#x2F;chats.component.ts
```diff
@@ -34,7 +34,7 @@
 ┊34┊34┊      <app-confirm-selection #confirmSelection></app-confirm-selection>
 ┊35┊35┊    </app-chats-list>
 ┊36┊36┊
-┊37┊  ┊    <button *ngIf="!isSelecting" class="chat-button" mat-fab color="primary">
+┊  ┊37┊    <button *ngIf="!isSelecting" class="chat-button" mat-fab color="primary" (click)="goToNewChat()">
 ┊38┊38┊      <mat-icon aria-label="Icon-button with a + icon">add</mat-icon>
 ┊39┊39┊    </button>
 ┊40┊40┊  `,
```
```diff
@@ -56,6 +56,10 @@
 ┊56┊56┊    this.router.navigate(['/chat', chatId]);
 ┊57┊57┊  }
 ┊58┊58┊
+┊  ┊59┊  goToNewChat() {
+┊  ┊60┊    this.router.navigate(['/new-chat']);
+┊  ┊61┊  }
+┊  ┊62┊
 ┊59┊63┊  deleteChats(chatIds: string[]) {
 ┊60┊64┊    chatIds.forEach(chatId => {
 ┊61┊65┊      this.chatsService.removeChat(chatId).subscribe();
```

##### Changed src&#x2F;app&#x2F;services&#x2F;chats.service.ts
```diff
@@ -1,34 +1,44 @@
 ┊ 1┊ 1┊import {ApolloQueryResult, MutationOptions, WatchQueryOptions} from 'apollo-client';
 ┊ 2┊ 2┊import {map} from 'rxjs/operators';
-┊ 3┊  ┊import {Apollo} from 'apollo-angular';
+┊  ┊ 3┊import {Apollo, QueryRef} from 'apollo-angular';
 ┊ 4┊ 4┊import {Injectable} from '@angular/core';
 ┊ 5┊ 5┊import {getChatsQuery} from '../../graphql/getChats.query';
-┊ 6┊  ┊import {AddMessage, GetChat, GetChats, RemoveAllMessages, RemoveChat, RemoveMessages} from '../../types';
+┊  ┊ 6┊import {AddChat, AddGroup, AddMessage, GetChat, GetChats, GetUsers, RemoveAllMessages, RemoveChat, RemoveMessages} from '../../types';
 ┊ 7┊ 7┊import {getChatQuery} from '../../graphql/getChat.query';
 ┊ 8┊ 8┊import {addMessageMutation} from '../../graphql/addMessage.mutation';
 ┊ 9┊ 9┊import {removeChatMutation} from '../../graphql/removeChat.mutation';
 ┊10┊10┊import {DocumentNode} from 'graphql';
 ┊11┊11┊import {removeAllMessagesMutation} from '../../graphql/removeAllMessages.mutation';
 ┊12┊12┊import {removeMessagesMutation} from '../../graphql/removeMessages.mutation';
+┊  ┊13┊import {getUsersQuery} from '../../graphql/getUsers.query';
+┊  ┊14┊import {Observable} from 'rxjs/Observable';
+┊  ┊15┊import {addChatMutation} from '../../graphql/addChat.mutation';
+┊  ┊16┊import {addGroupMutation} from '../../graphql/addGroup.mutation';
+┊  ┊17┊
+┊  ┊18┊const currentUserId = '1';
 ┊13┊19┊
 ┊14┊20┊@Injectable()
 ┊15┊21┊export class ChatsService {
 ┊16┊22┊  messagesAmount = 3;
+┊  ┊23┊  getChatsWq: QueryRef<GetChats.Query>;
+┊  ┊24┊  chats$: Observable<GetChats.Chats[]>;
+┊  ┊25┊  chats: GetChats.Chats[];
 ┊17┊26┊
-┊18┊  ┊  constructor(private apollo: Apollo) {}
-┊19┊  ┊
-┊20┊  ┊  getChats() {
-┊21┊  ┊    const query = this.apollo.watchQuery<GetChats.Query>(<WatchQueryOptions>{
+┊  ┊27┊  constructor(private apollo: Apollo) {
+┊  ┊28┊    this.getChatsWq = this.apollo.watchQuery<GetChats.Query>(<WatchQueryOptions>{
 ┊22┊29┊      query: getChatsQuery,
 ┊23┊30┊      variables: {
 ┊24┊31┊        amount: this.messagesAmount,
 ┊25┊32┊      },
 ┊26┊33┊    });
-┊27┊  ┊    const chats$ = query.valueChanges.pipe(
+┊  ┊34┊    this.chats$ = this.getChatsWq.valueChanges.pipe(
 ┊28┊35┊      map((result: ApolloQueryResult<GetChats.Query>) => result.data.chats)
 ┊29┊36┊    );
+┊  ┊37┊    this.chats$.subscribe(chats => this.chats = chats);
+┊  ┊38┊  }
 ┊30┊39┊
-┊31┊  ┊    return {query, chats$};
+┊  ┊40┊  getChats() {
+┊  ┊41┊    return {query: this.getChatsWq, chats$: this.chats$};
 ┊32┊42┊  }
 ┊33┊43┊
 ┊34┊44┊  getChat(chatId: string) {
```
```diff
@@ -195,4 +205,85 @@
 ┊195┊205┊      },
 ┊196┊206┊    });
 ┊197┊207┊  }
+┊   ┊208┊
+┊   ┊209┊  getUsers() {
+┊   ┊210┊    const query = this.apollo.watchQuery<GetUsers.Query>(<WatchQueryOptions>{
+┊   ┊211┊      query: getUsersQuery,
+┊   ┊212┊    });
+┊   ┊213┊    const users$ = query.valueChanges.pipe(
+┊   ┊214┊      map((result: ApolloQueryResult<GetUsers.Query>) => result.data.users)
+┊   ┊215┊    );
+┊   ┊216┊
+┊   ┊217┊    return {query, users$};
+┊   ┊218┊  }
+┊   ┊219┊
+┊   ┊220┊  // Checks if the chat is listed for the current user and returns the id
+┊   ┊221┊  getChatId(recipientId: string) {
+┊   ┊222┊    const _chat = this.chats.find(chat => {
+┊   ┊223┊      return !chat.isGroup && !!chat.allTimeMembers.find(user => user.id === currentUserId) &&
+┊   ┊224┊        !!chat.allTimeMembers.find(user => user.id === recipientId);
+┊   ┊225┊    });
+┊   ┊226┊    return _chat ? _chat.id : false;
+┊   ┊227┊  }
+┊   ┊228┊
+┊   ┊229┊  addChat(recipientId: string) {
+┊   ┊230┊    return this.apollo.mutate({
+┊   ┊231┊      mutation: addChatMutation,
+┊   ┊232┊      variables: <AddChat.Variables>{
+┊   ┊233┊        recipientId,
+┊   ┊234┊      },
+┊   ┊235┊      update: (store, { data: { addChat } }) => {
+┊   ┊236┊        // Read the data from our cache for this query.
+┊   ┊237┊        const {chats}: GetChats.Query = store.readQuery({
+┊   ┊238┊          query: getChatsQuery,
+┊   ┊239┊          variables: <GetChats.Variables>{
+┊   ┊240┊            amount: this.messagesAmount,
+┊   ┊241┊          },
+┊   ┊242┊        });
+┊   ┊243┊        // Add our comment from the mutation to the end.
+┊   ┊244┊        chats.push(addChat);
+┊   ┊245┊        // Write our data back to the cache.
+┊   ┊246┊        store.writeQuery({
+┊   ┊247┊          query: getChatsQuery,
+┊   ┊248┊          variables: <GetChats.Variables>{
+┊   ┊249┊            amount: this.messagesAmount,
+┊   ┊250┊          },
+┊   ┊251┊          data: {
+┊   ┊252┊            chats,
+┊   ┊253┊          },
+┊   ┊254┊        });
+┊   ┊255┊      },
+┊   ┊256┊    });
+┊   ┊257┊  }
+┊   ┊258┊
+┊   ┊259┊  addGroup(recipientIds: string[], groupName: string) {
+┊   ┊260┊    return this.apollo.mutate({
+┊   ┊261┊      mutation: addGroupMutation,
+┊   ┊262┊      variables: <AddGroup.Variables>{
+┊   ┊263┊        recipientIds,
+┊   ┊264┊        groupName,
+┊   ┊265┊      },
+┊   ┊266┊      update: (store, { data: { addGroup } }) => {
+┊   ┊267┊        // Read the data from our cache for this query.
+┊   ┊268┊        const {chats}: GetChats.Query = store.readQuery({
+┊   ┊269┊          query: getChatsQuery,
+┊   ┊270┊          variables: <GetChats.Variables>{
+┊   ┊271┊            amount: this.messagesAmount,
+┊   ┊272┊          },
+┊   ┊273┊        });
+┊   ┊274┊        // Add our comment from the mutation to the end.
+┊   ┊275┊        chats.push(addGroup);
+┊   ┊276┊        // Write our data back to the cache.
+┊   ┊277┊        store.writeQuery({
+┊   ┊278┊          query: getChatsQuery,
+┊   ┊279┊          variables: <GetChats.Variables>{
+┊   ┊280┊            amount: this.messagesAmount,
+┊   ┊281┊          },
+┊   ┊282┊          data: {
+┊   ┊283┊            chats,
+┊   ┊284┊          },
+┊   ┊285┊        });
+┊   ┊286┊      },
+┊   ┊287┊    });
+┊   ┊288┊  }
 ┊198┊289┊}
```

##### Added src&#x2F;graphql&#x2F;addChat.mutation.ts
```diff
@@ -0,0 +1,17 @@
+┊  ┊ 1┊import gql from 'graphql-tag';
+┊  ┊ 2┊import {fragments} from './fragment';
+┊  ┊ 3┊
+┊  ┊ 4┊// We use the gql tag to parse our query string into a query document
+┊  ┊ 5┊export const addChatMutation = gql`
+┊  ┊ 6┊  mutation AddChat($recipientId: ID!) {
+┊  ┊ 7┊    addChat(recipientId: $recipientId) {
+┊  ┊ 8┊      ...ChatWithoutMessages
+┊  ┊ 9┊      messages {
+┊  ┊10┊        ...Message
+┊  ┊11┊      }
+┊  ┊12┊    }
+┊  ┊13┊  }
+┊  ┊14┊
+┊  ┊15┊  ${fragments['chatWithoutMessages']}
+┊  ┊16┊  ${fragments['message']}
+┊  ┊17┊`;
```

##### Added src&#x2F;graphql&#x2F;addGroup.mutation.ts
```diff
@@ -0,0 +1,17 @@
+┊  ┊ 1┊import gql from 'graphql-tag';
+┊  ┊ 2┊import {fragments} from './fragment';
+┊  ┊ 3┊
+┊  ┊ 4┊// We use the gql tag to parse our query string into a query document
+┊  ┊ 5┊export const addGroupMutation = gql`
+┊  ┊ 6┊  mutation AddGroup($recipientIds: [ID!]!, $groupName: String!) {
+┊  ┊ 7┊    addGroup(recipientIds: $recipientIds, groupName: $groupName) {
+┊  ┊ 8┊      ...ChatWithoutMessages
+┊  ┊ 9┊      messages {
+┊  ┊10┊        ...Message
+┊  ┊11┊      }
+┊  ┊12┊    }
+┊  ┊13┊  }
+┊  ┊14┊
+┊  ┊15┊  ${fragments['chatWithoutMessages']}
+┊  ┊16┊  ${fragments['message']}
+┊  ┊17┊`;
```

##### Added src&#x2F;graphql&#x2F;getUsers.query.ts
```diff
@@ -0,0 +1,12 @@
+┊  ┊ 1┊import gql from 'graphql-tag';
+┊  ┊ 2┊
+┊  ┊ 3┊// We use the gql tag to parse our query string into a query document
+┊  ┊ 4┊export const getUsersQuery = gql`
+┊  ┊ 5┊  query GetUsers {
+┊  ┊ 6┊    users {
+┊  ┊ 7┊      id,
+┊  ┊ 8┊      name,
+┊  ┊ 9┊      picture,
+┊  ┊10┊    }
+┊  ┊11┊  }
+┊  ┊12┊`;
```

##### Changed src&#x2F;types.d.ts
```diff
@@ -117,6 +117,37 @@
 ┊117┊117┊
 ┊118┊118┊export type MessageType = "LOCATION" | "TEXT" | "PICTURE";
 ┊119┊119┊
+┊   ┊120┊export namespace AddChat {
+┊   ┊121┊  export type Variables = {
+┊   ┊122┊    recipientId: string;
+┊   ┊123┊  }
+┊   ┊124┊
+┊   ┊125┊  export type Mutation = {
+┊   ┊126┊    addChat?: AddChat | null; 
+┊   ┊127┊  } 
+┊   ┊128┊
+┊   ┊129┊  export type AddChat = {
+┊   ┊130┊    messages: Messages[]; 
+┊   ┊131┊  } & ChatWithoutMessages.Fragment
+┊   ┊132┊
+┊   ┊133┊  export type Messages = Message.Fragment
+┊   ┊134┊}
+┊   ┊135┊export namespace AddGroup {
+┊   ┊136┊  export type Variables = {
+┊   ┊137┊    recipientIds: string[];
+┊   ┊138┊    groupName: string;
+┊   ┊139┊  }
+┊   ┊140┊
+┊   ┊141┊  export type Mutation = {
+┊   ┊142┊    addGroup?: AddGroup | null; 
+┊   ┊143┊  } 
+┊   ┊144┊
+┊   ┊145┊  export type AddGroup = {
+┊   ┊146┊    messages: Messages[]; 
+┊   ┊147┊  } & ChatWithoutMessages.Fragment
+┊   ┊148┊
+┊   ┊149┊  export type Messages = Message.Fragment
+┊   ┊150┊}
 ┊120┊151┊export namespace AddMessage {
 ┊121┊152┊  export type Variables = {
 ┊122┊153┊    chatId: string;
```
```diff
@@ -159,6 +190,49 @@
 ┊159┊190┊
 ┊160┊191┊  export type Messages = Message.Fragment
 ┊161┊192┊}
+┊   ┊193┊export namespace GetUsers {
+┊   ┊194┊  export type Variables = {
+┊   ┊195┊  }
+┊   ┊196┊
+┊   ┊197┊  export type Query = {
+┊   ┊198┊    users: Users[]; 
+┊   ┊199┊  } 
+┊   ┊200┊
+┊   ┊201┊  export type Users = {
+┊   ┊202┊    id: string; 
+┊   ┊203┊    name?: string | null; 
+┊   ┊204┊    picture?: string | null; 
+┊   ┊205┊  } 
+┊   ┊206┊}
+┊   ┊207┊export namespace RemoveAllMessages {
+┊   ┊208┊  export type Variables = {
+┊   ┊209┊    chatId: string;
+┊   ┊210┊    all?: boolean | null;
+┊   ┊211┊  }
+┊   ┊212┊
+┊   ┊213┊  export type Mutation = {
+┊   ┊214┊    removeMessages?: string[] | null; 
+┊   ┊215┊  } 
+┊   ┊216┊}
+┊   ┊217┊export namespace RemoveChat {
+┊   ┊218┊  export type Variables = {
+┊   ┊219┊    chatId: string;
+┊   ┊220┊  }
+┊   ┊221┊
+┊   ┊222┊  export type Mutation = {
+┊   ┊223┊    removeChat?: string | null; 
+┊   ┊224┊  } 
+┊   ┊225┊}
+┊   ┊226┊export namespace RemoveMessages {
+┊   ┊227┊  export type Variables = {
+┊   ┊228┊    chatId: string;
+┊   ┊229┊    messageIds?: string[] | null;
+┊   ┊230┊  }
+┊   ┊231┊
+┊   ┊232┊  export type Mutation = {
+┊   ┊233┊    removeMessages?: string[] | null; 
+┊   ┊234┊  } 
+┊   ┊235┊}
 ┊162┊236┊
 ┊163┊237┊export namespace ChatWithoutMessages {
 ┊164┊238┊  export type Fragment = {
```
```diff
@@ -206,32 +280,3 @@
 ┊206┊280┊    id: string; 
 ┊207┊281┊  } 
 ┊208┊282┊}
-┊209┊   ┊export namespace RemoveAllMessages {
-┊210┊   ┊  export type Variables = {
-┊211┊   ┊    chatId: string;
-┊212┊   ┊    all?: boolean | null;
-┊213┊   ┊  }
-┊214┊   ┊
-┊215┊   ┊  export type Mutation = {
-┊216┊   ┊    removeMessages?: string[] | null; 
-┊217┊   ┊  } 
-┊218┊   ┊}
-┊219┊   ┊export namespace RemoveChat {
-┊220┊   ┊  export type Variables = {
-┊221┊   ┊    chatId: string;
-┊222┊   ┊  }
-┊223┊   ┊
-┊224┊   ┊  export type Mutation = {
-┊225┊   ┊    removeChat?: string | null; 
-┊226┊   ┊  } 
-┊227┊   ┊}
-┊228┊   ┊export namespace RemoveMessages {
-┊229┊   ┊  export type Variables = {
-┊230┊   ┊    chatId: string;
-┊231┊   ┊    messageIds?: string[] | null;
-┊232┊   ┊  }
-┊233┊   ┊
-┊234┊   ┊  export type Mutation = {
-┊235┊   ┊    removeMessages?: string[] | null; 
-┊236┊   ┊  } 
-┊237┊   ┊}
```

[}]: #

# Chapter 13

Now let's start our client in production mode:

    $ ng serve --prod

Now open the Chrome Developers Tools and, in the Network tab, select 'Slow 3G Network' and 'Disable cache'.
Now refresh the page and look at the DOMContentLoaded time and at the transferred size. You'll notice that our bundle size is quite small and so the loads time.
Now let's click on a specific chat. It will take some time to load the data. Now let's add a new message. Once again it will take some time to load the data. We could also create a new chat and the result would be the same. The whole app doesn't 
feel as snappier as the real Whatsapp on a slow 3G Network.
"That's normal, it's a web application with a remote db while Whatsapp is a native app with a local database..."
That's just an excuse, because we can do as good as Whatsapp thanks to Apollo!

Let's start by making our UI optimistic. We can predict most of the response we will get from our server, except for a few things like `id` of newly created messages. But since we don't really need that id, we can simply generate a fake one 
which will be later overridden once we get the response from the server:

[{]: <helper> (diffStep "9.1")

#### Step 9.1: Optimistic updates

##### Changed package.json
```diff
@@ -34,6 +34,7 @@
 ┊34┊34┊    "graphql": "0.12.3",
 ┊35┊35┊    "graphql-tag": "2.7.3",
 ┊36┊36┊    "hammerjs": "2.0.8",
+┊  ┊37┊    "moment": "2.20.1",
 ┊37┊38┊    "ng2-truncate": "1.3.11",
 ┊38┊39┊    "ngx-selectable-list": "1.1.0",
 ┊39┊40┊    "rxjs": "5.5.6",
```

##### Changed src&#x2F;app&#x2F;chats-creation&#x2F;containers&#x2F;new-chat&#x2F;new-chat.component.ts
```diff
@@ -51,7 +51,7 @@
 ┊51┊51┊      // Chat is already listed for the current user
 ┊52┊52┊      this.router.navigate(['/chat', chatId]);
 ┊53┊53┊    } else {
-┊54┊  ┊      this.chatsService.addChat(recipientId).subscribe(({data: {addChat: {id}}}: { data: AddChat.Mutation }) => {
+┊  ┊54┊      this.chatsService.addChat(recipientId, this.users).subscribe(({data: {addChat: {id}}}: { data: AddChat.Mutation }) => {
 ┊55┊55┊        this.router.navigate(['/chat', id]);
 ┊56┊56┊      });
 ┊57┊57┊    }
```

##### Changed src&#x2F;app&#x2F;services&#x2F;chats.service.ts
```diff
@@ -14,8 +14,10 @@
 ┊14┊14┊import {Observable} from 'rxjs/Observable';
 ┊15┊15┊import {addChatMutation} from '../../graphql/addChat.mutation';
 ┊16┊16┊import {addGroupMutation} from '../../graphql/addGroup.mutation';
+┊  ┊17┊import * as moment from 'moment';
 ┊17┊18┊
 ┊18┊19┊const currentUserId = '1';
+┊  ┊20┊const currentUserName = 'Ethan Gonzalez';
 ┊19┊21┊
 ┊20┊22┊@Injectable()
 ┊21┊23┊export class ChatsService {
```
```diff
@@ -37,6 +39,10 @@
 ┊37┊39┊    this.chats$.subscribe(chats => this.chats = chats);
 ┊38┊40┊  }
 ┊39┊41┊
+┊  ┊42┊  static getRandomId() {
+┊  ┊43┊    return String(Math.round(Math.random() * 1000000000000));
+┊  ┊44┊  }
+┊  ┊45┊
 ┊40┊46┊  getChats() {
 ┊41┊47┊    return {query: this.getChatsWq, chats$: this.chats$};
 ┊42┊48┊  }
```
```diff
@@ -63,6 +69,24 @@
 ┊63┊69┊        chatId,
 ┊64┊70┊        content,
 ┊65┊71┊      },
+┊  ┊72┊      optimisticResponse: {
+┊  ┊73┊        __typename: 'Mutation',
+┊  ┊74┊        addMessage: {
+┊  ┊75┊          id: ChatsService.getRandomId(),
+┊  ┊76┊          __typename: 'Message',
+┊  ┊77┊          senderId: currentUserId,
+┊  ┊78┊          sender: {
+┊  ┊79┊            id: currentUserId,
+┊  ┊80┊            __typename: 'User',
+┊  ┊81┊            name: currentUserName,
+┊  ┊82┊          },
+┊  ┊83┊          content,
+┊  ┊84┊          createdAt: moment().unix(),
+┊  ┊85┊          type: 0,
+┊  ┊86┊          recipients: [],
+┊  ┊87┊          ownership: true,
+┊  ┊88┊        },
+┊  ┊89┊      },
 ┊66┊90┊      update: (store, { data: { addMessage } }: {data: AddMessage.Mutation}) => {
 ┊67┊91┊        // Update the messages cache
 ┊68┊92┊        {
```
```diff
@@ -109,6 +133,10 @@
 ┊109┊133┊      variables: <RemoveChat.Variables>{
 ┊110┊134┊        chatId,
 ┊111┊135┊      },
+┊   ┊136┊      optimisticResponse: {
+┊   ┊137┊        __typename: 'Mutation',
+┊   ┊138┊        removeChat: chatId,
+┊   ┊139┊      },
 ┊112┊140┊      update: (store, { data: { removeChat } }) => {
 ┊113┊141┊        // Read the data from our cache for this query.
 ┊114┊142┊        const {chats}: GetChats.Query = store.readQuery({
```
```diff
@@ -155,6 +183,10 @@
 ┊155┊183┊    return this.apollo.mutate(<MutationOptions>{
 ┊156┊184┊      mutation,
 ┊157┊185┊      variables,
+┊   ┊186┊      optimisticResponse: {
+┊   ┊187┊        __typename: 'Mutation',
+┊   ┊188┊        removeMessages: ids,
+┊   ┊189┊      },
 ┊158┊190┊      update: (store, { data: { removeMessages } }: {data: RemoveMessages.Mutation | RemoveAllMessages.Mutation}) => {
 ┊159┊191┊        // Update the messages cache
 ┊160┊192┊        {
```
```diff
@@ -185,12 +217,9 @@
 ┊185┊217┊            },
 ┊186┊218┊          });
 ┊187┊219┊          // Fix last message
-┊188┊   ┊          console.log(ids);
-┊189┊   ┊          console.log(chats.find(chat => chat.id === chatId).messages);
 ┊190┊220┊          chats.find(chat => chat.id === chatId).messages = messages
 ┊191┊221┊            .filter(message => !ids.includes(message.id))
 ┊192┊222┊            .sort((a, b) => Number(b.createdAt) - Number(a.createdAt)) || [];
-┊193┊   ┊          console.log(chats.find(chat => chat.id === chatId).messages);
 ┊194┊223┊          // Write our data back to the cache.
 ┊195┊224┊          store.writeQuery({
 ┊196┊225┊            query: getChatsQuery,
```
```diff
@@ -226,12 +255,34 @@
 ┊226┊255┊    return _chat ? _chat.id : false;
 ┊227┊256┊  }
 ┊228┊257┊
-┊229┊   ┊  addChat(recipientId: string) {
+┊   ┊258┊  addChat(recipientId: string, users: GetUsers.Users[]) {
 ┊230┊259┊    return this.apollo.mutate({
 ┊231┊260┊      mutation: addChatMutation,
 ┊232┊261┊      variables: <AddChat.Variables>{
 ┊233┊262┊        recipientId,
 ┊234┊263┊      },
+┊   ┊264┊      optimisticResponse: {
+┊   ┊265┊        __typename: 'Mutation',
+┊   ┊266┊        addChat: {
+┊   ┊267┊          id: ChatsService.getRandomId(),
+┊   ┊268┊          __typename: 'Chat',
+┊   ┊269┊          name: users.find(user => user.id === recipientId).name,
+┊   ┊270┊          picture: users.find(user => user.id === recipientId).picture,
+┊   ┊271┊          allTimeMembers: [
+┊   ┊272┊            {
+┊   ┊273┊              id: currentUserId,
+┊   ┊274┊              __typename: 'User',
+┊   ┊275┊            },
+┊   ┊276┊            {
+┊   ┊277┊              id: recipientId,
+┊   ┊278┊              __typename: 'User',
+┊   ┊279┊            }
+┊   ┊280┊          ],
+┊   ┊281┊          unreadMessages: 0,
+┊   ┊282┊          messages: [],
+┊   ┊283┊          isGroup: false,
+┊   ┊284┊        },
+┊   ┊285┊      },
 ┊235┊286┊      update: (store, { data: { addChat } }) => {
 ┊236┊287┊        // Read the data from our cache for this query.
 ┊237┊288┊        const {chats}: GetChats.Query = store.readQuery({
```
```diff
@@ -263,6 +314,26 @@
 ┊263┊314┊        recipientIds,
 ┊264┊315┊        groupName,
 ┊265┊316┊      },
+┊   ┊317┊      optimisticResponse: {
+┊   ┊318┊        __typename: 'Mutation',
+┊   ┊319┊        addGroup: {
+┊   ┊320┊          id: ChatsService.getRandomId(),
+┊   ┊321┊          __typename: 'Chat',
+┊   ┊322┊          name: groupName,
+┊   ┊323┊          picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg',
+┊   ┊324┊          userIds: [currentUserId, recipientIds],
+┊   ┊325┊          allTimeMembers: [
+┊   ┊326┊            {
+┊   ┊327┊              id: currentUserId,
+┊   ┊328┊              __typename: 'User',
+┊   ┊329┊            },
+┊   ┊330┊            ...recipientIds.map(id => ({id, __typename: 'User'})),
+┊   ┊331┊          ],
+┊   ┊332┊          unreadMessages: 0,
+┊   ┊333┊          messages: [],
+┊   ┊334┊          isGroup: true,
+┊   ┊335┊        },
+┊   ┊336┊      },
 ┊266┊337┊      update: (store, { data: { addGroup } }) => {
 ┊267┊338┊        // Read the data from our cache for this query.
 ┊268┊339┊        const {chats}: GetChats.Query = store.readQuery({
```

[}]: #

Now let's get the chat data from our chats cache while waiting for the server response. We will initially be able to show only the chat name, the last message and a few more informations instead of the whole content from the server, but that 
would be more than enough to entertain the user while waiting for the server's response:

[{]: <helper> (diffStep "9.2")

#### Step 9.2: Get chat data from chats cache while waiting for server response

##### Changed src&#x2F;app&#x2F;services&#x2F;chats.service.ts
```diff
@@ -1,5 +1,5 @@
 ┊1┊1┊import {ApolloQueryResult, MutationOptions, WatchQueryOptions} from 'apollo-client';
-┊2┊ ┊import {map} from 'rxjs/operators';
+┊ ┊2┊import {concat, map} from 'rxjs/operators';
 ┊3┊3┊import {Apollo, QueryRef} from 'apollo-angular';
 ┊4┊4┊import {Injectable} from '@angular/core';
 ┊5┊5┊import {getChatsQuery} from '../../graphql/getChats.query';
```
```diff
@@ -15,6 +15,8 @@
 ┊15┊15┊import {addChatMutation} from '../../graphql/addChat.mutation';
 ┊16┊16┊import {addGroupMutation} from '../../graphql/addGroup.mutation';
 ┊17┊17┊import * as moment from 'moment';
+┊  ┊18┊import {AsyncSubject} from 'rxjs/AsyncSubject';
+┊  ┊19┊import {of} from 'rxjs/observable/of';
 ┊18┊20┊
 ┊19┊21┊const currentUserId = '1';
 ┊20┊22┊const currentUserName = 'Ethan Gonzalez';
```
```diff
@@ -25,6 +27,7 @@
 ┊25┊27┊  getChatsWq: QueryRef<GetChats.Query>;
 ┊26┊28┊  chats$: Observable<GetChats.Chats[]>;
 ┊27┊29┊  chats: GetChats.Chats[];
+┊  ┊30┊  getChatWqSubject: AsyncSubject<QueryRef<GetChat.Query>>;
 ┊28┊31┊
 ┊29┊32┊  constructor(private apollo: Apollo) {
 ┊30┊33┊    this.getChatsWq = this.apollo.watchQuery<GetChats.Query>(<WatchQueryOptions>{
```
```diff
@@ -48,18 +51,34 @@
 ┊48┊51┊  }
 ┊49┊52┊
 ┊50┊53┊  getChat(chatId: string) {
+┊  ┊54┊    const _chat = this.chats && this.chats.find(chat => chat.id === chatId) || {
+┊  ┊55┊      id: chatId,
+┊  ┊56┊      name: '',
+┊  ┊57┊      picture: null,
+┊  ┊58┊      allTimeMembers: [],
+┊  ┊59┊      unreadMessages: 0,
+┊  ┊60┊      isGroup: false,
+┊  ┊61┊      messages: [],
+┊  ┊62┊    };
+┊  ┊63┊    const chat$FromCache = of<GetChat.Chat>(_chat);
+┊  ┊64┊
 ┊51┊65┊    const query = this.apollo.watchQuery<GetChat.Query>({
 ┊52┊66┊      query: getChatQuery,
 ┊53┊67┊      variables: {
-┊54┊  ┊        chatId: chatId,
+┊  ┊68┊        chatId,
 ┊55┊69┊      }
 ┊56┊70┊    });
 ┊57┊71┊
-┊58┊  ┊    const chat$ = query.valueChanges.pipe(
-┊59┊  ┊      map((result: ApolloQueryResult<GetChat.Query>) => result.data.chat)
-┊60┊  ┊    );
+┊  ┊72┊    const chat$ = chat$FromCache.pipe(
+┊  ┊73┊      concat(query.valueChanges.pipe(
+┊  ┊74┊        map((result: ApolloQueryResult<GetChat.Query>) => result.data.chat)
+┊  ┊75┊      )));
+┊  ┊76┊
+┊  ┊77┊    this.getChatWqSubject = new AsyncSubject();
+┊  ┊78┊    this.getChatWqSubject.next(query);
+┊  ┊79┊    this.getChatWqSubject.complete();
 ┊61┊80┊
-┊62┊  ┊    return {query, chat$};
+┊  ┊81┊    return {query$: this.getChatWqSubject.asObservable(), chat$};
 ┊63┊82┊  }
 ┊64┊83┊
 ┊65┊84┊  addMessage(chatId: string, content: string) {
```

[}]: #

Now let's deal with the most difficult part: how to deal with chats creation? Now we wouldn't be able to predict the `id` of the new chat and so we cannot navigate to the chat page because it contains the chat id in the url. We could simply 
navigate to the "optimistic" ui, but then the user wouldn't be able to navigate back to that url if he refreshes the page or bookmarks it. That's a problem we care about. How to solve it? We're going to create a landing page and we will later 
override the url once we get the response from the server!

[{]: <helper> (diffStep "9.3")

#### Step 9.3: Landing page for new chats/groups

##### Changed src&#x2F;app&#x2F;chat-viewer&#x2F;containers&#x2F;chat&#x2F;chat.component.spec.ts
```diff
@@ -104,7 +104,10 @@
 ┊104┊104┊        Apollo,
 ┊105┊105┊        {
 ┊106┊106┊          provide: ActivatedRoute,
-┊107┊   ┊          useValue: { params: of({ id: chat.id }) }
+┊   ┊107┊          useValue: {
+┊   ┊108┊            params: of({ id: chat.id }),
+┊   ┊109┊            queryParams: of({}),
+┊   ┊110┊          }
 ┊108┊111┊        }
 ┊109┊112┊      ],
 ┊110┊113┊      schemas: [NO_ERRORS_SCHEMA]
```

##### Changed src&#x2F;app&#x2F;chat-viewer&#x2F;containers&#x2F;chat&#x2F;chat.component.ts
```diff
@@ -2,6 +2,8 @@
 ┊2┊2┊import {ActivatedRoute, Router} from '@angular/router';
 ┊3┊3┊import {ChatsService} from '../../../services/chats.service';
 ┊4┊4┊import {GetChat} from '../../../../types';
+┊ ┊5┊import {combineLatest} from 'rxjs/observable/combineLatest';
+┊ ┊6┊import {Location} from '@angular/common';
 ┊5┊7┊
 ┊6┊8┊@Component({
 ┊7┊9┊  template: `
```
```diff
@@ -26,21 +28,40 @@
 ┊26┊28┊  messages: GetChat.Messages[];
 ┊27┊29┊  name: string;
 ┊28┊30┊  isGroup: boolean;
+┊  ┊31┊  optimisticUI: boolean;
 ┊29┊32┊
 ┊30┊33┊  constructor(private route: ActivatedRoute,
 ┊31┊34┊              private router: Router,
+┊  ┊35┊              private location: Location,
 ┊32┊36┊              private chatsService: ChatsService) {
 ┊33┊37┊  }
 ┊34┊38┊
 ┊35┊39┊  ngOnInit() {
-┊36┊  ┊    this.route.params.subscribe(({id: chatId}) => {
-┊37┊  ┊      this.chatId = chatId;
-┊38┊  ┊      this.chatsService.getChat(chatId).chat$.subscribe(chat => {
-┊39┊  ┊        this.messages = chat.messages;
-┊40┊  ┊        this.name = chat.name;
-┊41┊  ┊        this.isGroup = chat.isGroup;
+┊  ┊40┊    combineLatest(this.route.params, this.route.queryParams,
+┊  ┊41┊      (params: { id: string }, queryParams: { oui?: boolean }) => ({params, queryParams}))
+┊  ┊42┊      .subscribe(({params: {id: chatId}, queryParams: {oui}}) => {
+┊  ┊43┊        this.chatId = chatId;
+┊  ┊44┊
+┊  ┊45┊        this.optimisticUI = oui;
+┊  ┊46┊
+┊  ┊47┊        if (this.optimisticUI) {
+┊  ┊48┊          // We are using fake IDs generated by the Optimistic UI
+┊  ┊49┊          this.chatsService.addChat$.subscribe(({data: {addChat, addGroup}}) => {
+┊  ┊50┊            this.chatId = addChat ? addChat.id : addGroup.id;
+┊  ┊51┊            console.log(`Switching from the Optimistic UI id ${chatId} to ${this.chatId}`);
+┊  ┊52┊            // Rewrite the URL
+┊  ┊53┊            this.location.go(`chat/${this.chatId}`);
+┊  ┊54┊            // Optimistic UI no more
+┊  ┊55┊            this.optimisticUI = false;
+┊  ┊56┊          });
+┊  ┊57┊        }
+┊  ┊58┊
+┊  ┊59┊        this.chatsService.getChat(chatId, this.optimisticUI).chat$.subscribe(chat => {
+┊  ┊60┊          this.messages = chat.messages;
+┊  ┊61┊          this.name = chat.name;
+┊  ┊62┊          this.isGroup = chat.isGroup;
+┊  ┊63┊        });
 ┊42┊64┊      });
-┊43┊  ┊    });
 ┊44┊65┊  }
 ┊45┊66┊
 ┊46┊67┊  goToChats() {
```

##### Changed src&#x2F;app&#x2F;chats-creation&#x2F;containers&#x2F;new-chat&#x2F;new-chat.component.ts
```diff
@@ -51,9 +51,10 @@
 ┊51┊51┊      // Chat is already listed for the current user
 ┊52┊52┊      this.router.navigate(['/chat', chatId]);
 ┊53┊53┊    } else {
-┊54┊  ┊      this.chatsService.addChat(recipientId, this.users).subscribe(({data: {addChat: {id}}}: { data: AddChat.Mutation }) => {
-┊55┊  ┊        this.router.navigate(['/chat', id]);
-┊56┊  ┊      });
+┊  ┊54┊      // Generate id for Optimistic UI
+┊  ┊55┊      const ouiId = ChatsService.getRandomId();
+┊  ┊56┊      this.chatsService.addChat(recipientId, this.users, ouiId).subscribe();
+┊  ┊57┊      this.router.navigate(['/chat', ouiId], {queryParams: {oui: true}, skipLocationChange: true});
 ┊57┊58┊    }
 ┊58┊59┊  }
 ┊59┊60┊}
```

##### Changed src&#x2F;app&#x2F;chats-creation&#x2F;containers&#x2F;new-group&#x2F;new-group.component.ts
```diff
@@ -52,9 +52,9 @@
 ┊52┊52┊
 ┊53┊53┊  addGroup(groupName: string) {
 ┊54┊54┊    if (groupName && this.recipientIds.length) {
-┊55┊  ┊      this.chatsService.addGroup(this.recipientIds, groupName).subscribe(({data: {addGroup: {id}}}: { data: AddGroup.Mutation }) => {
-┊56┊  ┊        this.router.navigate(['/chat', id]);
-┊57┊  ┊      });
+┊  ┊55┊      const ouiId = ChatsService.getRandomId();
+┊  ┊56┊      this.chatsService.addGroup(this.recipientIds, groupName, ouiId).subscribe();
+┊  ┊57┊      this.router.navigate(['/chat', ouiId], {queryParams: {oui: true}, skipLocationChange: true});
 ┊58┊58┊    }
 ┊59┊59┊  }
 ┊60┊60┊}
```

##### Changed src&#x2F;app&#x2F;services&#x2F;chats.service.ts
```diff
@@ -1,5 +1,5 @@
 ┊1┊1┊import {ApolloQueryResult, MutationOptions, WatchQueryOptions} from 'apollo-client';
-┊2┊ ┊import {concat, map} from 'rxjs/operators';
+┊ ┊2┊import {concat, map, share, switchMap} from 'rxjs/operators';
 ┊3┊3┊import {Apollo, QueryRef} from 'apollo-angular';
 ┊4┊4┊import {Injectable} from '@angular/core';
 ┊5┊5┊import {getChatsQuery} from '../../graphql/getChats.query';
```
```diff
@@ -17,6 +17,7 @@
 ┊17┊17┊import * as moment from 'moment';
 ┊18┊18┊import {AsyncSubject} from 'rxjs/AsyncSubject';
 ┊19┊19┊import {of} from 'rxjs/observable/of';
+┊  ┊20┊import {FetchResult} from 'apollo-link';
 ┊20┊21┊
 ┊21┊22┊const currentUserId = '1';
 ┊22┊23┊const currentUserName = 'Ethan Gonzalez';
```
```diff
@@ -28,6 +29,7 @@
 ┊28┊29┊  chats$: Observable<GetChats.Chats[]>;
 ┊29┊30┊  chats: GetChats.Chats[];
 ┊30┊31┊  getChatWqSubject: AsyncSubject<QueryRef<GetChat.Query>>;
+┊  ┊32┊  addChat$: Observable<FetchResult<AddChat.Mutation | AddGroup.Mutation>>;
 ┊31┊33┊
 ┊32┊34┊  constructor(private apollo: Apollo) {
 ┊33┊35┊    this.getChatsWq = this.apollo.watchQuery<GetChats.Query>(<WatchQueryOptions>{
```
```diff
@@ -50,7 +52,7 @@
 ┊50┊52┊    return {query: this.getChatsWq, chats$: this.chats$};
 ┊51┊53┊  }
 ┊52┊54┊
-┊53┊  ┊  getChat(chatId: string) {
+┊  ┊55┊  getChat(chatId: string, oui?: boolean) {
 ┊54┊56┊    const _chat = this.chats && this.chats.find(chat => chat.id === chatId) || {
 ┊55┊57┊      id: chatId,
 ┊56┊58┊      name: '',
```
```diff
@@ -62,21 +64,39 @@
 ┊ 62┊ 64┊    };
 ┊ 63┊ 65┊    const chat$FromCache = of<GetChat.Chat>(_chat);
 ┊ 64┊ 66┊
-┊ 65┊   ┊    const query = this.apollo.watchQuery<GetChat.Query>({
-┊ 66┊   ┊      query: getChatQuery,
-┊ 67┊   ┊      variables: {
-┊ 68┊   ┊        chatId,
-┊ 69┊   ┊      }
-┊ 70┊   ┊    });
-┊ 71┊   ┊
-┊ 72┊   ┊    const chat$ = chat$FromCache.pipe(
-┊ 73┊   ┊      concat(query.valueChanges.pipe(
-┊ 74┊   ┊        map((result: ApolloQueryResult<GetChat.Query>) => result.data.chat)
-┊ 75┊   ┊      )));
+┊   ┊ 67┊    const getApolloWatchQuery = (id: string) => {
+┊   ┊ 68┊      return this.apollo.watchQuery<GetChat.Query>({
+┊   ┊ 69┊        query: getChatQuery,
+┊   ┊ 70┊        variables: {
+┊   ┊ 71┊          chatId: id,
+┊   ┊ 72┊        }
+┊   ┊ 73┊      });
+┊   ┊ 74┊    };
 ┊ 76┊ 75┊
+┊   ┊ 76┊    let chat$: Observable<GetChat.Chat>;
 ┊ 77┊ 77┊    this.getChatWqSubject = new AsyncSubject();
-┊ 78┊   ┊    this.getChatWqSubject.next(query);
-┊ 79┊   ┊    this.getChatWqSubject.complete();
+┊   ┊ 78┊
+┊   ┊ 79┊    if (oui) {
+┊   ┊ 80┊      chat$ = chat$FromCache.pipe(
+┊   ┊ 81┊        concat(this.addChat$.pipe(
+┊   ┊ 82┊          switchMap(({ data: { addChat, addGroup } }) => {
+┊   ┊ 83┊            const query = getApolloWatchQuery(addChat ? addChat.id : addGroup.id);
+┊   ┊ 84┊            this.getChatWqSubject.next(query);
+┊   ┊ 85┊            this.getChatWqSubject.complete();
+┊   ┊ 86┊            return query.valueChanges.pipe(
+┊   ┊ 87┊              map((result: ApolloQueryResult<GetChat.Query>) => result.data.chat)
+┊   ┊ 88┊            );
+┊   ┊ 89┊          }))
+┊   ┊ 90┊        ));
+┊   ┊ 91┊    } else {
+┊   ┊ 92┊      const query = getApolloWatchQuery(chatId);
+┊   ┊ 93┊      this.getChatWqSubject.next(query);
+┊   ┊ 94┊      this.getChatWqSubject.complete();
+┊   ┊ 95┊      chat$ = chat$FromCache.pipe(
+┊   ┊ 96┊        concat(query.valueChanges.pipe(
+┊   ┊ 97┊          map((result: ApolloQueryResult<GetChat.Query>) => result.data.chat)
+┊   ┊ 98┊        )));
+┊   ┊ 99┊    }
 ┊ 80┊100┊
 ┊ 81┊101┊    return {query$: this.getChatWqSubject.asObservable(), chat$};
 ┊ 82┊102┊  }
```
```diff
@@ -274,8 +294,8 @@
 ┊274┊294┊    return _chat ? _chat.id : false;
 ┊275┊295┊  }
 ┊276┊296┊
-┊277┊   ┊  addChat(recipientId: string, users: GetUsers.Users[]) {
-┊278┊   ┊    return this.apollo.mutate({
+┊   ┊297┊  addChat(recipientId: string, users: GetUsers.Users[], ouiId: string) {
+┊   ┊298┊    this.addChat$ = this.apollo.mutate({
 ┊279┊299┊      mutation: addChatMutation,
 ┊280┊300┊      variables: <AddChat.Variables>{
 ┊281┊301┊        recipientId,
```
```diff
@@ -283,7 +303,7 @@
 ┊283┊303┊      optimisticResponse: {
 ┊284┊304┊        __typename: 'Mutation',
 ┊285┊305┊        addChat: {
-┊286┊   ┊          id: ChatsService.getRandomId(),
+┊   ┊306┊          id: ouiId,
 ┊287┊307┊          __typename: 'Chat',
 ┊288┊308┊          name: users.find(user => user.id === recipientId).name,
 ┊289┊309┊          picture: users.find(user => user.id === recipientId).picture,
```
```diff
@@ -323,11 +343,12 @@
 ┊323┊343┊          },
 ┊324┊344┊        });
 ┊325┊345┊      },
-┊326┊   ┊    });
+┊   ┊346┊    }).pipe(share());
+┊   ┊347┊    return this.addChat$;
 ┊327┊348┊  }
 ┊328┊349┊
-┊329┊   ┊  addGroup(recipientIds: string[], groupName: string) {
-┊330┊   ┊    return this.apollo.mutate({
+┊   ┊350┊  addGroup(recipientIds: string[], groupName: string, ouiId: string) {
+┊   ┊351┊    this.addChat$ = this.apollo.mutate({
 ┊331┊352┊      mutation: addGroupMutation,
 ┊332┊353┊      variables: <AddGroup.Variables>{
 ┊333┊354┊        recipientIds,
```
```diff
@@ -336,7 +357,7 @@
 ┊336┊357┊      optimisticResponse: {
 ┊337┊358┊        __typename: 'Mutation',
 ┊338┊359┊        addGroup: {
-┊339┊   ┊          id: ChatsService.getRandomId(),
+┊   ┊360┊          id: ouiId,
 ┊340┊361┊          __typename: 'Chat',
 ┊341┊362┊          name: groupName,
 ┊342┊363┊          picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg',
```
```diff
@@ -374,6 +395,7 @@
 ┊374┊395┊          },
 ┊375┊396┊        });
 ┊376┊397┊      },
-┊377┊   ┊    });
+┊   ┊398┊    }).pipe(share());
+┊   ┊399┊    return this.addChat$;
 ┊378┊400┊  }
 ┊379┊401┊}
```

[}]: #



[//]: # (foot-start)

[{]: <helper> (navStep)

| [< Previous Step](step8.md) |
|:----------------------|

[}]: #
