# Client Documentation
The client web application is implemented in the `client/` folder. Four page layouts were designed:
* `Landing Page` - introduction page when accessing the application,
* `Query Interface Page` - interface for entering & building the query and browsing the results
* `Detail View Page` - view for inspecting details of particular result
* `Dataset Selector Page` - page for selecting the dataset

The implementation is provided in the `client/src/app/` folder.

![Page Navigation](https://github.com/skrhakv/ProteInspector/blob/master/documentation/media/page-navigation.svg)
The picture above shows the interaction between the user and the application with a special focus on the page layout.

## Components
The Angular Components are budles of `.ts`, `.html` and `.css` files, which represent a visual component. The components are located in the `client/src/app/components` folder. `The page layouts are implemented using Angular components as follows:
* `Landing Page` is implemented by the `HomeComponent`,
* `Query Interface Page` - is implemented by the `QueryInterfaceComponent`, `ResultTableComponent` and `PaginationComponent`
* `Detail View Page` - is implemented by the `DetailViewComponent` and `ProteinVisualizationComponent`
* `Dataset Selector Page` - is implemented by the `DatasetSelectorComponent`.

On top of that two additional components were designed:
* `NavbarLayoutComponent` is added to each page to simplify page navigation,
* `AboutComponent` - page with informational purpose.

## Services
This section depicts the individual Angular services and their purpose within the application.

### Backend Communication Service
The `Backend Communication Service` provides the functions for communication with the back-end and holds the informations of the currently selected dataset.
### Molstar Service
The `Molstar Service` handles the customization of the **Mol\*** plugin, such as highlighting the specified domains, toggling the visibility of the structures, changing the representation of the structures, etc.
### Superposition Service
The `Superposition Service` loads the specified protein structures and carries out superposition using the specified mapping.
### External Link Service
This service generates links to other databases, such as Uniprot, PDB, or CATH database. This simplifies the search for more detailed data in other databases.
### Filter Service
This service takes the specification of the query from the dropdown items in the `QueryInterfaceComponent` and generates a valid query in accordance with the custom query language.
### pyMOL Service
To create a pymol script, the `PyMOL Service` can be utilized. The service takes details of the visualized proteins and generates an appropriate script executable by the PyMOL visualization tool.

## ES Lint
To unite the style of the Typescript code and statically analyze the code, a **ES Lint** framework was set up by defining a suite of Lint rules. To run the linter, one can use
```
npm run lint
```
The rules are defined in the `client/.eslintrc.json` file.

## Testing
Angular comes with a build-in support for the Jasmine testing framework. Sets of unit tests are provided in the `.spec.ts` files. To run the tests, one can use
```
npm run test
```
