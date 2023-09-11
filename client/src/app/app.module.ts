import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CookieService } from 'ngx-cookie-service';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarLayoutComponent } from './components/navbar-layout/navbar-layout.component';
import { BackendCommunicationService } from './services/backend-communication.service';

import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HomeComponent } from './components/home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { QueryInterfaceComponent } from './components/query-interface/query-interface.component';
import { DatasetSelectorComponent } from './components/dataset-selector/dataset-selector.component';
import { DetailViewComponent } from './components/detail-view/detail-view.component';
import { FilterService } from './services/filter.service';
import { ResultTableComponent } from './components/result-table/result-table.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { ProteinVisualizationComponent } from './components/protein-visualization/protein-visualization.component';
import { DetailViewButtonGroupComponent } from './components/detail-view-button-group/detail-view-button-group.component';

@NgModule({
    declarations: [
        AppComponent,
        NavbarLayoutComponent,
        HomeComponent,
        QueryInterfaceComponent,
        DatasetSelectorComponent,
        DetailViewComponent,
        ResultTableComponent,
        PaginationComponent,
        ProteinVisualizationComponent,
        DetailViewButtonGroupComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        BrowserAnimationsModule,
        FormsModule
    ],
    providers: [
        BackendCommunicationService,
        CookieService,
        FilterService,
        HttpClient
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
