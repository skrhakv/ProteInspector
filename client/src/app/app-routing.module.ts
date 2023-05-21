import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DatasetSelectorComponent } from './components/dataset-selector/dataset-selector.component';
import { HomeComponent } from './components/home/home.component';
import { NavbarLayoutComponent } from './components/navbar-layout/navbar-layout.component';
import { ProteinViewComponent } from './components/protein-view/protein-view.component';
import { QueryInterfaceComponent } from './components/query-interface/query-interface.component';
import { AboutComponent } from './components/about/about.component';

const routes: Routes = [
    {
        path: '',
        component: NavbarLayoutComponent,
        children: [
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: HomeComponent },
            { path: 'about', component: AboutComponent },
            { path: 'datasets', component: DatasetSelectorComponent },
            { path: 'search', component: QueryInterfaceComponent },
            { path: 'detail/:structure/:id', component: ProteinViewComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
