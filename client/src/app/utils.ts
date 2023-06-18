import { getColorHexFromIndex } from './providers/protein-theme-provider';

export class Utils {
    /**
     * get CSS styles to get suitable colors 
     * @param index protein index
     * @returns CSS styles
     */
    static getButtonStyles(index: number): Record<string, string> {
        const proteinColor = getColorHexFromIndex(index);

        return Utils.getCssColor(proteinColor);
    }
    static getCssColor(hex: string): Record<string, string> {
        return {
            '--register-button--color': 'white',
            '--register-button--background-color': hex,
            '--register-button--hover-color': hex,
            '--register-button--hover-background-color': 'white',
        };
    }

}
