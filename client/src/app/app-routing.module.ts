import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NavbarLayoutComponent } from './components/navbar-layout/navbar-layout.component';

const routes: Routes = [
    {
        path: '',
        component: NavbarLayoutComponent,
        // children: [
        //     // { path: 'overview', component: OverviewComponent },
        // ] 
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
