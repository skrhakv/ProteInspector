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
import { DetailViewComponent } from './components/detail-view/detail-view.component';
import { FilterService } from './services/filter.service';
import { AboutComponent } from './components/about/about.component';
import { ResultTableComponent } from './components/result-table/result-table.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { ProteinVisualizationComponent } from './components/protein-visualization/protein-visualization.component';

@NgModule({
    declarations: [
        AppComponent,
        NavbarLayoutComponent,
        HomeComponent,
        QueryInterfaceComponent,
        DatasetSelectorComponent,
        DetailViewComponent,
        AboutComponent,
        ResultTableComponent,
        PaginationComponent,
        ProteinVisualizationComponent
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
