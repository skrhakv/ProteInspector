import { StructureRepresentationRegistry } from "molstar/lib/mol-repr/structure/registry";

export class AppSettings {
    public static API_ENDPOINT = "http://localhost:3000";
    public static PAGE_SIZE = 100;
    public static PDB_DATABASE_URL = "https://www.rcsb.org/structure/";
    public static CATH_DATABASE_URL = "https://www.cathdb.info/domain/";
    public static UNIPROT_DATABASE_URL = "https://www.uniprot.org/uniprotkb/";
    public static REPRESENTATION_TYPES: Record<StructureRepresentationRegistry.BuiltIn, string> = {
        'cartoon': 'Cartoon',
        'backbone': 'Backbone',
        'ball-and-stick': 'Ball and Stick',
        'carbohydrate': 'Carbohydrate',
        'ellipsoid': 'Ellipsoid',
        'gaussian-surface': 'Gaussian Surface',
        'gaussian-volume': 'Gaussian Volume',
        'label': 'Label',
        'line': 'Line',
        'molecular-surface': 'Molecular Surface',
        'orientation': 'Orientation',
        'point': 'Point',
        'putty': 'Putty',
        'spacefill': 'Spacefill'
    }

}
