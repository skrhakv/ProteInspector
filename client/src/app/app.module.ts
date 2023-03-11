import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarLayoutComponent } from './components/navbar-layout/navbar-layout.component';
import { DatasetService } from './services/dataset.service';

import { HttpClientModule } from '@angular/common/http';
import { HomeComponent } from './components/home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [
        AppComponent,
        NavbarLayoutComponent,
        HomeComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        BrowserAnimationsModule,
        FormsModule
    ],
    providers: [
        DatasetService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
