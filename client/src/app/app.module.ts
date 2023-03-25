import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CookieService } from 'ngx-cookie-service';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarLayoutComponent } from './components/navbar-layout/navbar-layout.component';
import { DatasetService } from './services/dataset.service';

import { HttpClientModule } from '@angular/common/http';
import { HomeComponent } from './components/home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { QueryInterfaceComponent } from './components/query-interface/query-interface.component';
import { DatasetSelectorComponent } from './components/dataset-selector/dataset-selector.component';
import { ProteinViewComponent } from './components/protein-view/protein-view.component';
import { FilterService } from './services/filter.service';

@NgModule({
    declarations: [
        AppComponent,
        NavbarLayoutComponent,
        HomeComponent,
        QueryInterfaceComponent,
        DatasetSelectorComponent,
        ProteinViewComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        BrowserAnimationsModule,
        FormsModule
    ],
    providers: [
        DatasetService,
        CookieService,
        FilterService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
