import { ColorTheme } from 'molstar/lib/mol-theme/color';
import { ThemeDataContext } from 'molstar/lib/mol-theme/theme';
import { ColorNames } from 'molstar/lib/mol-util/color/names';
import { ParamDefinition as PD } from 'molstar/lib/mol-util/param-definition';



const ProteinThemeParams = {
    value: PD.Numeric(0),
};

const colors = [
    ColorNames.green,
    ColorNames.blue,
    ColorNames.orange,
    ColorNames.red,
    ColorNames.black,
    ColorNames.yellow,
    ColorNames.violet,
    ColorNames.grey,
    ColorNames.brown,
    ColorNames.cyan,
    ColorNames.darkred,
    ColorNames.darkgreen,

]

function ProteinTheme(
    ctx: ThemeDataContext,
    props: PD.Values<typeof ProteinThemeParams>
): ColorTheme<typeof ProteinThemeParams> {

    let color = colors[props.value % colors.length];
    return {
        factory: ProteinTheme,
        granularity: 'vertex',
        color: () => {
            return color;
        },
        props: props,
        description: '',
    };
}

export const ProteinThemeProvider: ColorTheme.Provider<typeof ProteinThemeParams, 'protein-color-theme'> = {
    name: 'protein-color-theme',
    label: 'Protein Color Theme',
    category: ColorTheme.Category.Misc,
    factory: ProteinTheme,
    getParams: () => { return ProteinThemeParams },
    defaultValues: PD.getDefaultValues(ProteinThemeParams),
    isApplicable: (ctx: ThemeDataContext) => true,
};
